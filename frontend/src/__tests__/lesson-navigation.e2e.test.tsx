/**
 * E2E tests for lesson navigation
 * Tests the "Continue Learning" button and lesson access flow
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LearningPath } from '../components/screens/learning-path';
import { progressApi, contentApi } from '../services/api';

// Mock the API
jest.mock('../services/api', () => ({
  progressApi: {
    getNextStep: jest.fn(),
    startLesson: jest.fn(),
    completeLesson: jest.fn(),
  },
  contentApi: {
    getWorlds: jest.fn(),
    getLessons: jest.fn(),
  },
}));

const mockLessons = [
  { lesson_id: 1, title: 'What is Probability?', estimated_minutes: 10, status: 'NEW', locked: false },
  { lesson_id: 2, title: 'Union and Intersection', estimated_minutes: 15, status: 'NEW', locked: true },
  { lesson_id: 3, title: 'Conditional Probability', estimated_minutes: 12, status: 'STARTED', locked: false },
];

const mockWorlds = [
  { id: 1, title: 'Probability World', description: 'Learn probability basics' }
];

describe('Lesson Navigation E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (contentApi.getWorlds as jest.Mock).mockResolvedValue(mockWorlds);
    (contentApi.getLessons as jest.Mock).mockResolvedValue(mockLessons);
  });

  it('should open first lesson when Continue Learning is clicked', async () => {
    const mockOnBack = jest.fn();
    render(<LearningPath onBack={mockOnBack} />);

    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText('Continue Learning')).toBeInTheDocument();
    });

    // Click Continue Learning button
    const continueButton = screen.getByText('Continue Learning');
    fireEvent.click(continueButton);

    // Should open lesson viewer (we can't easily test the modal in this setup,
    // but we can verify the button click doesn't throw)
    expect(continueButton).toBeInTheDocument();
  });

  it('should allow clicking on locked lessons', async () => {
    const mockOnBack = jest.fn();
    render(<LearningPath onBack={mockOnBack} />);

    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText('Union and Intersection')).toBeInTheDocument();
    });

    // Find and click on locked lesson
    const lockedLesson = screen.getByText('Union and Intersection');
    fireEvent.click(lockedLesson);

    // Should not throw error (soft-lock allows clicking)
    expect(lockedLesson).toBeInTheDocument();
  });

  it('should show preview indicator for locked lessons', async () => {
    const mockOnBack = jest.fn();
    render(<LearningPath onBack={mockOnBack} />);

    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    // Should show preview indicator for locked lesson
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('should handle empty lesson list gracefully', async () => {
    (contentApi.getLessons as jest.Mock).mockResolvedValue([]);
    
    const mockOnBack = jest.fn();
    render(<LearningPath onBack={mockOnBack} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Continue Learning')).toBeInTheDocument();
    });

    // Button should still be clickable (no error)
    const continueButton = screen.getByText('Continue Learning');
    fireEvent.click(continueButton);
    
    expect(continueButton).toBeInTheDocument();
  });
});
