/**
 * Flow State Machine Tests
 */

import { describe, it, expect } from 'vitest';
import { 
  nextStep, 
  previousStep, 
  isValidStep, 
  getStepDisplayName, 
  getStepProgress,
  canAdvanceToStep,
  type FlowStep 
} from '../flow';

describe('Flow State Machine', () => {
  describe('nextStep', () => {
    it('should progress through the correct sequence', () => {
      expect(nextStep('lesson')).toBe('summary');
      expect(nextStep('summary')).toBe('quiz');
      expect(nextStep('quiz')).toBe('result');
      expect(nextStep('result')).toBe('lesson');
    });
  });

  describe('previousStep', () => {
    it('should go back through the sequence', () => {
      expect(previousStep('summary')).toBe('lesson');
      expect(previousStep('quiz')).toBe('summary');
      expect(previousStep('result')).toBe('quiz');
      expect(previousStep('lesson')).toBe('lesson');
    });
  });

  describe('isValidStep', () => {
    it('should validate correct steps', () => {
      expect(isValidStep('lesson')).toBe(true);
      expect(isValidStep('summary')).toBe(true);
      expect(isValidStep('quiz')).toBe(true);
      expect(isValidStep('result')).toBe(true);
    });

    it('should reject invalid steps', () => {
      expect(isValidStep('invalid')).toBe(false);
      expect(isValidStep('')).toBe(false);
      expect(isValidStep('test')).toBe(false);
    });
  });

  describe('getStepDisplayName', () => {
    it('should return correct display names', () => {
      expect(getStepDisplayName('lesson')).toBe('Lesson');
      expect(getStepDisplayName('summary')).toBe('Summary');
      expect(getStepDisplayName('quiz')).toBe('Quiz');
      expect(getStepDisplayName('result')).toBe('Results');
    });
  });

  describe('getStepProgress', () => {
    it('should return correct progress percentages', () => {
      expect(getStepProgress('lesson')).toBe(25);
      expect(getStepProgress('summary')).toBe(50);
      expect(getStepProgress('quiz')).toBe(75);
      expect(getStepProgress('result')).toBe(100);
    });
  });

  describe('canAdvanceToStep', () => {
    const mockProgress = {
      viewedLesson: false,
      viewedSummary: false,
      quizAttempted: false
    };

    it('should allow lesson access always', () => {
      expect(canAdvanceToStep('lesson', mockProgress)).toBe(true);
    });

    it('should require lesson viewed for summary', () => {
      expect(canAdvanceToStep('summary', mockProgress)).toBe(false);
      expect(canAdvanceToStep('summary', { ...mockProgress, viewedLesson: true })).toBe(true);
    });

    it('should require lesson and summary viewed for quiz', () => {
      expect(canAdvanceToStep('quiz', mockProgress)).toBe(false);
      expect(canAdvanceToStep('quiz', { ...mockProgress, viewedLesson: true })).toBe(false);
      expect(canAdvanceToStep('quiz', { 
        ...mockProgress, 
        viewedLesson: true, 
        viewedSummary: true 
      })).toBe(true);
    });

    it('should require all steps completed for result', () => {
      expect(canAdvanceToStep('result', mockProgress)).toBe(false);
      expect(canAdvanceToStep('result', { 
        viewedLesson: true, 
        viewedSummary: true, 
        quizAttempted: true 
      })).toBe(true);
    });
  });
});
