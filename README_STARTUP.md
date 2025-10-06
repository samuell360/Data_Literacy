# 🚀 Data Literacy App - Quick Start Guide

## Directory Structure Overview
```
Data Literacy Project/
├── stats-learning-backend/     # FastAPI Backend
│   ├── app/                    # Application code
│   ├── .venv/                  # Python virtual environment
│   ├── .env                    # Environment variables
│   └── requirements.txt        # Python dependencies
├── Stat Learning-frontend/     # React Frontend
│   ├── src/                    # Source code
│   ├── node_modules/           # Node dependencies
│   └── package.json            # NPM configuration
├── run_backend.ps1             # Backend startup script
├── run_frontend.ps1            # Frontend startup script
└── pyrightconfig.json          # Python IDE configuration
```

## ✅ Fixed Issues

### 1. **Environment Configuration**
- ✅ Created proper `.env` file with UTF-8 encoding
- ✅ Fixed CORS origins to match frontend port 5173
- ✅ Added SQLite database for development
- ✅ Updated Pyright config to use virtual environment

### 2. **Port Configuration**
- ✅ Frontend: `http://localhost:5173` (Vite default)
- ✅ Backend: `http://localhost:8000` (FastAPI)
- ✅ API Documentation: `http://localhost:8000/docs`

### 3. **Directory Structure**
- ✅ Backend virtual environment located at `stats-learning-backend/.venv/`
- ✅ Frontend dependencies installed in `Stat Learning-frontend/node_modules/`
- ✅ Removed duplicate configuration files

## 🚀 How to Start the Application

### Option 1: Using PowerShell Scripts (Recommended)
```powershell
# Start Backend (in one terminal)
.\run_backend.ps1

# Start Frontend (in another terminal)  
.\run_frontend.ps1
```

### Option 2: Manual Startup
```powershell
# Terminal 1 - Backend
cd "stats-learning-backend"
.\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd "Stat Learning-frontend"
npm run dev
```

## 🌐 Access Points
- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/health

## 🔧 Development Environment
- **Backend**: Python 3.9.13 + FastAPI + SQLAlchemy
- **Frontend**: React + TypeScript + Vite
- **Database**: SQLite (development) / PostgreSQL (production)
- **API Integration**: REST APIs with automatic CORS handling

## 🎯 Key Features Ready
- ✅ User authentication with JWT tokens
- ✅ REST API client service
- ✅ Interactive dashboard and learning paths
- ✅ Statistics simulations
- ✅ Gamification system (XP, badges, streaks)
- ✅ Responsive UI with dark/light mode

## 🛠️ IDE Setup
The `pyrightconfig.json` is configured to:
- Use the virtual environment Python interpreter
- Include proper paths for FastAPI imports
- Enable type checking for the backend code

If you see red underlines in VS Code/Cursor:
1. Restart your IDE
2. Or select the Python interpreter: `Ctrl+Shift+P` → "Python: Select Interpreter" → Choose `stats-learning-backend\.venv\Scripts\python.exe`

## 🔍 Troubleshooting
- **Port conflicts**: Make sure ports 5173 and 8000 are free
- **Python path issues**: Ensure virtual environment is activated
- **Node modules**: Run `npm install` in frontend directory if needed
- **Backend imports**: Check that virtual environment contains all packages
