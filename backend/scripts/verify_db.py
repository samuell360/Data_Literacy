"""Verify database content after seeding."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.world import World
from app.models.module import Module
from app.models.level import Level
from app.models.lesson import Lesson
from app.models.question import Question


def verify():
    with SessionLocal() as db:
        print("\n" + "="*60)
        print("DATABASE CONTENT VERIFICATION")
        print("="*60 + "\n")
        
        worlds = db.query(World).all()
        print(f"Total Worlds: {len(worlds)}")
        
        if not worlds:
            print("⚠️  No worlds found! Run: python scripts/seed.py music")
            return
        
        for world in worlds:
            print(f"\n📚 {world.title} (ID: {world.id})")
            print(f"   Description: {world.description}")
            print(f"   Active: {world.is_active}")
            
            modules = db.query(Module).filter(Module.world_id == world.id).order_by(Module.order_index).all()
            print(f"   Modules: {len(modules)}")
            
            for module in modules:
                levels = db.query(Level).filter(Level.module_id == module.id).all()
                total_lessons = sum(
                    db.query(Lesson).filter(Lesson.level_id == level.id).count()
                    for level in levels
                )
                print(f"      • {module.title}: {total_lessons} lessons")
                
                for level in levels:
                    lessons = db.query(Lesson).filter(Lesson.level_id == level.id).order_by(Lesson.order_index).all()
                    for lesson in lessons:
                        question_count = db.query(Question).filter(Question.lesson_id == lesson.id).count()
                        has_content = bool(lesson.content_json and lesson.content_json.get("sections"))
                        status = "✓" if has_content else "✗"
                        print(f"         {status} {lesson.title} ({lesson.estimated_minutes}min, {question_count} questions)")
        
        print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    verify()