const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration pour Vercel
const isDev = process.env.NODE_ENV !== 'production';
const isVercel = process.env.VERCEL === '1';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration multer pour upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = isVercel ? '/tmp/uploads' : path.join(__dirname, 'uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Initialisation de la base de données
const dbPath = isVercel ? '/tmp/portfolio.db' : './portfolio.db';
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

  // Table des utilisateurs admin (simple)
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  // Insertion d'un utilisateur admin par défaut
  db.run(`INSERT OR IGNORE INTO admin_users (username, password) VALUES ('admin', 'portfolio2024')`);
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
  const {
    title_fr, title_en, description_fr, description_en,
    technologies, github_url, live_url, category, featured
  } = req.body;
  
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  
  const query = `INSERT INTO projects 
    (title_fr, title_en, description_fr, description_en, technologies, github_url, live_url, image_url, category, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  // Convertir featured en nombre (0 ou 1)
  const featuredValue = featured === '1' || featured === 1 || featured === true ? 1 : 0;
  const params = [title_fr, title_en, description_fr, description_en, technologies, github_url, live_url, image_url, category, featuredValue];
  
  db.run(query, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Project created successfully', id: this.lastID });
  });
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

// Authentification simple
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM admin_users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    res.json({ message: 'Login successful', user: { id: row.id, username: row.username } });
  });
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

// Démarrage du serveur
if (isDev && !isVercel) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`Admin: http://localhost:${PORT}/admin`);
  });
}

module.exports = app;
