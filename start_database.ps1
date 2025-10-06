<#
  Start PostgreSQL and Redis (Docker Compose)
  - PostgreSQL: app/app@appdb on localhost:5432
  - Redis: localhost:6379
#>

Write-Host "Starting PostgreSQL and Redis..." -ForegroundColor Green

# Check if Docker is available
try {
    docker --version | Out-Null
    Write-Host "Docker is available" -ForegroundColor Green
} catch {
    Write-Host "Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Install Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Start the databases
Write-Host "Starting PostgreSQL on port 5432..." -ForegroundColor Cyan
Write-Host "Starting Redis on port 6379..." -ForegroundColor Cyan

docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
Write-Host "Waiting for databases to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check health
Write-Host "Checking database health..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml ps

Write-Host "Databases are running!" -ForegroundColor Green
Write-Host "PostgreSQL: localhost:5432 (database: appdb, user: app)" -ForegroundColor Blue
Write-Host "Redis: localhost:6379" -ForegroundColor Blue
Write-Host ""
Write-Host "To stop: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Gray

