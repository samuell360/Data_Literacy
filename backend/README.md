# 📚 Statistics Learning App - Backend

A FastAPI-based backend for a Duolingo-style data literacy application focused on teaching Probability and Hypothesis Testing.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stats-app-backend
   ```

2. **Create virtual environment**
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -e ".[dev]"
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up the database**
   ```bash
   # Create database
   createdb stats_app

   # Run migrations
   alembic upgrade head

   # Seed initial data
   python scripts/seed_data.py
   ```

6. **Start the server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

7. **Access the API**
   - API Documentation: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc
   - Health check: http://localhost:8000/health

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/          # API endpoints
│   ├── core/         # Core configuration
│   ├── crud/         # Database operations
│   ├── db/           # Database setup
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   └── services/     # Business logic
├── alembic/          # Database migrations
├── scripts/          # Utility scripts
└── tests/            # Test suite
```

## 🧪 Testing

Run tests with coverage:
```bash
pytest --cov=app --cov-report=html
```

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Rate limiting on sensitive endpoints
- Input validation using Pydantic
- SQL injection protection via SQLAlchemy ORM

## 📊 Key Features

- **Adaptive Learning**: Questions adjust to user performance
- **Interactive Simulations**: 12+ statistics simulations
- **Gamification**: XP, badges, streaks, leaderboards
- **Content Management**: Admin panel for content creation
- **Real-time Progress**: Track learning progress

## 🛠 Development

### Code Quality
```bash
# Format code
black .

# Lint code
ruff check .

# Type checking
mypy app/
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## 📝 API Examples

### Register a new user
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","username":"learner","password":"SecurePass123!"}'
```

### Run a simulation
```bash
curl -X POST http://localhost:8000/api/v1/sim/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"sim_type":"pi_darts","params":{"trials":10000}}'
```

## 🚀 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment guidelines.

## 📄 License

MIT License - see LICENSE file for details.
