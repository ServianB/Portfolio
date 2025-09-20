# Configuration Email - Instructions

## 📧 Configuration de l'envoi d'emails avec Gmail

### 1. Activation de l'authentification à deux facteurs

1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Cliquez sur "Sécurité" dans le menu de gauche
3. Activez l'authentification à deux facteurs si ce n'est pas déjà fait

### 2. Génération d'un mot de passe d'application

1. Dans les paramètres de sécurité Google
2. Cliquez sur "Mots de passe des applications"
3. Sélectionnez "Autre (nom personnalisé)"
4. Tapez "Portfolio Contact Form"
5. Copiez le mot de passe généré (16 caractères)

### 3. Configuration du fichier .env

1. Ouvrez le fichier `backend/.env`
2. Remplacez `votre_mot_de_passe_app_gmail` par le mot de passe d'application généré
3. Vérifiez que `EMAIL_USER` correspond à votre adresse Gmail

Exemple :
```
EMAIL_USER=benjamin.servian.pro@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

### 4. Test de la fonctionnalité

1. Démarrez le serveur : `npm start` dans le dossier backend
2. Ouvrez votre portfolio
3. Remplissez et envoyez le formulaire de contact
4. Vérifiez votre boîte Gmail pour voir si l'email est arrivé

### 5. Sécurité

- ⚠️ Ne partagez jamais votre mot de passe d'application
- ✅ Le fichier .env est dans .gitignore (non versionné)
- ✅ Utilisez des variables d'environnement en production

### 6. Alternative (si Gmail pose problème)

Vous pouvez utiliser d'autres services :
- **SendGrid** : Service professionnel avec API
- **Mailgun** : Alternative populaire
- **Nodemailer avec SMTP** : Configuration manuelle

## 🚀 Fonctionnalités implémentées

- ✅ Formulaire de contact avec validation
- ✅ Envoi d'emails HTML formatés
- ✅ Gestion des erreurs côté client et serveur
- ✅ Interface responsive (desktop + mobile)
- ✅ Support multilingue (FR/EN)
- ✅ Indicateur de chargement pendant l'envoi
- ✅ Messages de confirmation et d'erreur

## 🔧 API Endpoint

**POST** `/api/contact`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "message": "Votre message ici"
}
```

**Response Success:**
```json
{
  "message": "Message envoyé avec succès!",
  "success": true
}
```

**Response Error:**
```json
{
  "error": "Description de l'erreur",
  "success": false
}
```
