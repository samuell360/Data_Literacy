/**
 * Simple cache invalidation system for progress updates
 * This will be replaced with TanStack Query in a future iteration
 */

type CacheInvalidationListener = () => void;

class SimpleCache {
  private listeners: Map<string, Set<CacheInvalidationListener>> = new Map();

  subscribe(key: string, listener: CacheInvalidationListener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(listener);
        if (keyListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  invalidate(key: string) {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => listener());
    }
  }

  invalidateAll() {
    this.listeners.forEach((listeners) => {
      listeners.forEach(listener => listener());
    });
  }
}

export const cache = new SimpleCache();

// Cache keys
export const CACHE_KEYS = {
  PROGRESS_SUMMARY: 'progressSummary',
  NEXT_STEP: 'nextStep',
  USER_PROGRESS: 'userProgress',
  WORLDS: 'worlds',
} as const;

// Helper to invalidate progress-related caches after mutations
export function invalidateProgressCaches() {
  cache.invalidate(CACHE_KEYS.PROGRESS_SUMMARY);
  cache.invalidate(CACHE_KEYS.NEXT_STEP);
  cache.invalidate(CACHE_KEYS.USER_PROGRESS);
}
