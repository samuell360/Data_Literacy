# Backend Startup Script
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green

# Ensure we're in the correct directory
Set-Location "stats-learning-backend"

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
try {
    & ".\.venv\Scripts\python.exe" -c "import psycopg; conn = psycopg.connect('postgresql://app:app@localhost:5432/appdb'); conn.close(); print('✅ PostgreSQL connected')"
} catch {
    Write-Host "❌ PostgreSQL not accessible. Starting databases..." -ForegroundColor Red
    Set-Location ".."
    & ".\start_db.ps1"
    Set-Location "stats-learning-backend"
    Start-Sleep -Seconds 10
}

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Cyan
& ".\.venv\Scripts\python.exe" -m alembic upgrade head

# Start the server
Write-Host "Starting FastAPI server on port 8000..." -ForegroundColor Green
& ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000

Write-Host "✅ Backend server stopped." -ForegroundColor Yellow
