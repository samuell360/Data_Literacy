# New Flow Migration Plan

## Stack Detection
- **Framework**: React SPA with Vite (not Next.js)
- **Router**: Custom screen-based routing in App.tsx (not React Router)
- **Current Architecture**: Single-page application with modal-based lessons

## Current OLD Flow Components (To Remove)
- `src/components/stats-ui/lesson-viewer.tsx` - Modal lesson viewer with embedded questions
- `src/components/lesson/LessonPlayer.tsx` - Single-session lesson player with inline questions
- `src/components/debug/LessonTest.tsx` - Debug component for testing old flow
- Modal-based lesson system in `learning-path.tsx`

## Current OLD Flow Entry Points
- Learning Path component opens modal lesson viewer
- Direct lesson access without structured steps
- Embedded questions within lesson content
- Single completion step

## NEW Flow Target Architecture
Since this is a custom screen-based app (not Next.js/React Router), we'll implement:
- State-based routing within the learning path component
- Four distinct screens: Lesson → Summary → Quiz → Result
- Progress tracking with localStorage + server sync
- Mandatory quiz completion before advancement

## Migration Strategy
1. **Keep existing screen-based architecture** but add flow states
2. **Replace modal lesson viewer** with structured flow screens
3. **Remove old LessonViewer and LessonPlayer** components
4. **Update learning-path.tsx** to use new flow system exclusively
5. **Remove debug components** and old flow toggles

## Files to Remove (OLD Flow)
- `src/components/stats-ui/lesson-viewer.tsx`
- `src/components/lesson/LessonPlayer.tsx`
- `src/components/debug/LessonTest.tsx`
- Old flow logic in `learning-path.tsx`

## Files to Keep/Modify
- `src/components/screens/learning-path.tsx` - Update to use new flow only
- `src/learning/ui/FlowLessonViewer.tsx` - Enhanced for full replacement
- All new flow components in `src/learning/`

## Content Contract
- Lessons will use API data structure with fallback content generation
- Quiz questions extracted from lesson data or generated
- Summary content from lesson data or auto-generated
- No separate markdown files needed (API-driven)

## Implementation Status
- [x] Stack detection completed
- [x] Migration plan documented
- [ ] Remove old flow components
- [ ] Update learning path to new flow only
- [ ] Remove debug components
- [ ] Clean up unused imports and code
- [ ] Update tests
- [ ] Verify all acceptance criteria
