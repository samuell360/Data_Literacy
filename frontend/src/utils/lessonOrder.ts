/**
 * Lesson Ordering Utilities
 * 
 * Provides consistent ordering for lessons across the application.
 * Supports explicit order, numeric prefix fallback, and title/slug sorting.
 */

export type OrderedItem = { 
  order?: number; 
  slug?: string; 
  title: string; 
  path?: string;
  lesson_id?: number;
  order_index?: number;
};

/**
 * Sort lessons by explicit order, then by numeric prefix, then by title/slug
 */
export function sortLessons<T extends OrderedItem>(lessons: T[]): T[] {
  return [...lessons].sort((a, b) => {
    // 1) By explicit order (order_index or order field)
    const aOrder = a.order_index ?? a.order ?? 1e9;
    const bOrder = b.order_index ?? b.order ?? 1e9;
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    // 2) By numeric prefix in slug/title (e.g., "01-what-is-probability")
    const aPrefix = parseNumericPrefix(a.slug || a.title);
    const bPrefix = parseNumericPrefix(b.slug || b.title);
    if (aPrefix !== null && bPrefix !== null) return aPrefix - bPrefix;
    if (aPrefix !== null) return -1;
    if (bPrefix !== null) return 1;
    
    // 3) By lesson_id as fallback
    if (a.lesson_id && b.lesson_id) return a.lesson_id - b.lesson_id;
    
    // 4) By title/slug alphabetically
    const aTitle = a.title || a.slug || '';
    const bTitle = b.title || b.slug || '';
    return aTitle.localeCompare(bTitle);
  });
}

/**
 * Extract numeric prefix from string (e.g., "01-foo" -> 1)
 */
function parseNumericPrefix(str: string): number | null {
  if (!str) return null;
  const match = str.match(/^(\d+)[-_]/);
  return match ? Number(match[1]) : null;
}

/**
 * Get the first lesson from a sorted array
 */
export function getFirstLesson<T extends OrderedItem>(lessons: T[]): T | null {
  const sorted = sortLessons(lessons);
  return sorted[0] || null;
}

/**
 * Get the next lesson after a given lesson
 */
export function getNextLesson<T extends OrderedItem>(
  lessons: T[], 
  currentLessonId?: number | string
): T | null {
  const sorted = sortLessons(lessons);
  
  if (!currentLessonId) {
    return sorted[0] || null;
  }
  
  const currentIndex = sorted.findIndex(lesson => 
    lesson.lesson_id === currentLessonId || 
    lesson.slug === currentLessonId
  );
  
  if (currentIndex === -1) {
    return sorted[0] || null;
  }
  
  return sorted[currentIndex + 1] || null;
}

/**
 * Get lesson by ID with proper ordering context
 */
export function getLessonById<T extends OrderedItem>(
  lessons: T[], 
  lessonId: number | string
): T | null {
  return lessons.find(lesson => 
    lesson.lesson_id === lessonId || 
    lesson.slug === lessonId
  ) || null;
}
