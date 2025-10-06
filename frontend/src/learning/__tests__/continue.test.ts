/**
 * Continue Learning Logic Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  getLessonContinueStep,
  getNextLessonToContinue,
  getContinueHref,
  getNextLessonAfterComplete
} from '../continue';
import { 
  setLessonProgress,
  markLessonViewed,
  markSummaryViewed,
  markQuizAttempted,
  clearAllProgress
} from '../progress';

describe('Continue Learning Logic', () => {
  beforeEach(() => {
    clearAllProgress();
  });

  afterEach(() => {
    clearAllProgress();
  });

  describe('getLessonContinueStep', () => {
    it('should return lesson step for new lesson', () => {
      expect(getLessonContinueStep('test-lesson')).toBe('lesson');
    });

    it('should return summary step after lesson viewed', () => {
      markLessonViewed('test-lesson');
      expect(getLessonContinueStep('test-lesson')).toBe('summary');
    });

    it('should return quiz step after summary viewed', () => {
      markLessonViewed('test-lesson');
      markSummaryViewed('test-lesson');
      expect(getLessonContinueStep('test-lesson')).toBe('quiz');
    });

    it('should return result step after quiz attempted', () => {
      markLessonViewed('test-lesson');
      markSummaryViewed('test-lesson');
      markQuizAttempted('test-lesson', {
        score: 80,
        totalQuestions: 5,
        correctAnswers: 4,
        timeSpent: 120,
        answers: []
      });
      expect(getLessonContinueStep('test-lesson')).toBe('result');
    });
  });

  describe('getNextLessonToContinue', () => {
    const mockLessons = [
      { lesson_id: 1, slug: 'lesson-1', title: 'Lesson 1', order: 1 },
      { lesson_id: 2, slug: 'lesson-2', title: 'Lesson 2', order: 2 },
      { lesson_id: 3, slug: 'lesson-3', title: 'Lesson 3', order: 3 }
    ];

    it('should return first lesson for new user', () => {
      const result = getNextLessonToContinue(mockLessons);
      expect(result?.lesson.lesson_id).toBe(1);
      expect(result?.step).toBe('lesson');
    });

    it('should continue in-progress lesson', () => {
      markLessonViewed('lesson-1');
      
      const result = getNextLessonToContinue(mockLessons);
      expect(result?.lesson.lesson_id).toBe(1);
      expect(result?.step).toBe('summary');
    });

    it('should move to next lesson after completion', () => {
      // Complete first lesson
      markLessonViewed('lesson-1');
      markSummaryViewed('lesson-1');
      markQuizAttempted('lesson-1', {
        score: 80,
        totalQuestions: 5,
        correctAnswers: 4,
        timeSpent: 120,
        answers: []
      });

      const result = getNextLessonToContinue(mockLessons);
      expect(result?.lesson.lesson_id).toBe(2);
      expect(result?.step).toBe('lesson');
    });

    it('should return first lesson for review when all completed', () => {
      // Complete all lessons
      mockLessons.forEach(lesson => {
        markLessonViewed(lesson.slug);
        markSummaryViewed(lesson.slug);
        markQuizAttempted(lesson.slug, {
          score: 80,
          totalQuestions: 5,
          correctAnswers: 4,
          timeSpent: 120,
          answers: []
        });
      });

      const result = getNextLessonToContinue(mockLessons);
      expect(result?.lesson.lesson_id).toBe(1);
      expect(result?.step).toBe('lesson');
    });
  });

  describe('getContinueHref', () => {
    const mockLessons = [
      { lesson_id: 1, slug: 'lesson-1', title: 'Lesson 1', order: 1 }
    ];

    it('should generate correct URLs for each step', () => {
      expect(getContinueHref('probability', mockLessons)).toBe('/worlds/probability/lessons/lesson-1');
      
      markLessonViewed('lesson-1');
      expect(getContinueHref('probability', mockLessons)).toBe('/worlds/probability/lessons/lesson-1/summary');
      
      markSummaryViewed('lesson-1');
      expect(getContinueHref('probability', mockLessons)).toBe('/worlds/probability/lessons/lesson-1/quiz');
      
      markQuizAttempted('lesson-1', {
        score: 80,
        totalQuestions: 5,
        correctAnswers: 4,
        timeSpent: 120,
        answers: []
      });
      expect(getContinueHref('probability', mockLessons)).toBe('/worlds/probability/lessons/lesson-1/result');
    });
  });

  describe('getNextLessonAfterComplete', () => {
    const mockLessons = [
      { lesson_id: 1, slug: 'lesson-1', title: 'Lesson 1', order: 1 },
      { lesson_id: 2, slug: 'lesson-2', title: 'Lesson 2', order: 2 },
      { lesson_id: 3, slug: 'lesson-3', title: 'Lesson 3', order: 3 }
    ];

    it('should return next lesson in sequence', () => {
      const nextLesson = getNextLessonAfterComplete('lesson-1', mockLessons);
      expect(nextLesson?.lesson_id).toBe(2);
    });

    it('should return null for last lesson', () => {
      const nextLesson = getNextLessonAfterComplete('lesson-3', mockLessons);
      expect(nextLesson).toBeNull();
    });

    it('should return null for unknown lesson', () => {
      const nextLesson = getNextLessonAfterComplete('unknown-lesson', mockLessons);
      expect(nextLesson).toBeNull();
    });
  });
});
