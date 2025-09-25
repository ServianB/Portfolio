// Healthcheck endpoint pour Railway
const express = require('express');
const fs = require('fs');
const path = require('path');

function createHealthCheck(app) {
  // Endpoint de healthcheck principal
  app.get('/health', (req, res) => {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };
    
    try {
      // Vérifier la base de données
      const dbPath = process.env.DATABASE_PATH || './portfolio.db';
      if (fs.existsSync(dbPath)) {
        healthcheck.database = 'connected';
      } else {
        healthcheck.database = 'disconnected';
        healthcheck.message = 'Database not found';
        return res.status(503).send(healthcheck);
      }
      
      // Vérifier le dossier uploads
      const uploadsDir = process.env.UPLOAD_DIR || './backend/uploads';
      if (fs.existsSync(uploadsDir)) {
        healthcheck.uploads = 'available';
      } else {
        healthcheck.uploads = 'unavailable';
      }
      
      // Vérifier les fichiers statiques frontend
      const frontendPath = path.join(__dirname, '../frontend/index.html');
      if (fs.existsSync(frontendPath)) {
        healthcheck.frontend = 'available';
      } else {
        healthcheck.frontend = 'unavailable';
        healthcheck.message = 'Frontend files not found';
        return res.status(503).send(healthcheck);
      }
      
      res.status(200).send(healthcheck);
      
    } catch (error) {
      healthcheck.message = error.message;
      healthcheck.error = true;
      res.status(503).send(healthcheck);
    }
  });
  
  // Endpoint de readiness (prêt à recevoir du trafic)
  app.get('/ready', (req, res) => {
    res.status(200).json({
      status: 'ready',
      timestamp: Date.now(),
      message: 'Service is ready to handle requests'
    });
  });
  
  // Endpoint de liveness (processus en vie)
  app.get('/alive', (req, res) => {
    res.status(200).json({
      status: 'alive',
      uptime: process.uptime(),
      timestamp: Date.now()
    });
  });
}

module.exports = createHealthCheck;
