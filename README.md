# Portfolio IT - Benjamin

Un portfolio moderne et responsive avec interface d'administration pour gérer dynamiquement les projets.

## 🚀 Fonctionnalités

### Frontend
- **Design moderne** : Interface épurée avec Tailwind CSS
- **Responsive** : Optimisé pour tous les appareils
- **Animations** : Transitions fluides et animations discrètes
- **Multilingue** : Support français/anglais
- **Navigation fluide** : Scroll smooth et navigation intuitive
- **Performance** : Optimisé pour le chargement rapide

### Backend
- **API REST** : Gestion complète des projets
- **Upload d'images** : Gestion des fichiers avec Multer
- **Base de données** : SQLite pour la simplicité
- **CORS** : Support des requêtes cross-origin

### Interface d'Administration
- **Authentification** : Système de login sécurisé
- **CRUD complet** : Créer, lire, modifier, supprimer des projets
- **Upload d'images** : Interface simple pour ajouter des images
- **Gestion multilingue** : Contenu en français et anglais
- **Interface intuitive** : Dashboard moderne et facile à utiliser

## 🛠️ Technologies Utilisées

### Frontend
- HTML5 sémantique
- Tailwind CSS (via CDN)
- Alpine.js pour l'interactivité
- Font Awesome pour les icônes
- Google Fonts (Inter)

### Backend
- Node.js
- Express.js
- SQLite3
- Multer (upload de fichiers)
- CORS

## 📁 Structure du Projet

```
my-git-repo/
├── backend/
│   ├── server.js          # Serveur Express principal
│   ├── package.json       # Dépendances backend
│   ├── portfolio.db       # Base de données SQLite (créée automatiquement)
│   └── uploads/           # Dossier pour les images uploadées
├── frontend/
│   ├── css/              # Styles personnalisés (optionnel)
│   ├── js/
│   │   ├── main.js       # JavaScript principal du portfolio
│   │   └── admin.js      # JavaScript de l'interface admin
│   ├── images/           # Images statiques
│   ├── admin/
│   │   └── index.html    # Interface d'administration
│   └── project.html      # Page de détail des projets
├── index.html            # Page principale du portfolio
└── README.md
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### Installation

1. **Cloner le repository**
   ```bash
   git clone <your-repo-url>
   cd my-git-repo
   ```

2. **Installer les dépendances backend**
   ```bash
   cd backend
   npm install
   ```

3. **Démarrer le serveur**
   ```bash
   npm start
   # ou pour le développement avec auto-reload :
   npm run dev
   ```

4. **Accéder au portfolio**
   - Portfolio principal : http://localhost:3000
   - Interface admin : http://localhost:3000/admin

### Première Connexion Admin
- **Nom d'utilisateur** : `admin`
- **Mot de passe** : `portfolio2024`

⚠️ **Important** : Changez ces identifiants par défaut en production !

## 📝 Configuration

### Variables d'Environnement
Créez un fichier `.env` dans le dossier `backend/` :

```env
PORT=3000
NODE_ENV=development
```

### Personnalisation

#### Couleurs et Thème
Les couleurs sont définies dans la configuration Tailwind dans chaque fichier HTML. Modifiez les couleurs `primary` et `secondary` selon vos préférences.

#### Contenu Statique
- Modifiez les informations personnelles dans `index.html`
- Ajoutez votre photo dans `frontend/images/`
- Personnalisez les liens sociaux et informations de contact

## 🎨 Design et UX

### Palette de Couleurs
- **Primaire** : Bleu (#3b82f6) - Liens et éléments interactifs
- **Secondaire** : Gris (#64748b) - Texte et éléments neutres
- **Accents** : Dégradés subtils pour les sections importantes

### Typographie
- **Police principale** : Inter (Google Fonts)
- **Hiérarchie claire** : Tailles et poids adaptés au contenu

### Animations
- Fade-in et slide-up au scroll
- Hover effects sur les cartes
- Transitions fluides
- Effet parallaxe subtil sur le hero

## 📱 Fonctionnalités Détaillées

### Gestion des Projets
- **Multilingue** : Titre et description en FR/EN
- **Catégorisation** : Web, Mobile, Desktop, API, etc.
- **Technologies** : Liste des technologies utilisées
- **Liens** : GitHub et démonstration live
- **Images** : Upload et affichage automatique
- **Mise en avant** : Projets featured sur la page d'accueil

### Navigation
- **Menu fixe** : Reste visible pendant le scroll
- **Mobile-friendly** : Menu hamburger responsive
- **Smooth scroll** : Navigation fluide entre sections
- **Indicateurs visuels** : Scroll indicator et animations

### Administration
- **Sécurité** : Authentification simple mais efficace
- **CRUD complet** : Interface complète pour gérer les projets
- **Prévisualisation** : Voir les modifications en temps réel
- **Validation** : Contrôles de saisie et messages d'erreur

## 🔧 API Endpoints

### Projets
- `GET /api/projects` - Liste tous les projets
- `GET /api/projects?featured=true` - Projets mis en avant
- `GET /api/projects/:id` - Détail d'un projet
- `POST /api/projects` - Créer un nouveau projet
- `PUT /api/projects/:id` - Modifier un projet
- `DELETE /api/projects/:id` - Supprimer un projet

### Authentification
- `POST /api/login` - Connexion admin

## 🚀 Déploiement

### Production
1. **Configurer les variables d'environnement**
2. **Optimiser les assets** (minification, compression)
3. **Configurer HTTPS**
4. **Sauvegarder la base de données**

### Hébergement Recommandé
- **Heroku** : Simple et gratuit pour commencer
- **Vercel** : Parfait pour les projets frontend
- **VPS** : Plus de contrôle (DigitalOcean, Linode)

## 🔒 Sécurité

### Recommendations
- Changer les identifiants admin par défaut
- Implémenter des tokens JWT pour l'authentification
- Ajouter une limitation des tentatives de connexion
- Valider tous les uploads de fichiers
- Utiliser HTTPS en production

## 📈 Améliorations Futures

### Fonctionnalités Prévues
- [ ] Système de commentaires
- [ ] Analytics intégrés
- [ ] Export PDF du CV
- [ ] Blog intégré
- [ ] Système de contact avec emails
- [ ] Mode sombre
- [ ] Progressive Web App (PWA)

### Optimisations Techniques
- [ ] Mise en cache des API
- [ ] Optimisation des images (WebP, lazy loading)
- [ ] Service Worker pour le offline
- [ ] Tests automatisés

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Contact

- **Email** : benjamin@portfolio.com
- **LinkedIn** : [Votre LinkedIn]
- **GitHub** : [Votre GitHub]

---

Développé avec ❤️ par Benjamin