/**
 * Lesson Progress Management
 * 
 * Handles progress tracking for the lesson flow system
 */

export interface LessonProgress {
  viewedLesson: boolean;
  viewedSummary: boolean;
  quizAttempted: boolean;
  passed?: boolean;
  score?: number;
  timeSpent?: number;
  lastStep?: string;
  completedAt?: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
  }>;
}

// Configuration
export const PASS_THRESHOLD = 0; // 0 = attempt required only, >0 = minimum score required
export const STORAGE_PREFIX = 'lesson_progress_';

/**
 * Get lesson progress from localStorage
 */
export function getLessonProgress(lessonSlug: string): LessonProgress {
  const key = `${STORAGE_PREFIX}${lessonSlug}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Failed to parse lesson progress:', error);
    }
  }
  
  // Default progress
  return {
    viewedLesson: false,
    viewedSummary: false,
    quizAttempted: false,
  };
}

/**
 * Update lesson progress in localStorage
 */
function setLessonProgress(
  lessonSlug: string, 
  patch: Partial<LessonProgress>
): LessonProgress {
  const current = getLessonProgress(lessonSlug);
  const updated = { ...current, ...patch };
  
  const key = `${STORAGE_PREFIX}${lessonSlug}`;
  localStorage.setItem(key, JSON.stringify(updated));
  
  // TODO: Add server sync when backend endpoint is ready
  // syncProgressToServer(lessonSlug, updated).catch(error => {
  //   console.warn('Failed to sync progress to server:', error);
  // });
  
  return updated;
}

/**
 * Mark lesson as viewed
 */
export function markLessonViewed(lessonSlug: string): LessonProgress {
  return setLessonProgress(lessonSlug, {
    viewedLesson: true,
    lastStep: 'lesson'
  });
}

/**
 * Mark summary as viewed
 */
export function markSummaryViewed(lessonSlug: string): LessonProgress {
  return setLessonProgress(lessonSlug, {
    viewedSummary: true,
    lastStep: 'summary'
  });
}

/**
 * Mark quiz as attempted with results
 */
export function markQuizAttempted(
  lessonSlug: string, 
  result: QuizResult
): LessonProgress {
  const passed = result.score >= PASS_THRESHOLD;
  
  return setLessonProgress(lessonSlug, {
    quizAttempted: true,
    score: result.score,
    passed,
    timeSpent: result.timeSpent,
    lastStep: 'quiz',
    completedAt: new Date().toISOString()
  });
}

/**
 * Check if lesson can be marked as complete
 */
function canCompleteLesson(lessonSlug: string): boolean {
  const progress = getLessonProgress(lessonSlug);
  return progress.quizAttempted && (PASS_THRESHOLD === 0 || progress.passed === true);
}

/**
 * Check if user can advance to next lesson
 */
export function canAdvanceToNextLesson(lessonSlug: string): boolean {
  return canCompleteLesson(lessonSlug);
}


/**
 * Sync progress to server (when authenticated)
 * TODO: Implement when backend endpoint is ready
 */
// async function syncProgressToServer(
//   lessonSlug: string, 
//   progress: LessonProgress
// ): Promise<void> {
//   const token = localStorage.getItem('auth_token');
//   if (!token) return; // Not authenticated
//   
//   try {
//     const response = await fetch('/api/v1/progress/lesson-flow', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         lessonSlug,
//         progress
//       })
//     });
//     
//     if (!response.ok) {
//       throw new Error(`Server sync failed: ${response.status}`);
//     }
//   } catch (error) {
//     // Fail silently - local storage is the source of truth
//     console.debug('Progress sync to server failed:', error);
//   }
// }

