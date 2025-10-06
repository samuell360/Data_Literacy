# Database Setup for Duolingo-Style Learning Platform

This guide explains how to set up the PostgreSQL database with all the Duolingo-style features and ensure data accuracy.

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)
```powershell
# Start the complete platform with PostgreSQL
.\start_duolingo_platform.ps1
```

### Option 2: Manual Setup
```powershell
# 1. Start PostgreSQL with Docker
docker-compose -f docker-compose.duolingo.yml up db -d

# 2. Run migrations
cd stats-learning-backend
python scripts/migrate_duolingo_features.py

# 3. Seed with content
python scripts/seed_duolingo_content.py

# 4. Start backend
python -m uvicorn app.main:app --reload

# 5. Start frontend (in another terminal)
cd "Stat Learning-frontend"
npm run dev
```

## 📊 Database Schema

### Core Tables

#### `worlds`
- Learning domains (e.g., "Probability World")
- Theme and color scheme configuration
- Published status and ordering

#### `modules`
- Major topics within a world
- Learning objectives and descriptions
- Prerequisites and estimated time

#### `levels`
- Specific skill areas within modules
- Ordered progression through topics
- Difficulty and time estimates

#### `lessons`
- Individual learning units
- Enhanced content with Duolingo-style sections:
  - `story`: Engaging introductions
  - `concept`: Core learning material
  - `formula`: Mathematical formulas
  - `example`: Worked examples
- JSON content structure for flexibility

#### `questions`
- Quiz questions with multiple types:
  - `mcq`: Multiple choice
  - `true_false`: True/false
  - `fill`: Fill in the blank
  - `tap_words`: Interactive word selection
  - `match`: Matching pairs
- Enhanced features:
  - Real-world scenarios
  - Hints and explanations
  - Difficulty levels
  - Concept tagging

#### `quizzes`
- Lesson quiz configuration
- Adaptive learning settings
- Retry policies and time limits

#### `users`
- User accounts and profiles
- Authentication and preferences

#### `user_progress`
- Learning progress tracking
- Scores and completion status
- Time spent and attempts

#### `user_gamification`
- Hearts and XP system
- Streaks and achievements
- Badges and levels

## 🎯 Duolingo-Style Features

### Enhanced Content Structure
```json
{
  "sections": [
    {
      "type": "story",
      "title": "The Netflix Gamble",
      "content": "Engaging introduction...",
      "theme": "netflix"
    },
    {
      "type": "concept",
      "title": "Key Concepts",
      "content": "Core learning material..."
    },
    {
      "type": "formula",
      "title": "Important Formulas",
      "content": "Mathematical formulas...",
      "formulas": [...]
    },
    {
      "type": "example",
      "title": "Worked Examples",
      "content": "Step-by-step examples...",
      "steps": [...]
    }
  ],
  "metadata": {
    "estimated_time": 15,
    "difficulty": "medium",
    "theme": "netflix",
    "learning_style": "duolingo"
  }
}
```

### Question Types
- **Multiple Choice (MCQ)**: Traditional A/B/C/D options
- **True/False**: Binary choice questions
- **Fill in the Blank**: Text input with flexible matching
- **Tap Words**: Interactive word selection
- **Match Pairs**: Drag-and-drop matching

### Gamification Elements
- **Hearts System**: Lose hearts on wrong answers
- **XP Tracking**: Earn experience points for correct answers
- **Streaks**: Consecutive days of learning
- **Badges**: Achievement recognition
- **Levels**: Progressive difficulty

## 🔧 Database Configuration

### PostgreSQL Settings
```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Performance indexes
CREATE INDEX CONCURRENTLY idx_questions_concept_tags ON questions USING gin(concept_tags);
CREATE INDEX CONCURRENTLY idx_lessons_content_json ON lessons USING gin(content_json);

-- Full-text search
CREATE INDEX CONCURRENTLY idx_questions_stem_search ON questions USING gin(to_tsvector('english', stem));
```

