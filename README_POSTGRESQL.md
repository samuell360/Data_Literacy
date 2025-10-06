# 🗄️ PostgreSQL Setup for Data Literacy Backend

## Quick Start with Docker (Recommended)

### 1. Start PostgreSQL and Redis
```powershell
# Start databases using Docker Compose
.\start_db.ps1
```

This will:
- Start PostgreSQL on port 5432
- Start Redis on port 6379  
- Create the `literacydb` database
- Set up persistent data volumes

### 2. Start Backend with Auto-Setup
```powershell
# This will check databases and run migrations automatically
.\run_backend.ps1
```

### 3. Start Frontend
```powershell
.\run_frontend.ps1
```

## Manual PostgreSQL Setup (Alternative)

If you prefer installing PostgreSQL locally:

### Windows Installation
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install with these settings:
   - Username: `postgres`
   - Password: `Ennoccent360@`
   - Port: `5432`
   - Database: `literacydb`

### Create Database
```sql
-- Connect to PostgreSQL as postgres user
CREATE DATABASE literacydb;
```

## Database Configuration

### Environment Variables (.env)
```env
ENVIRONMENT=development
SECRET_KEY=your-secret-key-here-change-in-production-abcdef1234567890abcdef1234567890
ALGORITHM=HS256
DATABASE_URL=postgresql+psycopg://postgres:Ennoccent360@localhost:5432/literacydb
```

### Connection Details
- **Host**: localhost
- **Port**: 5432
- **Database**: literacydb
- **Username**: postgres
- **Password**: Ennoccent360@
- **URL**: `postgresql+psycopg://postgres:Ennoccent360%40@localhost:5432/literacydb`

## Database Migrations

### Run Migrations
```powershell
cd stats-learning-backend
.\.venv\Scripts\python -m alembic upgrade head
```

### Create New Migration
```powershell
cd stats-learning-backend
.\.venv\Scripts\python -m alembic revision --autogenerate -m "description"
```

## Docker Management

### Stop Databases
```powershell
docker-compose -f docker-compose.dev.yml down
```

### View Logs
```powershell
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs redis
```

### Remove Volumes (Clean Slate)
```powershell
docker-compose -f docker-compose.dev.yml down -v
```

## Connection Testing

### Test PostgreSQL Connection
```powershell
cd stats-learning-backend
.\.venv\Scripts\python -c "import psycopg; conn = psycopg.connect('postgresql://postgres:Ennoccent360%40@localhost:5432/literacydb'); print('✅ Connected'); conn.close()"
```

### Test Backend Configuration
```powershell
cd stats-learning-backend
.\.venv\Scripts\python -c "from app.core.config import settings; print('✅ Config loaded:', settings.DATABASE_URL)"
```

## Troubleshooting

### Common Issues
1. **Port 5432 in use**: Stop other PostgreSQL instances
2. **Password authentication failed**: Check password encoding in URL
3. **Database does not exist**: Create `literacydb` database manually
4. **Docker not found**: Install Docker Desktop

### Reset Everything
```powershell
# Stop all containers and remove data
docker-compose -f docker-compose.dev.yml down -v

# Restart fresh
.\start_db.ps1
.\run_backend.ps1
```
