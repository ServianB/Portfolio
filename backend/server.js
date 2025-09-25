const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration pour Railway
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';
const isDev = !isProduction;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de sécurité
app.use((req, res, next) => {
  // Headers de sécurité
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Logging des tentatives de connexion
  if (req.path === '/api/login' && req.method === 'POST') {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    console.log(`Tentative de connexion depuis IP: ${clientIP} à ${new Date().toISOString()}`);
  }
  
  next();
});

// Rate limiting simple pour les routes sensibles
const loginAttempts = new Map();

app.use('/api/login', (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10; // 10 tentatives par fenêtre de temps
  
  // Nettoyer les anciennes tentatives
  const userAttempts = loginAttempts.get(clientIP) || [];
  const recentAttempts = userAttempts.filter(time => now - time < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({ 
      error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.' 
    });
  }
  
  // Enregistrer cette tentative
  recentAttempts.push(now);
  loginAttempts.set(clientIP, recentAttempts);
  
  next();
});

app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration multer pour upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = isProduction ? '/tmp/uploads' : path.join(__dirname, 'uploads');
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Vérifier que c'est bien une image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Le fichier doit être une image'), false);
    }
  }
});

// Initialisation de la base de données
const dbPath = isProduction ? '/tmp/portfolio.db' : './portfolio.db';
const db = new sqlite3.Database(dbPath);

// Création des tables
db.serialize(() => {
  // Table des projets
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_fr TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    description_en TEXT NOT NULL,
    technologies TEXT NOT NULL,
    github_url TEXT,
    live_url TEXT,
    image_url TEXT,
    category TEXT NOT NULL,
    featured BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table des utilisateurs admin (avec mot de passe haché)
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  // Migration du schéma : ajouter les nouvelles colonnes de sécurité
  db.all("PRAGMA table_info(admin_users)", (err, columns) => {
    if (err) {
      console.error('Erreur lors de la vérification du schéma:', err);
      return;
    }

    const columnNames = columns.map(col => col.name);
    
    // Ajouter les nouvelles colonnes si elles n'existent pas
    if (!columnNames.includes('salt_rounds')) {
      db.run("ALTER TABLE admin_users ADD COLUMN salt_rounds INTEGER DEFAULT 12", (err) => {
        if (err) console.error('Erreur ajout colonne salt_rounds:', err);
        else console.log('✅ Colonne salt_rounds ajoutée');
      });
    }
    
    if (!columnNames.includes('created_at')) {
      db.run("ALTER TABLE admin_users ADD COLUMN created_at DATETIME", (err) => {
        if (err) console.error('Erreur ajout colonne created_at:', err);
        else {
          console.log('✅ Colonne created_at ajoutée');
          // Mettre à jour les enregistrements existants avec la date actuelle
          db.run("UPDATE admin_users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL");
        }
      });
    }
    
    if (!columnNames.includes('last_login')) {
      db.run("ALTER TABLE admin_users ADD COLUMN last_login DATETIME", (err) => {
        if (err) console.error('Erreur ajout colonne last_login:', err);
        else console.log('✅ Colonne last_login ajoutée');
      });
    }
    
    if (!columnNames.includes('failed_attempts')) {
      db.run("ALTER TABLE admin_users ADD COLUMN failed_attempts INTEGER DEFAULT 0", (err) => {
        if (err) console.error('Erreur ajout colonne failed_attempts:', err);
        else console.log('✅ Colonne failed_attempts ajoutée');
      });
    }
    
    if (!columnNames.includes('locked_until')) {
      db.run("ALTER TABLE admin_users ADD COLUMN locked_until DATETIME", (err) => {
        if (err) console.error('Erreur ajout colonne locked_until:', err);
        else console.log('✅ Colonne locked_until ajoutée');
        
        // Effectuer la migration des mots de passe après ajout des colonnes
        setTimeout(() => migratePlaintextPasswords(), 1000);
      });
    } else {
      // Si toutes les colonnes existent déjà, lancer directement la migration
      migratePlaintextPasswords();
    }
  });

  // Fonction de migration des mots de passe en texte clair
  function migratePlaintextPasswords() {
    // Vérifier et créer l'utilisateur admin par défaut
    db.get(`SELECT COUNT(*) as count FROM admin_users WHERE username = 'admin'`, (err, row) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'utilisateur admin:', err);
        return;
      }
      
      if (row.count === 0) {
        // Créer le hash du mot de passe par défaut
        const defaultPassword = 'portfolio2024';
        const saltRounds = 12;
        
        bcrypt.hash(defaultPassword, saltRounds, (err, hashedPassword) => {
          if (err) {
            console.error('Erreur lors du hachage du mot de passe:', err);
            return;
          }
          
          db.run(`INSERT INTO admin_users (username, password, salt_rounds, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`, 
                 ['admin', hashedPassword, saltRounds], (err) => {
            if (err) {
              console.error('Erreur lors de la création de l\'utilisateur admin:', err);
            } else {
              console.log('🔐 Utilisateur admin créé avec mot de passe haché');
            }
          });
        });
      } else {
        // Vérifier si le mot de passe existant est en texte clair
        db.get(`SELECT password FROM admin_users WHERE username = 'admin'`, (err, user) => {
          if (err) {
            console.error('Erreur lors de la vérification du mot de passe:', err);
            return;
          }
          
          // Si le mot de passe est en texte clair (pas de hash bcrypt)
          if (user && !user.password.startsWith('$2b$') && !user.password.startsWith('$2a$')) {
            console.log('🔄 Migration du mot de passe en texte clair vers hash bcrypt...');
            
            const saltRounds = 12;
            bcrypt.hash(user.password, saltRounds, (err, hashedPassword) => {
              if (err) {
                console.error('Erreur lors du hachage du mot de passe existant:', err);
                return;
              }
              
              db.run(`UPDATE admin_users SET password = ?, salt_rounds = ?, failed_attempts = 0 WHERE username = 'admin'`, 
                     [hashedPassword, saltRounds], (err) => {
                if (err) {
                  console.error('Erreur lors de la mise à jour du mot de passe:', err);
                } else {
                  console.log('✅ Mot de passe migré avec succès vers bcrypt');
                }
              });
            });
          } else if (user && (user.password.startsWith('$2b$') || user.password.startsWith('$2a$'))) {
            console.log('✅ Mot de passe déjà sécurisé avec bcrypt');
          }
        });
      }
    });
  }
});

