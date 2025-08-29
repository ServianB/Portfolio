# Script de démarrage du portfolio
Write-Host "🚀 Démarrage du serveur Portfolio..." -ForegroundColor Green
Set-Location "c:\Users\bense\Documents\Benjamin\Portfolio\my-git-repo\backend"
Write-Host "📁 Répertoire: $(Get-Location)" -ForegroundColor Blue
Write-Host "⚡ Démarrage du serveur Node.js..." -ForegroundColor Yellow
node server.js
