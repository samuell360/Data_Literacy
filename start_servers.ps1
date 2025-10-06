# Start both backend and frontend servers
Write-Host "Starting Data Literacy Web App..." -ForegroundColor Green

# Start Backend
Write-Host "Starting Backend (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "$env:DATABASE_URL='sqlite:///./app.db'; $env:SECRET_KEY='4p3FgBQUU2fJMut4p5YCAtmd6qxk3_du46pyylq59UQ'; $env:ADMIN_FORCE_RESET_ON_STARTUP='1'; cd 'stats-learning-backend'; .\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000; Read-Host 'Press Enter to close'" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend (React + Vite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "cd 'Stat Learning-frontend'; npm run dev; Read-Host 'Press Enter to close'" -WindowStyle Normal

Write-Host "Both servers starting..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Blue
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Blue
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Blue
