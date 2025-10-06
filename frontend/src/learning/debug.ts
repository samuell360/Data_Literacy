/**
 * Debug utilities for lesson flow
 */

import { STORAGE_PREFIX } from './progress';

/**
 * Clear all lesson progress (for testing)
 */
export function clearAllLessonProgress(): void {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`Cleared ${keysToRemove.length} lesson progress entries`);
}

/**
 * Get all lesson progress for debugging
 */
export function getAllLessonProgress(): Record<string, any> {
  const progress: Record<string, any> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      const lessonSlug = key.replace(STORAGE_PREFIX, '');
      try {
        progress[lessonSlug] = JSON.parse(localStorage.getItem(key) || '{}');
      } catch (error) {
        progress[lessonSlug] = 'Parse error';
      }
    }
  }
  
  return progress;
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAllLessonProgress = clearAllLessonProgress;
  (window as any).getAllLessonProgress = getAllLessonProgress;
  console.log('Debug functions available: clearAllLessonProgress(), getAllLessonProgress()');
}
