"""
Quiz Routes

API endpoints for quiz questions and quiz management.
"""

from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_optional_current_user
from app.models.user import User
from app.models.lesson import Lesson
from app.models.question import Question

router = APIRouter()


@router.get("/lesson/{lesson_id}/questions")
async def get_quiz_questions(
    *,
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
) -> Any:
    """
    Get quiz questions for a specific lesson.
    
    Returns questions in the format expected by the frontend.
    """
    # Verify lesson exists
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    # Get questions for this lesson
    questions = (
        db.query(Question)
        .filter(Question.lesson_id == lesson_id)
        .order_by(Question.id)
        .all()
    )
    
    # Format questions for frontend
    quiz_data = []
    for q in questions:
        question_data = {
            "id": q.id,
            "type": q.question_type.value.lower(),  # Convert enum to lowercase string
            "question": q.stem,
            "correct_answer": q.correct_answer,
        }
        
        # Add options for MCQ questions
        if q.question_type.value == "MCQ" and q.options_json:
            question_data["options"] = q.options_json
            
        # Add explanations if available
        if q.explanation_correct:
            question_data["explanation_correct"] = q.explanation_correct
        if q.explanation_incorrect:
            question_data["explanation_incorrect"] = q.explanation_incorrect
            
        # Add hint if available
        if q.hint_text:
            question_data["hint"] = q.hint_text
            
        quiz_data.append(question_data)
    
    return {
        "lesson_id": lesson_id,
        "questions": quiz_data,
        "total_questions": len(quiz_data)
    }


@router.post("/lesson/{lesson_id}/submit")
async def submit_quiz(
    *,
    lesson_id: int,
    answers: List[dict],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Submit quiz answers and get results.
    
    Expected format for answers:
    [
        {"question_id": 1, "answer": "A"},
        {"question_id": 2, "answer": "0.5"},
        ...
    ]
    """
    # Verify lesson exists
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    # Get all questions for this lesson
    questions = (
        db.query(Question)
        .filter(Question.lesson_id == lesson_id)
        .all()
    )
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questions found for this lesson"
        )
    
    # Create a map of question_id -> question for easy lookup
    question_map = {q.id: q for q in questions}
    
    # Grade the answers
    results = []
    correct_count = 0
    total_questions = len(questions)
    
    for answer_data in answers:
        question_id = answer_data.get("question_id")
        user_answer = str(answer_data.get("answer", "")).strip()
        
        if question_id not in question_map:
            continue
            
        question = question_map[question_id]
        correct_answer = str(question.correct_answer).strip()
        
        # Check if answer is correct
        is_correct = False
        if question.question_type.value == "MCQ":
            # For MCQ, compare option indices or text
            is_correct = user_answer == correct_answer
        elif question.question_type.value == "SHORT_TEXT":
            # For text questions, do case-insensitive comparison
            is_correct = user_answer.lower() == correct_answer.lower()
        elif question.question_type.value == "NUMERIC":
            # For numeric questions, use tolerance if available
            try:
                user_num = float(user_answer)
                correct_num = float(correct_answer)
                tolerance = question.numeric_tolerance or 0.01
                is_correct = abs(user_num - correct_num) <= tolerance
            except ValueError:
                is_correct = False
        
        if is_correct:
            correct_count += 1
            
        results.append({
            "question_id": question_id,
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "explanation": question.explanation_correct if is_correct else question.explanation_incorrect
        })
    
    # Calculate score
    score = correct_count / total_questions if total_questions > 0 else 0
    
    return {
        "lesson_id": lesson_id,
        "score": score,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "passed": score >= 0.7,  # 70% passing threshold
        "results": results
    }
