#!/bin/bash

# Script de déploiement pour Railway
echo "🚀 Préparation du déploiement Railway..."

# Vérification des fichiers requis
echo "📋 Vérification des fichiers de configuration..."

if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json manquant"
    exit 1
fi

if [ ! -f "railway.json" ]; then
    echo "❌ Erreur: railway.json manquant"
    exit 1
fi

if [ ! -f "backend/server.js" ]; then
    echo "❌ Erreur: backend/server.js manquant"
    exit 1
fi

echo "✅ Tous les fichiers de configuration sont présents"

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "✅ Dépendances installées avec succès"

# Test du serveur localement
echo "🧪 Test du serveur en local..."
timeout 10s npm start &
SERVER_PID=$!

sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Le serveur démarre correctement"
    kill $SERVER_PID
else
    echo "❌ Erreur: Le serveur ne démarre pas correctement"
    exit 1
fi

echo "🎉 Prêt pour le déploiement Railway !"
echo ""
echo "📋 Étapes suivantes :"
echo "1. Connectez-vous à Railway: railway login"
echo "2. Créez un nouveau projet: railway new"
echo "3. Déployez le code: railway up"
echo "4. Configurez les variables d'environnement dans Railway"
