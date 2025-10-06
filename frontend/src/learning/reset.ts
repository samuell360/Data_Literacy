/**
 * Reset utilities for lesson flow debugging
 */

import { STORAGE_PREFIX } from './progress';

/**
 * Reset a specific lesson to start from the beginning
 */
export function resetLessonProgress(lessonSlug: string): void {
  const key = `${STORAGE_PREFIX}${lessonSlug}`;
  localStorage.removeItem(key);
  console.log(`Reset progress for lesson: ${lessonSlug}`);
}

/**
 * Reset all lesson progress
 */
export function resetAllProgress(): void {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`Reset progress for ${keysToRemove.length} lessons`);
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).resetLessonProgress = resetLessonProgress;
  (window as any).resetAllProgress = resetAllProgress;
}
