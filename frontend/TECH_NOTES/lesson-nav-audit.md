Fix overview — lesson navigation, soft-lock, ordering

- Stack: Vite + React 18 + SPA (no router), local state navigation via `App.tsx`.
- Data sources: lessons via `contentApi.getLessons(worldId?)`; single lesson via `progressApi.getLesson(lessonId)`.

Changes

- LessonCard: remove hard click-disable for `Locked`; keep visuals, clicks always fire (`src/components/stats-ui/lesson-card.tsx`).
- LearningPath: sort lessons by `lesson_id` ascending; add `defaultOpen` to auto-open first lesson; track `activeLessonLocked` to pass soft-lock (`src/components/screens/learning-path.tsx`).
- Dashboard → Continue: now triggers learning screen with `defaultOpen` to open first lesson (`src/App.tsx`).
- LessonViewer: add `readOnly` (soft-lock) mode; skip start/complete calls when soft-locked; show preview banner; fallback to generated content if fetch fails (`src/components/stats-ui/lesson-viewer.tsx`).
- LessonPlayer: accept `readOnly` and hide hearts/XP counters in preview (`src/components/lesson/LessonPlayer.tsx`).

Notes

- Authentication gate remains for non-readOnly usage; LearningPath opts into preview for locked lessons.
- Ordering: applied at fetch site; can be centralized later via a util if needed.
- No destructive deletions performed; further cleanup can be done with depcheck/ts-prune.

Acceptance checks

- Continue opens Learning → first (STARTED/NEW or first) lesson modal.
- Clicking any lesson opens modal; locked lessons show preview banner; interactions allowed but XP/progress not recorded.
- Lesson list ordered consistently by `lesson_id`.

