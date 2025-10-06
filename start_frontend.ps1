# Frontend Startup Script
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Cyan

# Ensure we're in the correct directory
Set-Location "frontend"

# Start Vite development server
npm run dev

Write-Host "✅ Frontend server stopped." -ForegroundColor Yellow