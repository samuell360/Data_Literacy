/**
 * End-to-End Tests for Lesson Flow
 * 
 * Tests the complete Lesson → Summary → Quiz → Result flow
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FlowLessonViewer } from '../learning/ui/FlowLessonViewer';
import { clearAllProgress } from '../learning/progress';

// Mock the API calls
const mockLessonData = {
  lesson_id: 1,
  title: 'What is Probability?',
  slug: 'what-is-probability',
  content_json: {
    sections: [
      {
        type: 'content',
        content: '<p>Probability is a measure of uncertainty.</p>'
      }
    ]
  },
  quiz: [
    {
      type: 'mcq',
      stem: 'What is the probability of flipping heads?',
      choices: ['1/2', '1/3', '2/3', '1/4'],
      correctAnswer: 0,
      explanation: 'Correct! A fair coin has equal outcomes.'
    }
  ],
  summary: 'Key takeaways: Probability ranges from 0 to 1.'
};

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockLessonData),
  })
) as any;

describe('Lesson Flow E2E', () => {
  beforeEach(() => {
    clearAllProgress();
    vi.clearAllMocks();
  });

  it('should complete full lesson flow', async () => {
    const mockOnClose = vi.fn();
    const mockOnCompleted = vi.fn();

    render(
      <FlowLessonViewer
        lessonId={1}
        lessonSlug="what-is-probability"
        lessonTitle="What is Probability?"
        open={true}
        onClose={mockOnClose}
        onCompleted={mockOnCompleted}
        allLessons={[
          { lesson_id: 1, slug: 'what-is-probability', title: 'What is Probability?' },
          { lesson_id: 2, slug: 'unions-intersections', title: 'Unions & Intersections' }
        ]}
      />
    );

    // Should start on lesson step
    expect(screen.getByText('What is Probability?')).toBeInTheDocument();
    expect(screen.getByText("I'm done — show me the summary")).toBeInTheDocument();

    // Complete lesson step
    fireEvent.click(screen.getByText("I'm done — show me the summary"));

    // Should move to summary step
    await waitFor(() => {
      expect(screen.getByText('Lesson Summary')).toBeInTheDocument();
    });
    expect(screen.getByText('Take the quiz')).toBeInTheDocument();

    // Complete summary step
    fireEvent.click(screen.getByText('Take the quiz'));

    // Should move to quiz step
    await waitFor(() => {
      expect(screen.getByText('Quiz Time!')).toBeInTheDocument();
    });
    expect(screen.getByText('What is the probability of flipping heads?')).toBeInTheDocument();

    // Answer the quiz question
    fireEvent.click(screen.getByText('1/2'));

    // Should show feedback
    await waitFor(() => {
      expect(screen.getByText('Correct!')).toBeInTheDocument();
    });

    // Continue to next question/complete quiz
    fireEvent.click(screen.getByText('Continue'));

    // Should move to result step
    await waitFor(() => {
      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    });
    expect(screen.getByText('100%')).toBeInTheDocument(); // Perfect score
  });

  it('should handle locked lessons correctly', async () => {
    render(
      <FlowLessonViewer
        lessonId={2}
        lessonSlug="unions-intersections"
        lessonTitle="Unions & Intersections"
        open={true}
        onClose={vi.fn()}
        onCompleted={vi.fn()}
        allLessons={[
          { lesson_id: 1, slug: 'what-is-probability', title: 'What is Probability?' },
          { lesson_id: 2, slug: 'unions-intersections', title: 'Unions & Intersections' }
        ]}
      />
    );

    // Should show preview mode banner
    await waitFor(() => {
      expect(screen.getByText(/Preview mode/)).toBeInTheDocument();
    });

    // Progress buttons should be disabled
    const summaryButton = screen.getByText("I'm done — show me the summary");
    expect(summaryButton).toBeDisabled();
  });

  it('should maintain progress across sessions', async () => {
    // Simulate viewing lesson in first session
    markLessonViewed('what-is-probability');

    render(
      <FlowLessonViewer
        lessonId={1}
        lessonSlug="what-is-probability"
        lessonTitle="What is Probability?"
        open={true}
        onClose={vi.fn()}
        onCompleted={vi.fn()}
        allLessons={[
          { lesson_id: 1, slug: 'what-is-probability', title: 'What is Probability?' }
        ]}
      />
    );

    // Should start on summary step (since lesson was already viewed)
    await waitFor(() => {
      expect(screen.getByText('Lesson Summary')).toBeInTheDocument();
    });
  });
});
