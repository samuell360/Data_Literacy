/**
 * Next Lesson Utilities
 * 
 * Provides logic for determining the next lesson to show to users.
 * Handles the "Continue Learning" button behavior.
 */

import { getFirstLesson, getNextLesson, type OrderedItem } from './lessonOrder';

export interface LessonWithStatus extends OrderedItem {
  lesson_id: number;
  status: string;
  locked?: boolean;
  estimated_minutes?: number;
}

/**
 * Get the next lesson for the "Continue Learning" button
 * Priority: Started lesson > First available lesson > First lesson (even if locked)
 */
export function getNextLessonForContinue(lessons: LessonWithStatus[]): LessonWithStatus | null {
  if (!lessons || lessons.length === 0) return null;
  
  // 1) Find any started lesson
  const startedLesson = lessons.find(lesson => lesson.status === 'STARTED');
  if (startedLesson) return startedLesson;
  
  // 2) Find first non-completed lesson (even if locked)
  const firstIncomplete = lessons.find(lesson => 
    !['COMPLETED', 'MASTERED'].includes(lesson.status)
  );
  if (firstIncomplete) return firstIncomplete;
  
  // 3) Fallback to first lesson (even if completed/locked)
  return getFirstLesson(lessons);
}


/**
 * Get lesson status for display
 */
export function getLessonDisplayStatus(lesson: LessonWithStatus): 'New' | 'Started' | 'Mastered' | 'Locked' {
  if (lesson.locked) return 'Locked';
  if (lesson.status === 'MASTERED') return 'Mastered';
  if (['COMPLETED', 'STARTED'].includes(lesson.status)) return 'Started';
  return 'New';
}
