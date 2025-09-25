@echo off
echo 🚀 Test de configuration Railway pour Windows

echo 📋 Verification des fichiers...
if not exist "package.json" (
    echo ❌ package.json manquant
    pause
    exit /b 1
)

if not exist "railway.json" (
    echo ❌ railway.json manquant
    pause
    exit /b 1
)

if not exist "backend\server.js" (
    echo ❌ backend\server.js manquant
    pause
    exit /b 1
)

echo ✅ Tous les fichiers de configuration sont presents

echo 📦 Installation des dependances...
call npm install
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation
    pause
    exit /b 1
)

echo ✅ Dependances installees avec succes

echo 🧪 Test du serveur...
echo Demarrage du serveur sur http://localhost:3000
echo Appuyez sur Ctrl+C pour arreter

call npm start

pause
