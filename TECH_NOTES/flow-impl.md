# Lesson Flow Implementation

## Framework Detection
- **Framework**: React SPA with Vite (not Next.js)
- **Router**: Custom screen-based routing in App.tsx (not React Router)
- **Current Structure**: Single-page application with screen switching

## Current Lesson System
- **Lesson Viewer**: Modal-based lesson display (`LessonViewer` component)
- **Content Source**: API-based lesson content from backend
- **Progress Tracking**: Backend API with real-time updates
- **Current Flow**: Direct lesson access without mandatory steps

## Implementation Plan

### 1. Flow State Machine
- Create `src/learning/flow.ts` for step management
- Create `src/learning/progress.ts` for progress tracking
- Create `src/learning/continue.ts` for navigation logic

### 2. Routing Structure
Since this is a custom screen-based app (not React Router), we'll implement:
- Nested lesson states within the LearningPath component
- URL-like state management for lesson steps
- Modal-based flow progression

### 3. Content Contract
- Ensure lesson content includes summary and quiz data
- Create fallback content generation for missing pieces
- Maintain compatibility with existing API structure

### 4. Components
- Create `Explain` and `Formula` components for enhanced explanations
- Update `LessonViewer` to support step-based flow
- Add quiz and result components

### 5. Progress Gating
- Implement soft-lock pattern (content readable, progress gated)
- Require quiz attempt before lesson completion
- Update backend progress tracking

## Files to Modify
- `src/components/stats-ui/lesson-viewer.tsx` - Main lesson flow
- `src/components/screens/learning-path.tsx` - Integration point
- `src/services/api.ts` - Progress tracking updates
- Backend progress routes - Quiz attempt tracking

## Files to Create
- `src/learning/flow.ts` - Flow state machine
- `src/learning/progress.ts` - Progress management
- `src/learning/continue.ts` - Navigation logic
- `src/learning/ui/Explain.tsx` - Explanation component
- `src/learning/ui/Formula.tsx` - Formula component
- `src/learning/ui/QuizComponent.tsx` - Quiz interface
- `src/learning/ui/ResultComponent.tsx` - Result display
- Test files for all new functionality

## Implementation Status
- [x] Framework detection and documentation
- [x] Flow state machine implementation
- [x] Progress tracking system
- [x] UI components creation
- [x] Integration with existing system
- [x] Testing implementation

## Files Created

### Core Flow System
- `src/learning/flow.ts` - Flow state machine (Lesson → Summary → Quiz → Result)
- `src/learning/progress.ts` - Progress tracking with localStorage and server sync
- `src/learning/continue.ts` - Continue learning logic and navigation

### UI Components
- `src/learning/ui/Explain.tsx` - Explanation components with variants
- `src/learning/ui/Formula.tsx` - LaTeX formula rendering with explanations
- `src/learning/ui/QuizComponent.tsx` - Duolingo-style quiz interface
- `src/learning/ui/ResultComponent.tsx` - Quiz results and next steps
- `src/learning/ui/FlowLessonViewer.tsx` - Main flow-based lesson viewer

### Tests
- `src/learning/__tests__/flow.test.ts` - Flow state machine tests
- `src/learning/__tests__/progress.test.ts` - Progress management tests
- `src/learning/__tests__/continue.test.ts` - Continue logic tests
- `src/__tests__/lesson-flow.e2e.test.tsx` - End-to-end flow tests

## Files Modified
- `src/components/screens/learning-path.tsx` - Added new flow integration with toggle

## Key Features Implemented

### 1. Mandatory Quiz Flow
- ✅ Lesson → Summary → Quiz → Result sequence enforced
- ✅ Quiz attempt required before advancing to next lesson
- ✅ Progress persisted in localStorage with server sync
- ✅ Soft-lock pattern maintained (content always accessible)

### 2. Enhanced Explanations
- ✅ Formula components with LaTeX rendering
- ✅ Explanation variants (tips, important, formula breakdowns)
- ✅ Friendly, approachable language in all content

### 3. Progress Tracking
- ✅ Step-by-step progress tracking
- ✅ Quiz attempt and score recording
- ✅ Completion gating based on quiz attempts
- ✅ Real-time progress updates

### 4. User Experience
- ✅ Smooth animations between steps
- ✅ Visual progress indicators
- ✅ Hearts/lives system in quizzes
- ✅ Immediate feedback on quiz questions
- ✅ Comprehensive result screens

### 5. Testing
- ✅ Unit tests for all core logic
- ✅ E2E tests for complete user flows
- ✅ Edge case handling (locked lessons, missing data)

## Usage

### Toggle Between Flows
The system includes a toggle button in the learning path to switch between:
- **New Flow**: Structured Lesson → Summary → Quiz → Result
- **Old Flow**: Direct lesson access (original system)

### Testing the New Flow
1. Click "New Flow" toggle button
2. Click on any lesson to start the structured flow
3. Progress through: Lesson → Summary → Quiz → Result
4. Observe mandatory quiz requirement before advancing

## Configuration
- `PASS_THRESHOLD = 0` - Only quiz attempt required (no minimum score)
- Change to `PASS_THRESHOLD = 70` for 70% minimum score requirement
- Progress stored in localStorage with server backup
- Soft-lock pattern ensures all content remains accessible
