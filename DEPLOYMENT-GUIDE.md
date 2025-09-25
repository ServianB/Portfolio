# 🚀 Guide de Déploiement Railway - Portfolio Benjamin

## 📋 Fichiers de Configuration Créés

### 1. `railway.json` ✅
Configuration principale Railway avec:
- Build automatique avec Nixpacks
- Commande de démarrage
- Healthcheck sur `/`
- Politique de redémarrage

### 2. `Procfile` ✅
Fichier de processus pour définir la commande web.

### 3. `nixpacks.toml` ✅
Configuration Nixpacks pour l'environnement de build.

### 4. `.env.example` ✅
Template des variables d'environnement à configurer.

### 5. `package.json` ✅ (Mis à jour)
Scripts optimisés pour Railway:
- `npm start`: Lance le serveur en production
- `npm run build`: Installation des dépendances
- `postinstall`: Création automatique de l'admin

---

## 🔧 Étapes de Déploiement

### **Étape 1: Préparer Railway CLI**
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter à Railway
railway login
```

### **Étape 2: Créer le Projet sur Railway**
```bash
# Dans le dossier de votre projet
cd my-git-repo

# Créer un nouveau projet Railway
railway new

# Ou se connecter à un projet existant
railway link
```

### **Étape 3: Configurer les Variables d'Environnement**

Dans le dashboard Railway, ajoutez ces variables:

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NODE_ENV` | `production` | Environnement de production |
| `PORT` | `3000` | Port (Railway le définit automatiquement) |
| `ADMIN_SECRET_KEY` | `votre-cle-super-secrete` | ⚠️ **IMPORTANT**: Changez cette valeur |
| `DATABASE_PATH` | `./portfolio.db` | Chemin vers la base SQLite |
| `UPLOAD_DIR` | `./backend/uploads` | Dossier des uploads |
| `MAX_FILE_SIZE` | `5242880` | Taille max des fichiers (5MB) |
| `BCRYPT_ROUNDS` | `12` | Sécurité des mots de passe |

### **Étape 4: Déployer**
```bash
# Déployez votre application
railway up

# Ou avec Git (si connecté)
git add .
git commit -m "Deploy to Railway"
git push origin main
```

### **Étape 5: Vérifier le Déploiement**
```bash
# Voir les logs
railway logs

# Ouvrir l'app dans le navigateur
railway open
```

---

## 🌐 URLs et Accès

### **Frontend**
- **URL principale**: `https://votre-app.railway.app/`
- **Page projets**: `https://votre-app.railway.app/projects.html`

### **Backend API**
- **API projets**: `https://votre-app.railway.app/api/projects`
- **Admin login**: `https://votre-app.railway.app/api/login`
- **Panel admin**: `https://votre-app.railway.app/admin/`

### **Base de Données**
- SQLite intégrée (pas de configuration externe nécessaire)
- Créée automatiquement au premier démarrage

---

## 🔒 Configuration de Sécurité

### **Variables Sensibles à Changer**
1. `ADMIN_SECRET_KEY`: Clé de sécurité admin
2. Mot de passe admin (défini dans `create-admin.js`)

### **Accès Admin**
- **URL**: `https://votre-app.railway.app/admin/`
- **Username**: `admin` (par défaut)
- **Password**: `admin123` (⚠️ **CHANGEZ-LE**)

---

## 📁 Structure des Fichiers Statiques

```
/                          → Frontend (index.html)
/projects.html            → Page projets
/admin/                   → Panel d'administration
/uploads/                 → Images uploadées
/api/projects            → API REST
/api/login               → Authentification
```

---

## 🐛 Dépannage

### **Problème: App ne démarre pas**
```bash
# Vérifier les logs
railway logs

# Variables d'environnement
railway variables
```

### **Problème: Base de données introuvable**
La base SQLite se crée automatiquement. Si problème:
```bash
# Se connecter au conteneur
railway shell

# Vérifier les fichiers
ls -la
```

### **Problème: Uploads ne fonctionnent pas**
Le dossier `uploads` se crée automatiquement. Vérifiez:
- Variable `UPLOAD_DIR` définie
- Permissions d'écriture (Railway gère ça)

---

## ✅ Checklist Avant Déploiement

- [ ] `railway.json` configuré
- [ ] `package.json` mis à jour avec bons scripts
- [ ] Variables d'environnement définies dans Railway
- [ ] Code poussé sur Git
- [ ] Base de données SQLite prête
- [ ] Clé secrète admin changée

---

## 🎯 Commandes Utiles Railway

```bash
# Status du projet
railway status

# Variables d'environnement
railway variables

# Logs en temps réel
railway logs --tail

# Redéployer
railway redeploy

# Shell interactif
railway shell

# Ouvrir dans le navigateur
railway open
```

---

## 📞 Support

Si problème de déploiement:
1. Vérifiez les logs: `railway logs`
2. Vérifiez les variables: `railway variables`
3. Testez localement: `npm start`
4. Documentation Railway: https://docs.railway.app/

---

**🚀 Votre portfolio sera accessible 24/7 sur Railway avec SSL automatique !**
