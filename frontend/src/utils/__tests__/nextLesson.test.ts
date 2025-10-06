/**
 * Tests for next lesson utilities
 */

import { 
  getNextLessonForContinue, 
  getLessonDisplayStatus, 
  isLessonReadOnly,
  type LessonWithStatus 
} from '../nextLesson';

describe('nextLesson', () => {
  const mockLessons: LessonWithStatus[] = [
    { lesson_id: 1, title: 'First Lesson', status: 'NEW', locked: false },
    { lesson_id: 2, title: 'Second Lesson', status: 'STARTED', locked: false },
    { lesson_id: 3, title: 'Third Lesson', status: 'NEW', locked: true },
    { lesson_id: 4, title: 'Fourth Lesson', status: 'COMPLETED', locked: false },
  ];

  describe('getNextLessonForContinue', () => {
    it('should return started lesson if available', () => {
      const next = getNextLessonForContinue(mockLessons);
      expect(next?.lesson_id).toBe(2);
    });

    it('should return first incomplete lesson if no started lesson', () => {
      const lessonsWithoutStarted = mockLessons.map(l => 
        l.lesson_id === 2 ? { ...l, status: 'COMPLETED' } : l
      );
      const next = getNextLessonForContinue(lessonsWithoutStarted);
      expect(next?.lesson_id).toBe(1);
    });

    it('should return first lesson even if locked', () => {
      const allLockedLessons = mockLessons.map(l => ({ ...l, locked: true }));
      const next = getNextLessonForContinue(allLockedLessons);
      expect(next?.lesson_id).toBe(1);
    });

    it('should return null for empty array', () => {
      const next = getNextLessonForContinue([]);
      expect(next).toBeNull();
    });
  });

  describe('getLessonDisplayStatus', () => {
    it('should return Locked for locked lessons', () => {
      const status = getLessonDisplayStatus({ lesson_id: 1, title: 'Test', status: 'NEW', locked: true });
      expect(status).toBe('Locked');
    });

    it('should return Mastered for MASTERED status', () => {
      const status = getLessonDisplayStatus({ lesson_id: 1, title: 'Test', status: 'MASTERED', locked: false });
      expect(status).toBe('Mastered');
    });

    it('should return Started for COMPLETED or STARTED status', () => {
      const startedStatus = getLessonDisplayStatus({ lesson_id: 1, title: 'Test', status: 'STARTED', locked: false });
      const completedStatus = getLessonDisplayStatus({ lesson_id: 1, title: 'Test', status: 'COMPLETED', locked: false });
      expect(startedStatus).toBe('Started');
      expect(completedStatus).toBe('Started');
    });

    it('should return New for NEW status', () => {
      const status = getLessonDisplayStatus({ lesson_id: 1, title: 'Test', status: 'NEW', locked: false });
      expect(status).toBe('New');
    });
  });

  describe('isLessonReadOnly', () => {
    it('should return true for locked lessons', () => {
      const readOnly = isLessonReadOnly({ lesson_id: 1, title: 'Test', status: 'NEW', locked: true });
      expect(readOnly).toBe(true);
    });

    it('should return true for completed lessons', () => {
      const readOnly = isLessonReadOnly({ lesson_id: 1, title: 'Test', status: 'COMPLETED', locked: false });
      expect(readOnly).toBe(true);
    });

    it('should return false for new or started lessons', () => {
      const newReadOnly = isLessonReadOnly({ lesson_id: 1, title: 'Test', status: 'NEW', locked: false });
      const startedReadOnly = isLessonReadOnly({ lesson_id: 1, title: 'Test', status: 'STARTED', locked: false });
      expect(newReadOnly).toBe(false);
      expect(startedReadOnly).toBe(false);
    });
  });
});
