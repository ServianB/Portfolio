// Configuration pour l'environnement de production
module.exports = {
  // Configuration Railway
  railway: {
    // Port automatiquement défini par Railway
    port: process.env.PORT || 3000,
    
    // Environnement
    env: process.env.NODE_ENV || 'production',
    
    // Configuration de la base de données
    database: {
      path: process.env.DATABASE_PATH || './portfolio.db',
      options: {
        // Performance optimizations for SQLite
        journal_mode: 'WAL',
        synchronous: 'NORMAL',
        cache_size: 1000,
        temp_store: 'memory'
      }
    },
    
    // Configuration des uploads
    uploads: {
      dir: process.env.UPLOAD_DIR || './backend/uploads',
      maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    },
    
    // Configuration de sécurité
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
      adminSecretKey: process.env.ADMIN_SECRET_KEY || 'change-this-in-production',
      corsOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*']
    },
    
    // Configuration des logs
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'combined'
    }
  },
  
  // Vérification de l'environnement
  validateEnvironment() {
    const required = [];
    
    if (process.env.NODE_ENV === 'production') {
      if (this.railway.security.adminSecretKey === 'change-this-in-production') {
        required.push('ADMIN_SECRET_KEY doit être défini en production');
      }
    }
    
    if (required.length > 0) {
      console.error('❌ Variables d\'environnement manquantes:');
      required.forEach(msg => console.error(`   - ${msg}`));
      return false;
    }
    
    return true;
  }
};