### Connection Settings
```yaml
# docker-compose.duolingo.yml
environment:
  POSTGRES_USER: app
  POSTGRES_PASSWORD: app
  POSTGRES_DB: appdb
  POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
```

## 📈 Data Accuracy Features

### Content Validation
- JSON schema validation for lesson content
- Question type validation
- Answer format checking
- Difficulty level consistency

### Progress Tracking
- Atomic progress updates
- Score calculation accuracy
- Time tracking precision
- Completion status validation

### Gamification Integrity
- XP calculation verification
- Heart system consistency
- Streak calculation accuracy
- Badge achievement validation

## 🛠️ Migration Scripts

### `migrate_duolingo_features.py`
- Creates all necessary tables
- Adds new question types
- Updates existing lessons
- Configures gamification features

### `seed_duolingo_content.py`
- Populates with sample data
- Creates learning structure
- Generates comprehensive questions
- Sets up user progress

## 🔍 Verification

### Check Database Health
```sql
-- Verify table counts
SELECT 
  'worlds' as table_name, COUNT(*) as count FROM worlds
UNION ALL
SELECT 'modules', COUNT(*) FROM modules
UNION ALL
SELECT 'levels', COUNT(*) FROM levels
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- Check question types
SELECT question_type, COUNT(*) 
FROM questions 
GROUP BY question_type;

-- Verify enhanced content
SELECT title, content_json->'metadata'->>'learning_style' as style
FROM lessons 
WHERE content_json->'metadata'->>'learning_style' = 'duolingo';
```

### API Health Check
```bash
# Check backend health
curl http://localhost:8000/health

# Check database connection
curl http://localhost:8000/api/v1/health/db

# Verify lesson content
curl http://localhost:8000/api/v1/lessons/1
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker-compose -f docker-compose.duolingo.yml logs db

# Restart database
docker-compose -f docker-compose.duolingo.yml restart db
```

#### Migration Errors
```bash
# Reset database
docker-compose -f docker-compose.duolingo.yml down -v
docker-compose -f docker-compose.duolingo.yml up db -d

# Run migration again
cd stats-learning-backend
python scripts/migrate_duolingo_features.py
```

#### Content Not Loading
```bash
# Check lesson content
curl http://localhost:8000/api/v1/lessons/1 | jq '.content_json'

# Verify question types
curl http://localhost:8000/api/v1/lessons/1/questions
```

## 📚 Sample Data

The platform includes comprehensive sample data:

- **3 Learning Worlds**: Probability, Statistics, Data Analysis
- **9 Modules**: Basic concepts to advanced topics
- **18 Levels**: Progressive skill building
- **36 Lessons**: Duolingo-style interactive content
- **108 Questions**: Multiple types with real-world scenarios
- **Sample Users**: With progress and gamification data

## 🎮 Testing the Platform

1. **Start the platform**: `.\start_duolingo_platform.ps1`
2. **Open browser**: http://localhost:5173
3. **Create account** or use `student@example.com` / `password123`
4. **Start learning**: Click on any lesson card
5. **Experience Duolingo-style learning**:
   - Hearts and XP system
   - Real-world scenarios
   - Interactive questions
   - Progress tracking

## 🔄 Backup and Restore

### Backup Database
```bash
# Create backup
docker exec stats_learning_db pg_dump -U app appdb > backup.sql

# Compress backup
gzip backup.sql
```

### Restore Database
```bash
# Restore from backup
gunzip -c backup.sql.gz | docker exec -i stats_learning_db psql -U app appdb
```

## 📊 Performance Monitoring

### Database Metrics
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check query performance
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Application Metrics
- Response times via API health checks
- User engagement through progress tracking
- Learning effectiveness via question accuracy rates

---

## 🎉 Success!

Your Duolingo-style learning platform is now ready with:
- ✅ PostgreSQL database with all features
- ✅ Enhanced lesson content
- ✅ Multiple question types
- ✅ Gamification system
- ✅ Real-world scenarios
- ✅ Progress tracking
- ✅ Sample data for testing

Start learning and enjoy the interactive experience! 🚀
