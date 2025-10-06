# Backend Startup Script
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green

# Ensure we're in the correct directory
Set-Location "stats-learning-backend"

# Persist environment for this session (PostgreSQL 18 on port 5433)
$env:DATABASE_URL = "sqlite:///./app.db"
$env:SECRET_KEY = "4p3FgBQUU2fJMut4p5YCAtmd6qxk3_du46pyylq59UQ"
$env:ADMIN_FORCE_RESET_ON_STARTUP = "1"

# Optional: echo active DB
Write-Host "Using DB: $env:DATABASE_URL" -ForegroundColor Cyan

# Run database migrations (or create tables if first run)
Write-Host "Running database setup..." -ForegroundColor Cyan
& ".\.venv\Scripts\python.exe" -c "from app.db.init_db import init_db; init_db(); print('DB init done')"

# Start the server
Write-Host "Starting FastAPI server on port 8000..." -ForegroundColor Green
& ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000

Write-Host "✅ Backend server stopped." -ForegroundColor Yellow
