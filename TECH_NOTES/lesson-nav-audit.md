# Lesson Navigation Audit Report

## Project Analysis

**Framework**: React with Vite (not Next.js)
**Routing**: Custom state-based navigation (no React Router)
**Backend**: FastAPI with PostgreSQL
**Data Model**: World → Module → Level → Lesson hierarchy

## Bug Analysis: "Continue lesson" → first lesson click does nothing

### Root Cause Identified

The issue is in `Stat Learning-frontend/src/components/screens/learning-path.tsx` lines 243-262:

```typescript
<Button className="flex items-center gap-2" disabled={actionLoading} onClick={async () => {
  if (activeLessonId) {
    await startOrContinue(activeLessonId);
    return;
  }
  try {
    setActionLoading(true);
    const next = await progressApi.getNextStep();
    if (next?.lessonId) {
      await startOrContinue(next.lessonId);
    }
  } catch (e) {
    console.error('Failed to continue learning', e);
  } finally {
    setActionLoading(false);
  }
}}>
```

**Problems:**
1. **No fallback for first lesson**: When `activeLessonId` is null and `getNextStep()` fails or returns null, nothing happens
2. **Missing lesson opening**: The `startOrContinue` function only calls `setActiveLessonId` but doesn't open the lesson viewer
3. **No error handling for empty lesson list**: If no lessons are loaded, the button does nothing

### Additional Issues Found

1. **Hard locking**: Lessons are marked as `locked: true` in the backend, preventing access
2. **No lesson ordering**: Lessons are sorted by `lesson_id` instead of proper ordering
3. **Missing soft-lock pattern**: Locked lessons are completely inaccessible instead of read-only
4. **Inconsistent navigation**: Dashboard "Continue Learning" vs Learning Path "Continue Learning" behave differently

## Fixes Required

### 1. Fix Continue Button Logic
- Add fallback to first lesson when `getNextStep()` fails
- Ensure lesson viewer opens after setting active lesson
- Add proper error handling

### 2. Implement Soft-Lock Pattern
- Allow all lessons to be clickable
- Show preview banner for locked lessons
- Disable progress tracking for locked lessons

### 3. Enforce Lesson Ordering
- Create proper ordering utility
- Sort lessons by explicit order or numeric prefix
- Ensure consistent ordering across components

### 4. Backend Updates
- Remove hard locking from lesson access
- Add proper lesson ordering support
- Ensure locked lessons return 200 with lock status

## Files to Modify

### Frontend
- `src/components/screens/learning-path.tsx` - Fix Continue button logic
- `src/components/stats-ui/lesson-card.tsx` - Implement soft-lock
- `src/components/stats-ui/lesson-viewer.tsx` - Add soft-lock banner
- `src/utils/lessonOrder.ts` - New utility for ordering
- `src/utils/nextLesson.ts` - New utility for next lesson logic

### Backend
- `app/api/v1/routes/progress.py` - Remove hard locking
- `app/models/lesson.py` - Add proper ordering support

### Tests
- Add unit tests for lesson ordering
- Add component tests for soft-lock
- Add E2E tests for navigation flow

## Acceptance Criteria

- ✅ Clicking "Continue Learning" always opens the first lesson
- ✅ All lessons are clickable (soft-lock for locked ones)
- ✅ Locked lessons show preview banner
- ✅ Lesson ordering is consistent
- ✅ All tests pass
- ✅ No unused code remains
