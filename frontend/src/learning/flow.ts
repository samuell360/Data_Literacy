/**
 * Lesson Flow State Machine
 * 
 * Manages the structured flow: Lesson → Summary → Quiz → Result
 */

export type FlowStep = 'lesson' | 'summary' | 'quiz' | 'result';

/**
 * Get the next step in the lesson flow
 */
export function nextStep(currentStep: FlowStep): FlowStep {
  switch (currentStep) {
    case 'lesson':
      return 'summary';
    case 'summary':
      return 'quiz';
    case 'quiz':
      return 'result';
    case 'result':
      return 'lesson'; // Loop back for next lesson
    default:
      return 'lesson';
  }
}

/**
 * Get the previous step in the lesson flow
 */
export function previousStep(currentStep: FlowStep): FlowStep {
  switch (currentStep) {
    case 'summary':
      return 'lesson';
    case 'quiz':
      return 'summary';
    case 'result':
      return 'quiz';
    case 'lesson':
    default:
      return 'lesson';
  }
}


/**
 * Get step display name
 */
export function getStepDisplayName(step: FlowStep): string {
  switch (step) {
    case 'lesson':
      return 'Lesson';
    case 'summary':
      return 'Summary';
    case 'quiz':
      return 'Quiz';
    case 'result':
      return 'Results';
    default:
      return 'Unknown';
  }
}

/**
 * Get step progress percentage (0-100)
 */
export function getStepProgress(step: FlowStep): number {
  switch (step) {
    case 'lesson':
      return 25;
    case 'summary':
      return 50;
    case 'quiz':
      return 75;
    case 'result':
      return 100;
    default:
      return 0;
  }
}

/**
 * Check if user can advance to the next step
 */
export function canAdvanceToStep(
  targetStep: FlowStep,
  progress: {
    viewedLesson: boolean;
    viewedSummary: boolean;
    quizAttempted: boolean;
    passed?: boolean;
  }
): boolean {
  switch (targetStep) {
    case 'lesson':
      return true; // Always can view lesson
    case 'summary':
      return progress.viewedLesson;
    case 'quiz':
      return progress.viewedLesson && progress.viewedSummary;
    case 'result':
      return progress.viewedLesson && progress.viewedSummary && progress.quizAttempted;
    default:
      return false;
  }
}
