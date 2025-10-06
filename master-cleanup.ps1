$ErrorActionPreference = 'Stop'

Write-Host "🧹 STARTING MASTER CLEANUP PROCESS" -ForegroundColor Cyan

# Backup
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "backup-pre-cleanup-$timestamp.zip"
Write-Host "📦 Creating backup: $backupName"
Compress-Archive -Path @(
  "Stat Learning-frontend\src",
  "stats-learning-backend\app"
) -DestinationPath $backupName -Force
Write-Host "✅ Backup created"

# Frontend cleanup detector
if (Test-Path "Stat Learning-frontend\frontend-cleanup-detector.ts") {
  Write-Host "🎨 Running frontend cleanup detector..."
  Push-Location "Stat Learning-frontend"
  npx --yes ts-node frontend-cleanup-detector.ts | Tee-Object -FilePath ..\frontend-cleanup-report.txt
  Pop-Location
}

# Backend cleanup detector
if (Test-Path "stats-learning-backend\backend-cleanup-detector.py") {
  Write-Host "🐍 Running backend cleanup detector..."
  Push-Location "stats-learning-backend"
  python backend-cleanup-detector.py | Tee-Object -FilePath ..\backend-cleanup-report.txt
  Pop-Location
}

Write-Host "🧪 Validation steps (run manually as needed):" -ForegroundColor Yellow
Write-Host "- Frontend: cd 'Stat Learning-frontend'; npm run type-check; npm run build"
Write-Host "- Backend:  cd 'stats-learning-backend'; python -m pytest"
Write-Host "Reports saved: frontend-cleanup-report.txt, backend-cleanup-report.txt"

Write-Host "✅ CLEANUP SCAN COMPLETE" -ForegroundColor Green


