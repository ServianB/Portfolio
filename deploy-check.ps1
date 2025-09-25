# Script de vérification de déploiement Railway (PowerShell)
Write-Host "🚀 Vérification du déploiement Railway..." -ForegroundColor Green

# Vérification des fichiers requis
Write-Host "📋 Vérification des fichiers de configuration..." -ForegroundColor Yellow

$requiredFiles = @(
    "package.json",
    "railway.json", 
    "Procfile",
    "backend/server.js",
    ".env.example"
)

$allFilesExist = $true

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file trouvé" -ForegroundColor Green
    } else {
        Write-Host "❌ $file manquant" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "❌ Certains fichiers de configuration sont manquants" -ForegroundColor Red
    exit 1
}

# Vérification du package.json
Write-Host "📦 Vérification du package.json..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

if ($packageJson.scripts.start) {
    Write-Host "✅ Script 'start' configuré: $($packageJson.scripts.start)" -ForegroundColor Green
} else {
    Write-Host "❌ Script 'start' manquant dans package.json" -ForegroundColor Red
    exit 1
}

if ($packageJson.engines.node) {
    Write-Host "✅ Version Node.js spécifiée: $($packageJson.engines.node)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Version Node.js non spécifiée (recommandé)" -ForegroundColor Yellow
}

# Installation des dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dépendances installées avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Prêt pour le déploiement Railway !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Étapes suivantes :" -ForegroundColor Cyan
Write-Host "1. Installer Railway CLI: npm install -g @railway/cli" -ForegroundColor White
Write-Host "2. Se connecter: railway login" -ForegroundColor White  
Write-Host "3. Créer un projet: railway new" -ForegroundColor White
Write-Host "4. Déployer: railway up" -ForegroundColor White
Write-Host "5. Configurer les variables d'environnement dans le dashboard Railway" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consultez DEPLOYMENT-GUIDE.md pour les instructions détaillées" -ForegroundColor Cyan
