# Data Literacy Project

A full-stack learning platform for statistics and probability education, featuring interactive lessons, simulations, and gamification elements.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Docker & Docker Compose

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/samuell360/Data_Literacy.git
   cd Data_Literacy
   ```

2. **Set up environment files:**
   ```bash
   # Copy example environment files
   cp .env.example .env
   cp .env backend/.env
   cp .env frontend/.env
   ```

3. **Start the application:**
   ```bash
   # Start database services
   ./start_db.ps1
   
   # Start backend (in new terminal)
   ./run_backend.ps1
   
   # Start frontend (in new terminal)
   ./run_frontend.ps1
   ```

## 📁 Project Structure

```
Data_Literacy/
├── backend/           # FastAPI backend server
├── frontend/          # React frontend application
├── content/           # Lesson content and curriculum
├── docker-compose.yml # Database services (PostgreSQL, Redis)
└── scripts/           # Utility scripts
```

## 🛠️ Development

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Database**: PostgreSQL + Redis
- **Content**: Markdown-based lessons with JSON configurations

## 📚 Features

- Interactive probability and statistics lessons
- Real-time simulations and visualizations
- Gamification with progress tracking
- Duolingo-style learning experience
- Professional-grade UI components

## 🔧 Available Scripts

- `start_db.ps1` - Start PostgreSQL and Redis databases
- `run_backend.ps1` - Start the FastAPI backend server
- `run_frontend.ps1` - Start the React development server
- `start_servers.ps1` - Start both frontend and backend

## 📖 Documentation

- [Backend API Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [Content Structure](content/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.