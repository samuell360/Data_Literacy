"""Development seed runner with better error handling and performance."""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.init_db import init_db
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.world import World
from app.models.module import Module
from app.models.level import Level
from app.models.lesson import Lesson
from app.models.question import Question, QuestionType, DifficultyTag


def get_content_path() -> Path:
    """Get the content directory path."""
    # Current file is in: project/stats-learning-backend/scripts/seed.py
    script_dir = Path(__file__).parent.resolve()
    backend_dir = script_dir.parent  # stats-learning-backend
    project_root = backend_dir.parent  # project root
    content_dir = project_root / "content" / "worlds" / "probability-world"
    
    if not content_dir.exists():
        raise FileNotFoundError(f"Content directory not found: {content_dir}")
    
    return content_dir


def load_content_file(topic_dir: str, filename: str, theme: str = "music"):
    """Load content from probability-world content files with theme replacement."""
    try:
        content_dir = get_content_path()
        filepath = content_dir / topic_dir / filename
        
        if not filepath.exists():
            print(f"Warning: Content file not found: {filepath}")
            return None
        
        with open(filepath, 'r', encoding='utf-8') as f:
            if filename.endswith('.json'):
                content = json.load(f)
                content_str = json.dumps(content)
                content_str = content_str.replace("{{THEME}}", theme)
                return json.loads(content_str)
            else:
                content = f.read()
                return content.replace("{{THEME}}", theme)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None


