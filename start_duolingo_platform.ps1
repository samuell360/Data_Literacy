# Start Duolingo-Style Learning Platform
# This script sets up and starts the complete platform with PostgreSQL

Write-Host "🎓 Starting Duolingo-Style Learning Platform..." -ForegroundColor Cyan

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    docker-compose --version | Out-Null
    Write-Host "✓ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

# Stop any existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.duolingo.yml down 2>$null

# Build and start the platform
Write-Host "Building and starting the platform..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow

try {
    # Start the services
    docker-compose -f docker-compose.duolingo.yml up --build -d
    
    Write-Host "✓ Platform started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Services are starting up..." -ForegroundColor Cyan
    Write-Host "   • PostgreSQL Database: localhost:5432" -ForegroundColor White
    Write-Host "   • Redis Cache: localhost:6379" -ForegroundColor White
    Write-Host "   • Backend API: http://localhost:8000" -ForegroundColor White
    Write-Host "   • Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host ""
    
    # Wait for services to be ready
    Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Check service health
    Write-Host "Checking service health..." -ForegroundColor Yellow
    
    # Check backend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Backend API is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠ Backend API is starting up..." -ForegroundColor Yellow
    }
    
    # Check frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Frontend is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠ Frontend is starting up..." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🎉 Platform is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Access your learning platform:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Management commands:" -ForegroundColor Cyan
    Write-Host "   View logs: docker-compose -f docker-compose.duolingo.yml logs -f" -ForegroundColor White
    Write-Host "   Stop platform: docker-compose -f docker-compose.duolingo.yml down" -ForegroundColor White
    Write-Host "   Restart: docker-compose -f docker-compose.duolingo.yml restart" -ForegroundColor White
    Write-Host ""
    Write-Host "🎮 Features available:" -ForegroundColor Cyan
    Write-Host "   ✓ Duolingo-style interactive lessons" -ForegroundColor White
    Write-Host "   ✓ Hearts and XP system" -ForegroundColor White
    Write-Host "   ✓ Real-world scenarios (Netflix, TikTok, Gaming)" -ForegroundColor White
    Write-Host "   ✓ Multiple question types" -ForegroundColor White
    Write-Host "   ✓ Adaptive learning" -ForegroundColor White
    Write-Host "   ✓ Progress tracking" -ForegroundColor White
    Write-Host ""
    
    # Open the frontend in browser
    Write-Host "Opening frontend in browser..." -ForegroundColor Yellow
    Start-Process "http://localhost:5173"
    
} catch {
    Write-Host "❌ Failed to start platform: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the logs with: docker-compose -f docker-compose.duolingo.yml logs" -ForegroundColor Yellow
    exit 1
}
