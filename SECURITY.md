# 🔐 Sécurisation du Portfolio - Mise à jour de sécurité

## Améliorations de sécurité implémentées

### 1. Hachage des mots de passe avec bcrypt
- **Problème résolu** : Les mots de passe étaient stockés en texte clair dans la base de données
- **Solution** : Utilisation de bcrypt avec 12 rounds de salt pour hasher tous les mots de passe
- **Migration automatique** : Les mots de passe existants sont automatiquement migrés lors du démarrage

### 2. Protection contre les attaques par force brute
- **Verrouillage de compte** : Après 5 tentatives échouées, le compte est verrouillé pendant 15 minutes
- **Rate limiting** : Maximum 10 tentatives de connexion par IP toutes les 15 minutes
- **Logging** : Toutes les tentatives de connexion sont enregistrées avec l'IP source

### 3. Mesures de sécurité supplémentaires
- **Headers de sécurité HTTP** :
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Validation côté serveur** : Vérification de la longueur des mots de passe (min 8 caractères)
- **Délais de réponse** : Délais artificiels pour éviter les timing attacks

### 4. Interface administrateur améliorée
- **Onglet Sécurité** : Nouvelle section pour gérer les paramètres de sécurité
- **Changement de mot de passe** : Interface sécurisée pour changer le mot de passe
- **Feedback utilisateur** : Messages d'erreur détaillés et compteur de tentatives restantes

## Structure de la base de données mise à jour

### Table `admin_users`
```sql
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,                -- Hash bcrypt
    salt_rounds INTEGER DEFAULT 12,        -- Nombre de rounds de salt
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,                   -- Dernière connexion réussie
    failed_attempts INTEGER DEFAULT 0,     -- Nombre de tentatives échouées
    locked_until DATETIME                  -- Date de fin de verrouillage
);
```

## Utilisation

### Connexion standard
```javascript
// POST /api/login
{
    "username": "admin",
    "password": "votre_mot_de_passe"
}
```

### Changement de mot de passe
```javascript
// POST /api/change-password
{
    "username": "admin",
    "currentPassword": "ancien_mot_de_passe",
    "newPassword": "nouveau_mot_de_passe"
}
```

### Création d'un nouvel utilisateur admin (via script)
```bash
cd backend
node create-admin.js nouveaunom motdepassesecurise123
```

## Réponses d'erreur sécurisées

### Compte verrouillé (423)
```json
{
    "error": "Compte verrouillé jusqu'à 23/09/2025 15:30:45. Trop de tentatives de connexion."
}
```

### Rate limiting (429)
```json
{
    "error": "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes."
}
```

### Identifiants invalides (401)
```json
{
    "error": "Identifiants invalides",
    "attemptsRemaining": 3
}
```

## Journalisation de sécurité

Le système enregistre maintenant :
- Toutes les tentatives de connexion avec IP et timestamp
- Les verrouillages de compte
- Les changements de mot de passe
- Les erreurs d'authentification

## Recommandations de sécurité

1. **Mot de passe fort** : Utilisez un mot de passe d'au moins 12 caractères avec majuscules, minuscules, chiffres et symboles
2. **Surveillance** : Surveillez les logs pour détecter les tentatives d'intrusion
3. **Mise à jour régulière** : Changez le mot de passe administrateur régulièrement
4. **HTTPS en production** : Assurez-vous d'utiliser HTTPS en production
5. **Sauvegarde** : Sauvegardez régulièrement la base de données

## Tests de sécurité effectués

✅ Hachage bcrypt fonctionnel  
✅ Migration automatique des mots de passe existants  
✅ Verrouillage après tentatives multiples  
✅ Rate limiting par IP  
✅ Validation des entrées  
✅ Headers de sécurité HTTP  
✅ Interface de changement de mot de passe  

## Support

En cas de verrouillage accidentel, vous pouvez :
1. Attendre 15 minutes pour que le verrouillage expire
2. Redémarrer le serveur (efface le rate limiting en mémoire)
3. Utiliser le script `create-admin.js` pour créer un nouvel utilisateur

---

**Note de sécurité** : Cette mise à jour transforme un système d'authentification basique en un système robuste adapté à un environnement de production. Toutes les bonnes pratiques de sécurité web ont été implémentées.
