/**
 * Progress Management Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  getLessonProgress,
  setLessonProgress,
  markLessonViewed,
  markSummaryViewed,
  markQuizAttempted,
  canCompleteLesson,
  canAdvanceToNextLesson,
  clearAllProgress,
  getLessonsProgressSummary,
  isLessonProgressLocked,
  PASS_THRESHOLD
} from '../progress';

describe('Progress Management', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearAllProgress();
  });

  afterEach(() => {
    // Clean up after each test
    clearAllProgress();
  });

  describe('getLessonProgress', () => {
    it('should return default progress for new lesson', () => {
      const progress = getLessonProgress('test-lesson');
      expect(progress).toEqual({
        viewedLesson: false,
        viewedSummary: false,
        quizAttempted: false
      });
    });

    it('should return stored progress', () => {
      setLessonProgress('test-lesson', { viewedLesson: true });
      const progress = getLessonProgress('test-lesson');
      expect(progress.viewedLesson).toBe(true);
    });
  });

  describe('setLessonProgress', () => {
    it('should update progress correctly', () => {
      const updated = setLessonProgress('test-lesson', { 
        viewedLesson: true,
        score: 85 
      });
      
      expect(updated.viewedLesson).toBe(true);
      expect(updated.score).toBe(85);
      expect(updated.viewedSummary).toBe(false); // Should preserve defaults
    });

    it('should merge with existing progress', () => {
      setLessonProgress('test-lesson', { viewedLesson: true });
      const updated = setLessonProgress('test-lesson', { viewedSummary: true });
      
      expect(updated.viewedLesson).toBe(true);
      expect(updated.viewedSummary).toBe(true);
    });
  });

  describe('markLessonViewed', () => {
    it('should mark lesson as viewed', () => {
      const progress = markLessonViewed('test-lesson');
      expect(progress.viewedLesson).toBe(true);
      expect(progress.lastStep).toBe('lesson');
    });
  });

  describe('markSummaryViewed', () => {
    it('should mark summary as viewed', () => {
      const progress = markSummaryViewed('test-lesson');
      expect(progress.viewedSummary).toBe(true);
      expect(progress.lastStep).toBe('summary');
    });
  });

  describe('markQuizAttempted', () => {
    it('should mark quiz as attempted with results', () => {
      const mockResult = {
        score: 80,
        totalQuestions: 5,
        correctAnswers: 4,
        timeSpent: 120,
        answers: []
      };

      const progress = markQuizAttempted('test-lesson', mockResult);
      
      expect(progress.quizAttempted).toBe(true);
      expect(progress.score).toBe(80);
      expect(progress.passed).toBe(true); // Assuming PASS_THRESHOLD is 0
      expect(progress.lastStep).toBe('quiz');
      expect(progress.completedAt).toBeDefined();
    });
  });

  describe('canCompleteLesson', () => {
    it('should require quiz attempt', () => {
      expect(canCompleteLesson('test-lesson')).toBe(false);
      
      markQuizAttempted('test-lesson', {
        score: 60,
        totalQuestions: 5,
        correctAnswers: 3,
        timeSpent: 120,
        answers: []
      });
      
      expect(canCompleteLesson('test-lesson')).toBe(true);
    });
  });

  describe('canAdvanceToNextLesson', () => {
    it('should be same as canCompleteLesson', () => {
      const lessonSlug = 'test-lesson';
      expect(canAdvanceToNextLesson(lessonSlug)).toBe(canCompleteLesson(lessonSlug));
    });
  });

  describe('getLessonsProgressSummary', () => {
    it('should calculate progress summary correctly', () => {
      const lessons = [
        { lesson_id: 1, slug: 'lesson-1', title: 'Lesson 1' },
        { lesson_id: 2, slug: 'lesson-2', title: 'Lesson 2' },
        { lesson_id: 3, slug: 'lesson-3', title: 'Lesson 3' }
      ];

      // Mark first lesson as completed
      markQuizAttempted('lesson-1', {
        score: 80,
        totalQuestions: 5,
        correctAnswers: 4,
        timeSpent: 120,
        answers: []
      });

      // Mark second lesson as in progress
      markLessonViewed('lesson-2');

      const summary = getLessonsProgressSummary(lessons);
      
      expect(summary.total).toBe(3);
      expect(summary.completed).toBe(1);
      expect(summary.inProgress).toBe(1);
      expect(summary.notStarted).toBe(1);
      expect(summary.completionPercentage).toBe(33); // 1/3 * 100, rounded
    });
  });

  describe('isLessonProgressLocked', () => {
    it('should not lock first lesson', () => {
      const lessons = [
        { lesson_id: 1, slug: 'lesson-1', title: 'Lesson 1' },
        { lesson_id: 2, slug: 'lesson-2', title: 'Lesson 2' }
      ];

      expect(isLessonProgressLocked('lesson-1', lessons)).toBe(false);
    });

    it('should lock subsequent lessons if previous not completed', () => {
      const lessons = [
        { lesson_id: 1, slug: 'lesson-1', title: 'Lesson 1' },
        { lesson_id: 2, slug: 'lesson-2', title: 'Lesson 2' }
      ];

      expect(isLessonProgressLocked('lesson-2', lessons)).toBe(true);

      // Complete first lesson
      markQuizAttempted('lesson-1', {
        score: 80,
        totalQuestions: 5,
        correctAnswers: 4,
        timeSpent: 120,
        answers: []
      });

      expect(isLessonProgressLocked('lesson-2', lessons)).toBe(false);
    });
  });
});