// Routes API

// Obtenir tous les projets
app.get('/api/projects', (req, res) => {
  const featured = req.query.featured;
  let query = 'SELECT * FROM projects ORDER BY created_at DESC';
  
  if (featured === 'true') {
    query = 'SELECT * FROM projects WHERE featured = 1 ORDER BY created_at DESC';
  }
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ projects: rows });
  });
});

// Obtenir un projet par ID
app.get('/api/projects/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ project: row });
  });
});

// Créer un nouveau projet
app.post('/api/projects', upload.single('image'), (req, res) => {
  try {
    console.log('Création d\'un nouveau projet - Body:', req.body);
    console.log('Fichier uploadé:', req.file ? req.file.filename : 'Aucun fichier');
    
    const {
      title_fr, title_en, description_fr, description_en,
      technologies, github_url, live_url, category, featured
    } = req.body;
    
    // Validation des champs requis
    if (!title_fr || !title_en || !description_fr || !description_en || !technologies || !category) {
      return res.status(400).json({ 
        error: 'Champs requis manquants',
        missing: {
          title_fr: !title_fr,
          title_en: !title_en,
          description_fr: !description_fr,
          description_en: !description_en,
          technologies: !technologies,
          category: !category
        }
      });
    }
    
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const query = `INSERT INTO projects 
      (title_fr, title_en, description_fr, description_en, technologies, github_url, live_url, image_url, category, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    // Convertir featured en nombre (0 ou 1)
    const featuredValue = featured === '1' || featured === 1 || featured === true ? 1 : 0;
    const params = [title_fr, title_en, description_fr, description_en, technologies, github_url, live_url, image_url, category, featuredValue];
    
    console.log('Paramètres de la requête SQL:', params);
    
    db.run(query, params, function(err) {
      if (err) {
        console.error('Erreur lors de l\'insertion:', err);
        res.status(400).json({ error: err.message, details: err });
        return;
      }
      console.log('Projet créé avec succès, ID:', this.lastID);
      res.json({ message: 'Project created successfully', id: this.lastID });
    });
  } catch (error) {
    console.error('Erreur dans la route POST /api/projects:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Mettre à jour un projet
app.put('/api/projects/:id', upload.single('image'), (req, res) => {
  const id = req.params.id;
  const {
    title_fr, title_en, description_fr, description_en,
    technologies, github_url, live_url, category, featured
  } = req.body;
  
  let query = `UPDATE projects SET 
    title_fr = ?, title_en = ?, description_fr = ?, description_en = ?,
    technologies = ?, github_url = ?, live_url = ?, category = ?, featured = ?,
    updated_at = CURRENT_TIMESTAMP`;
  
  // Convertir featured en nombre (0 ou 1)
  const featuredValue = featured === '1' || featured === 1 || featured === true ? 1 : 0;
  let params = [title_fr, title_en, description_fr, description_en, technologies, github_url, live_url, category, featuredValue];
  
  if (req.file) {
    query += ', image_url = ?';
    params.push(`/uploads/${req.file.filename}`);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  db.run(query, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Project updated successfully' });
  });
});

// Supprimer un projet
app.delete('/api/projects/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Project deleted successfully' });
  });
});

// Authentification sécurisée avec bcrypt et protection contre force brute
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Validation des entrées
  if (!username || !password) {
    return res.status(400).json({ error: 'Username et password requis' });
  }
  
  try {
    // Récupérer l'utilisateur avec ses informations de sécurité
    db.get(`SELECT * FROM admin_users WHERE username = ?`, [username], async (err, user) => {
      if (err) {
        console.error('Erreur base de données:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (!user) {
        // Délai artificiel pour éviter le timing attack
        await new Promise(resolve => setTimeout(resolve, 1000));
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
      
      // Vérifier si le compte est verrouillé
      const now = new Date();
      if (user.locked_until && new Date(user.locked_until) > now) {
        const unlockTime = new Date(user.locked_until).toLocaleString('fr-FR');
        return res.status(423).json({ 
          error: `Compte verrouillé jusqu'à ${unlockTime}. Trop de tentatives de connexion.` 
        });
      }
      
      try {
        // Comparer le mot de passe avec le hash
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
          // Incrémenter les tentatives échouées
          const newFailedAttempts = (user.failed_attempts || 0) + 1;
          let lockUntil = null;
          
          // Verrouiller après 5 tentatives échouées
          if (newFailedAttempts >= 5) {
            lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            console.log(`Compte ${username} verrouillé après ${newFailedAttempts} tentatives échouées`);
          }
          
          db.run(`UPDATE admin_users SET failed_attempts = ?, locked_until = ? WHERE id = ?`, 
                 [newFailedAttempts, lockUntil?.toISOString() || null, user.id]);
          
          return res.status(401).json({ 
            error: 'Identifiants invalides',
            attemptsRemaining: Math.max(0, 5 - newFailedAttempts)
          });
        }
        
        // Connexion réussie - réinitialiser les compteurs
        db.run(`UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = ?`, 
               [user.id]);
        
        console.log(`Connexion réussie pour l'utilisateur: ${username}`);
        
        // Générer un token de session simple (en production, utiliser JWT)
        const sessionToken = require('crypto').randomBytes(32).toString('hex');
        
        res.json({ 
          message: 'Connexion réussie', 
          user: { 
            id: user.id, 
            username: user.username 
          },
          token: sessionToken
        });
        
      } catch (bcryptError) {
        console.error('Erreur bcrypt:', bcryptError);
        res.status(500).json({ error: 'Erreur lors de la vérification du mot de passe' });
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour changer le mot de passe (authentification requise)
app.post('/api/change-password', async (req, res) => {
  const { currentPassword, newPassword, username } = req.body;
  
  if (!currentPassword || !newPassword || !username) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
  }
  
  try {
    db.get(`SELECT * FROM admin_users WHERE username = ?`, [username], async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }
      
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }
      
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      
      db.run(`UPDATE admin_users SET password = ?, salt_rounds = ? WHERE id = ?`, 
             [hashedNewPassword, saltRounds, user.id], (err) => {
        if (err) {
          console.error('Erreur lors du changement de mot de passe:', err);
          return res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
        }
        
        console.log(`Mot de passe changé pour l'utilisateur: ${username}`);
        res.json({ message: 'Mot de passe changé avec succès' });
      });
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour servir le frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/index.html'));
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/projects.html'));
});

app.get('/project/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/project.html'));
});

// Middleware de gestion d'erreur global
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Le fichier est trop volumineux (5MB max)' });
    }
    return res.status(400).json({ error: 'Erreur d\'upload: ' + error.message });
  }
  
  res.status(500).json({ 
    error: 'Erreur serveur interne', 
    message: error.message,
    stack: isProduction ? undefined : error.stack 
  });
});

// Middleware pour gérer les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`⚙️ Admin: http://localhost:${PORT}/admin`);
  console.log(`🔒 Passwords are secured with bcrypt`);
  
  if (isProduction) {
    console.log('🔥 Running in production mode');
  }
  
  if (isRailway) {
    console.log('🚄 Deployed on Railway');
  }
});

module.exports = app;
