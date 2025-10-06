/**
 * Slides Registry
 *
 * Maps lesson slugs to Duolingo-style slides. Falls back to generating slides
 * from lesson content when a custom set isn't provided.
 */

import type { DuolingoSlide } from '../ui/DuolingoLessonViewer';
import { probabilityBasicsSlides } from './probability-basics-slides';
import { generateSlidesFromLesson } from '../utils/slideGenerator';

export const customSlidesBySlug: Record<string, DuolingoSlide[]> = {
  // Probability world - Lesson 1 has a handcrafted set
  'probability-world/01-what-is-probability': probabilityBasicsSlides,
  '01-what-is-probability': probabilityBasicsSlides, // Also support without world prefix
  'what-is-probability': probabilityBasicsSlides, // Also support without number prefix
};

export function getSlidesForLesson(
  slug: string,
  lessonData: any | null | undefined,
  fallbackTitle: string
): DuolingoSlide[] {
  const normalized = (slug || '').trim();
  
  if (normalized in customSlidesBySlug) {
    return customSlidesBySlug[normalized];
  }
  return generateSlidesFromLesson(lessonData, fallbackTitle);
}


