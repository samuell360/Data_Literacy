/**
 * Continue Learning Logic
 * 
 * Determines where the user should go when clicking "Continue Learning"
 */

import { FlowStep } from './flow';
import { getLessonProgress, canAdvanceToNextLesson } from './progress';
import { sortLessons } from '../utils/lessonOrder';

export interface LessonInfo {
  lesson_id: number;
  slug: string;
  title: string;
  order?: number;
  order_index?: number;
  status?: string;
  locked?: boolean;
}

/**
 * Get the continue URL for a specific lesson based on progress
 */
export function getLessonContinueStep(lessonSlug: string): FlowStep {
  const progress = getLessonProgress(lessonSlug);
  
  // If quiz attempted, show results
  if (progress.quizAttempted) {
    return 'result';
  }
  
  // If summary viewed but quiz not attempted, go to quiz
  if (progress.viewedSummary && !progress.quizAttempted) {
    return 'quiz';
  }
  
  // If lesson viewed but summary not viewed, go to summary
  if (progress.viewedLesson && !progress.viewedSummary) {
    return 'summary';
  }
  
  // Default to lesson
  return 'lesson';
}

/**
 * Get the next lesson to continue with based on progress across all lessons
 */
export function getNextLessonToContinue(lessons: LessonInfo[]): {
  lesson: LessonInfo;
  step: FlowStep;
} | null {
  if (!lessons || lessons.length === 0) return null;
  
  const sortedLessons = sortLessons(lessons);
  
  // 1. Find any lesson that's in progress (started but not completed)
  for (const lesson of sortedLessons) {
    const progress = getLessonProgress(lesson.slug);
    const step = getLessonContinueStep(lesson.slug);
    
    // If lesson is in progress (viewed but not completed), continue it
    if (progress.viewedLesson && !canAdvanceToNextLesson(lesson.slug)) {
      return { lesson, step };
    }
  }
  
  // 2. Find the first lesson that hasn't been completed
  for (const lesson of sortedLessons) {
    if (!canAdvanceToNextLesson(lesson.slug)) {
      const step = getLessonContinueStep(lesson.slug);
      return { lesson, step };
    }
  }
  
  // 3. If all lessons are completed, return the first lesson for review
  const firstLesson = sortedLessons[0];
  if (firstLesson) {
    return { lesson: firstLesson, step: 'lesson' };
  }
  
  return null;
}



/**
 * Get progress summary for all lessons
 */
export function getLessonsProgressSummary(lessons: LessonInfo[]): {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionPercentage: number;
} {
  if (!lessons || lessons.length === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      completionPercentage: 0
    };
  }
  
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  
  lessons.forEach(lesson => {
    const progress = getLessonProgress(lesson.slug);
    
    if (canAdvanceToNextLesson(lesson.slug)) {
      completed++;
    } else if (progress.viewedLesson) {
      inProgress++;
    } else {
      notStarted++;
    }
  });
  
  const total = lessons.length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total,
    completed,
    inProgress,
    notStarted,
    completionPercentage
  };
}

