#!/usr/bin/env node

/**
 * Script pour créer un nouvel utilisateur administrateur
 * Usage: node create-admin.js <username> <password>
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Configuration
const dbPath = './portfolio.db';
const saltRounds = 12;

async function createAdmin(username, password) {
  if (!username || !password) {
    console.error('Usage: node create-admin.js <username> <password>');
    console.error('Exemple: node create-admin.js admin mySecurePassword123');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Erreur: Le mot de passe doit contenir au moins 8 caractères');
    process.exit(1);
  }

  const db = new sqlite3.Database(dbPath);

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM admin_users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      console.error(`Erreur: L'utilisateur '${username}' existe déjà`);
      process.exit(1);
    }

    // Hasher le mot de passe
    console.log('Hachage du mot de passe...');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO admin_users (username, password, salt_rounds, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [username, hashedPassword, saltRounds],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    console.log(`✅ Utilisateur administrateur '${username}' créé avec succès`);
    console.log(`📝 Mot de passe haché avec bcrypt (${saltRounds} rounds)`);
    console.log('🔐 Le mot de passe est maintenant sécurisé dans la base de données');

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Récupérer les arguments de la ligne de commande
const [,, username, password] = process.argv;

createAdmin(username, password);
