/**
 * Tests for lesson ordering utilities
 */

import { sortLessons, getFirstLesson, getNextLesson, type OrderedItem } from '../lessonOrder';

describe('lessonOrder', () => {
  const mockLessons: OrderedItem[] = [
    { lesson_id: 3, title: 'Third Lesson', slug: '03-third' },
    { lesson_id: 1, title: 'First Lesson', slug: '01-first' },
    { lesson_id: 2, title: 'Second Lesson', slug: '02-second' },
  ];

  describe('sortLessons', () => {
    it('should sort lessons by numeric prefix in slug', () => {
      const sorted = sortLessons(mockLessons);
      expect(sorted[0].slug).toBe('01-first');
      expect(sorted[1].slug).toBe('02-second');
      expect(sorted[2].slug).toBe('03-third');
    });

    it('should sort by explicit order_index when available', () => {
      const lessonsWithOrder = [
        { lesson_id: 1, title: 'A', order_index: 3 },
        { lesson_id: 2, title: 'B', order_index: 1 },
        { lesson_id: 3, title: 'C', order_index: 2 },
      ];
      const sorted = sortLessons(lessonsWithOrder);
      expect(sorted[0].lesson_id).toBe(2);
      expect(sorted[1].lesson_id).toBe(3);
      expect(sorted[2].lesson_id).toBe(1);
    });

    it('should fallback to lesson_id when no prefix or order', () => {
      const lessonsWithoutPrefix = [
        { lesson_id: 3, title: 'C' },
        { lesson_id: 1, title: 'A' },
        { lesson_id: 2, title: 'B' },
      ];
      const sorted = sortLessons(lessonsWithoutPrefix);
      expect(sorted[0].lesson_id).toBe(1);
      expect(sorted[1].lesson_id).toBe(2);
      expect(sorted[2].lesson_id).toBe(3);
    });
  });

  describe('getFirstLesson', () => {
    it('should return the first lesson after sorting', () => {
      const first = getFirstLesson(mockLessons);
      expect(first?.slug).toBe('01-first');
    });

    it('should return null for empty array', () => {
      const first = getFirstLesson([]);
      expect(first).toBeNull();
    });
  });

  describe('getNextLesson', () => {
    it('should return the next lesson after current', () => {
      const next = getNextLesson(mockLessons, 1);
      expect(next?.lesson_id).toBe(2);
    });

    it('should return first lesson when no current lesson', () => {
      const next = getNextLesson(mockLessons);
      expect(next?.slug).toBe('01-first');
    });

    it('should return null when current is last lesson', () => {
      const next = getNextLesson(mockLessons, 3);
      expect(next).toBeNull();
    });
  });
});