def upsert_user(db: Session, email: str, username: str, password: str, is_admin: bool = False) -> User:
    """Create or get existing user."""
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if user:
        print(f"User {email} already exists")
        return user
    
    user = User(
        email=email,
        username=username,
        hashed_password=get_password_hash(password),
        is_admin=is_admin,
        is_active=True,
        is_verified=True,
        login_count=0,
        timezone="UTC",
        preferred_language="en",
        public_profile=True,
        allow_emails=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(user)
    db.flush()
    print(f"Created user: {email}")
    return user


def upsert_content(db: Session, theme: str = "music") -> None:
    """Populate content with specified theme."""
    
    theme_config = {
        "music": {"icon": "🎵", "color": "#EC4899", "desc": "musical examples"},
        "movies": {"icon": "🎬", "color": "#F59E0B", "desc": "cinematic examples"},
        "gaming": {"icon": "🎮", "color": "#10B981", "desc": "gaming examples"},
        "coffee": {"icon": "☕", "color": "#92400E", "desc": "coffee culture examples"},
        "sneakers": {"icon": "👟", "color": "#7C3AED", "desc": "sneaker culture examples"},
        "sports": {"icon": "⚽", "color": "#3B82F6", "desc": "sports examples"},
        "food": {"icon": "🍕", "color": "#EF4444", "desc": "culinary examples"},
    }
    
    config = theme_config.get(theme, theme_config["music"])
    world_title = f"Probability World ({theme.capitalize()} Theme)"
    
    # Create or get world
    world = db.execute(select(World).where(World.title == world_title)).scalar_one_or_none()
    if not world:
        world = World(
            title=world_title,
            description=f"Master probability concepts through interactive learning with {config['desc']}.",
            icon=config["icon"],
            color=config["color"],
            order_index=1,
            difficulty_level=2,
            estimated_hours=15,
            is_active=True
        )
        db.add(world)
        db.flush()
        print(f"Created world: {world.title}")
    else:
        print(f"World already exists: {world.title}")
    
    # Single-module structure: one main module with all lessons combined
    topics = [
        {
            "module": "Probability World",
            "description": "All core and advanced probability topics in one module",
            "level": "Main Path",
            "difficulty": "REGULAR",
            "lessons": [
                ("What is Probability?", "01-what-is-probability", 15),
                ("Unions & Intersections", "02-union-and-intersection", 20),
                ("Conditional & Independence", "03-conditional-and-independence", 25),
                ("Counting Principles", "04-counting-principles", 20),
                ("Discrete RV & EMV", "05-discrete-rv-and-emv", 25),
                ("Binomial Distribution", "06-binomial", 30),
                ("Poisson Distribution", "a1-poisson", 25),
                ("Hypergeometric Distribution", "a2-hypergeometric", 30),
            ]
        }
    ]
    
    for module_idx, topic_group in enumerate(topics, 1):
        # Create or get module
        module = db.execute(
            select(Module).where(
                Module.world_id == world.id,
                Module.title == topic_group["module"]
            )
        ).scalar_one_or_none()
        
        if not module:
            module = Module(
                world_id=world.id,
                title=topic_group["module"],
                description=topic_group["description"],
                order_index=module_idx,
                estimated_minutes=sum(lesson[2] for lesson in topic_group["lessons"])
            )
            db.add(module)
            db.flush()
            print(f"  Created module: {module.title}")
        
        # Create or get level
        level = db.execute(
            select(Level).where(
                Level.module_id == module.id,
                Level.title == topic_group["level"]
            )
        ).scalar_one_or_none()
        
        if not level:
            level = Level(
                module_id=module.id,
                title=topic_group["level"],
                difficulty=topic_group["difficulty"],
                order_index=1,
                unlock_xp=(module_idx - 1) * 100
            )
            db.add(level)
            db.flush()
            print(f"    Created level: {level.title}")
        
        # Process lessons: move any existing lessons in this world into the unified level
        for lesson_idx, (title, topic_dir, minutes) in enumerate(topic_group["lessons"], 1):
            existing = db.execute(
                select(Lesson)
                .join(Level, Lesson.level_id == Level.id)
                .join(Module, Level.module_id == Module.id)
                .where(
                    Module.world_id == world.id,
                    Lesson.title == title,
                )
            ).scalar_one_or_none()
            
            # Load content files
            lesson_content = load_content_file(topic_dir, "Lesson.md", theme)
            summary_content = load_content_file(topic_dir, "Summary.md", theme)
            quiz_data = load_content_file(topic_dir, "Quiz.json", theme)
            sim_config = load_content_file(topic_dir, "SimConfig.json", theme)
            
            # Build content sections
            content_sections = []
            if lesson_content:
                content_sections.append({"type": "markdown", "content": lesson_content})
            if summary_content:
                content_sections.append({"type": "summary", "content": summary_content})
            
            if existing:
                # Update and move existing lesson into unified level
                setattr(existing, "level_id", level.id)
                setattr(existing, "slug", topic_dir)
                setattr(existing, "content_json", {"sections": content_sections})
                setattr(existing, "sim_config_json", sim_config)
                setattr(existing, "estimated_minutes", minutes)
                print(f"      Updated lesson: {title}")
            else:
                # Create new lesson
                lesson = Lesson(
                    level_id=level.id,
                    title=title,
                    slug=topic_dir,
                    learning_objectives=[
                        "Understand the core concepts",
                        "Work through interactive examples",
                        "Apply knowledge to practice problems",
                        "Build intuition through simulations"
                    ],
                    content_json={"sections": content_sections},
                    sim_config_json=sim_config,
                    estimated_minutes=minutes,
                    xp_reward=20 + (module_idx - 1) * 10,
                    is_published=True,
                    order_index=lesson_idx,
                )
                db.add(lesson)
                db.flush()
                print(f"      Created lesson: {title}")
                
                # Add quiz questions
                if quiz_data and isinstance(quiz_data, dict) and "items" in quiz_data:
                    type_map = {
                        "mcq": QuestionType.MCQ,
                        "tf": QuestionType.TRUE_FALSE,
                        "fill": QuestionType.SHORT_TEXT,
                        "match": QuestionType.MULTI_SELECT
                    }
                    diff_map = {
                        "easy": DifficultyTag.EASY,
                        "medium": DifficultyTag.MEDIUM,
                        "hard": DifficultyTag.HARD
                    }
                    
                    items = quiz_data.get("items", [])
                    if isinstance(items, list):
                        for item in items:
                            if isinstance(item, dict):
                                question = Question(
                                    lesson_id=lesson.id,
                                    stem=item.get("stem", ""),
                                    question_type=type_map.get(item.get("type", "mcq"), QuestionType.MCQ),
                                    options_json=item.get("choices", []) if item.get("type") == "mcq" else None,
                                    correct_answer=str(item.get("answerIndex", "")) if item.get("type") == "mcq" else str(item.get("answer", "")),
                                    difficulty_tag=diff_map.get(item.get("diff", "medium"), DifficultyTag.MEDIUM),
                                    explanation_correct=item.get("explain", ""),
                                    explanation_incorrect=f"Not quite. {item.get('explain', '')}",
                                    concept_tags=[topic_group["module"], title],
                                )
                                db.add(question)
                        print(f"        Added {len(items)} quiz questions")
    
    # Commit all changes once
    db.commit()
    print("\nContent seeding complete")


def run_seed(theme: str = "music") -> None:
    """Populate the database with baseline data."""
    print(f"\n{'='*60}")
    print(f"Starting database seed with '{theme}' theme")
    print(f"{'='*60}\n")
    
    try:
        # Ensure schema exists
        init_db()
        
        with SessionLocal() as db:
            # Create users
            print("Creating users...")
            upsert_user(db, "admin@example.com", "admin", "changethis123!", is_admin=True)
            upsert_user(db, "demo@example.com", "demo", "DemoPass123!", is_admin=False)
            db.commit()
            
            # Create content
            print("\nCreating content...")
            upsert_content(db, theme)
            
        print(f"\n{'='*60}")
        print(f"Seed complete!")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"\nError during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    valid_themes = ["music", "movies", "gaming", "coffee", "sneakers", "sports", "food"]
    theme = "music"
    
    if len(sys.argv) > 1:
        theme = sys.argv[1].lower()
        if theme not in valid_themes:
            print(f"Invalid theme '{theme}'")
            print(f"Valid themes: {', '.join(valid_themes)}")
            sys.exit(1)
    else:
        print(f"Usage: python scripts/seed.py [theme]")
        print(f"Available themes: {', '.join(valid_themes)}")
        print(f"Using default theme: {theme}\n")
    
    run_seed(theme)
