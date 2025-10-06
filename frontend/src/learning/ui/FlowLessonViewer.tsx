/**
 * Flow-Based Lesson Viewer
 * 
 * Implements the Lesson → Summary → Quiz → Result flow
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, FileText, Brain, Trophy, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';

import { FlowStep, nextStep, previousStep, getStepDisplayName, getStepProgress, canAdvanceToStep } from '../flow';
import { 
  getLessonProgress, 
  markLessonViewed, 
  markSummaryViewed, 
  markQuizAttempted,
  canAdvanceToNextLesson
} from '../progress';
import api from '../../services/api';
import { marked } from 'marked';

import { Formula } from './Formula';
import { QuizComponent, type QuizQuestion, type QuizResult } from './QuizComponent';
import { ResultComponent } from './ResultComponent';
import { DuolingoLessonViewer } from './DuolingoLessonViewer';
import { SlideErrorBoundary } from './SlideErrorBoundary';
import { getSlidesForLesson } from '../data/slides-registry';
import { validateLessonContent } from '../utils/contentValidator';

interface FlowLessonViewerProps {
  lessonId: number;
  lessonSlug: string;
  lessonTitle: string;
  open: boolean;
  onClose: () => void;
  onCompleted?: () => void;
  allLessons?: Array<{
    lesson_id: number;
    slug: string;
    title: string;
    order?: number;
    order_index?: number;
  }>;
}

export function FlowLessonViewer({
  lessonId,
  lessonSlug,
  lessonTitle,
  open,
  onClose,
  onCompleted,
  allLessons = []
}: FlowLessonViewerProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('lesson');
  const [lessonData, setLessonData] = useState<any>(null);
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [summaryContent, setSummaryContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const isLocked = false; // Simplified - all lessons accessible in soft-lock pattern
  const nextLesson = allLessons?.find(lesson => lesson.lesson_id !== lessonId) || null;
  const SHOW_DEBUG = import.meta.env.DEV && (new URLSearchParams(window.location.search).has('debug') || localStorage.getItem('show_debug') === '1');
  
  // Slides for this lesson: custom if available, otherwise generated from content
  const slides = useMemo(() => {
    // Validate content first
    if (lessonData?.content_json) {
      const validation = validateLessonContent(lessonData.content_json);
      if (!validation.isValid) {
        console.error('Content validation failed:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('Content validation warnings:', validation.warnings);
      }
    }
    
    return getSlidesForLesson(lessonSlug, lessonData, lessonTitle);
  }, [lessonSlug, lessonData, lessonTitle]);

  // Load lesson data when opened
  useEffect(() => {
    if (!open || !lessonId) return;

    const loadLessonData = async () => {
      setLoading(true);
      setLoadError(null);
      console.log('Loading lesson data for lessonId:', lessonId, 'lessonSlug:', lessonSlug);
      
      // Set a timeout for loading feedback
      const timeoutId = setTimeout(() => {
        setLoadError('Loading is taking longer than expected...');
      }, 10000);
      
      try {
        // Load lesson content from API
        const response = await fetch(`/api/v1/progress/lesson/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Loaded lesson data:', data);
          setLessonData(data);
          
          // Load quiz questions from dedicated API endpoint
          try {
            const quizResponse = await api.getQuizQuestions(lessonId);
            console.log('Loaded quiz data:', quizResponse);
            
            if (quizResponse.questions && quizResponse.questions.length > 0) {
            const mappedQuestions = quizResponse.questions.map((q: any) => {
              const type = (q.type || q.question_type || 'mcq').toLowerCase();
              let choices = q.options || q.choices || [];
              // Ensure MCQ has at least 4 choices
              if (type === 'mcq' && (!Array.isArray(choices) || choices.length < 2)) {
                choices = ['Yes', 'No', 'Maybe', 'Not sure'];
              }
              return {
                id: String(q.id || q.question_id || cryptoRandomId()),
                type,
                stem: q.question || q.stem || 'Question',
                choices,
                correctAnswer: q.correct_answer ?? q.correctAnswer ?? 0,
                explanation: q.explanation_correct || q.explanation || 'Good job!',
                hint: q.hint || q.hint_text,
                scenario: q.scenario || q.scenario_text,
                difficulty: (q.difficulty || 'medium').toLowerCase()
              } as QuizQuestion;
            }).filter((q: any) => q && q.stem);
              
              setQuizData(mappedQuestions.length > 0 ? mappedQuestions : getDefaultFallbackQuiz(lessonTitle));
            } else {
              // Fallback quiz data if no quiz questions are available
              setQuizData(getDefaultFallbackQuiz(lessonTitle));
            }
          } catch (quizError) {
            console.warn('Failed to load quiz questions:', quizError);
            // Use fallback quiz data
            setQuizData(getDefaultFallbackQuiz(lessonTitle));
          }
          
          // Extract summary content from sections
          let summaryContent = '';
          if (data.content_json?.sections) {
            const summarySection = data.content_json.sections.find((section: any) => section.type === 'summary');
            if (summarySection) {
              summaryContent = summarySection.content || '';
            }
          }
          
          // If we have summary content, use it; otherwise use a lesson-specific fallback
          if (summaryContent.trim()) {
            setSummaryContent(summaryContent);
          } else {
            // Create a better fallback based on lesson content
            const currentLessonTitle = data.title || lessonTitle;
            setSummaryContent(`
## Summary

In this lesson on **${currentLessonTitle}**, you learned about important concepts and principles. Here are the key takeaways:

- **Main Concept**: The core idea covered in this lesson
- **Key Formula**: Important mathematical relationships  
- **Practical Application**: How to apply this knowledge
- **Next Steps**: What to study next

Remember to practice these concepts to reinforce your learning!
            `);
          }
        } else {
          console.log('API response not ok:', response.status, response.statusText);
          setLoadError('Could not load lesson from server. Using offline content.');
          // Use fallback content when API returns error
          setLessonData({
            title: lessonTitle,
            content_json: {
              sections: [
                {
                  type: 'content',
                  content: `
                    <h2>Welcome to ${lessonTitle}!</h2>
                    <p>This lesson covers important concepts in probability and statistics.</p>
                    <h3>What You'll Learn</h3>
                    <ul>
                      <li>Core probability concepts</li>
                      <li>Key formulas and their applications</li>
                      <li>Real-world examples</li>
                    </ul>
                  `
                }
              ]
            }
          });
          setQuizData([{
            id: 'fallback1',
            type: 'mcq',
            stem: 'What is the probability of flipping heads on a fair coin?',
            choices: ['1/2', '1/3', '2/3', '1/4'],
            correctAnswer: 0,
            explanation: 'Correct! A fair coin has two equally likely outcomes.',
            difficulty: 'easy'
          }]);
          setSummaryContent('## Key Takeaways\n\n- Probability ranges from 0 to 1\n- Fair coins have equal outcomes\n- Use P(A) = favorable outcomes / total outcomes');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Failed to load lesson data:', error);
        setLoadError('Failed to load lesson. Using offline content.');
        
        // Use fallback content when API fails
        setLessonData({
          title: lessonTitle,
          content_json: {
            sections: [
              {
                type: 'content',
                content: `
                  <h2>Welcome to ${lessonTitle}!</h2>
                  <p>This lesson covers important concepts in probability and statistics.</p>
                  <h3>What You'll Learn</h3>
                  <ul>
                    <li>Core probability concepts</li>
                    <li>Key formulas and their applications</li>
                    <li>Real-world examples</li>
                  </ul>
                `
              }
            ]
          }
        });
        setQuizData([
          {
            id: 'fallback1',
            type: 'mcq',
            stem: 'What is the probability of flipping heads on a fair coin?',
            choices: ['1/2', '1/3', '2/3', '1/4'],
            correctAnswer: 0,
            explanation: 'Correct! A fair coin has two equally likely outcomes.',
            difficulty: 'easy'
          }
        ]);
        setSummaryContent('## Key Takeaways\n\n- Probability ranges from 0 to 1\n- Fair coins have equal outcomes\n- Use P(A) = favorable outcomes / total outcomes');
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, [open, lessonId, lessonTitle, lessonSlug]);

  // Determine initial step based on progress - FORCE lesson step for debugging
  useEffect(() => {
    if (!open) return;
    
    // FORCE LESSON START: Always clear progress and start with lesson
    if (typeof window !== 'undefined' && window.localStorage) {
      // Clear all lesson progress to ensure fresh start
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith('lesson_progress_')) {
          window.localStorage.removeItem(key);
        }
      });
      console.log('🔄 Cleared ALL lesson progress for fresh start');
    }
    
    console.log('FlowLessonViewer: FORCING lesson step start');
    setCurrentStep('lesson');
    
    // Reset any other state
    setQuizResult(null);
    setLoadError(null);
    
    // Debug: Verify progress is cleared
    const currentProgress = getLessonProgress(lessonSlug);
    console.log('Verified progress cleared for', lessonSlug, ':', currentProgress);
  }, [open, lessonSlug]);

  // Debug: log key state to trace flow
  useEffect(() => {
    console.log('🔍 DEBUG: FlowLessonViewer state', {
      lessonSlug,
      hasContent: Boolean(lessonData?.content_json?.sections?.length),
      quizLength: quizData?.length ?? 0,
      summaryLength: summaryContent?.length ?? 0,
      currentStep
    });
  }, [lessonSlug, lessonData, quizData, summaryContent, currentStep]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentStep('lesson'); // Force reset to lesson step
      setQuizResult(null);
      setLoadError(null);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, onClose]);

  const handleStepComplete = (step: FlowStep) => {
    console.log('🔍 DEBUG: Step completed', { step, lessonSlug });
    switch (step) {
      case 'lesson':
        // DON'T mark as viewed to prevent auto-skipping to summary
        // markLessonViewed(lessonSlug);
        console.log('🔍 DEBUG: Lesson completed, moving to summary');
        setCurrentStep('summary');
        break;
      case 'summary':
        // DON'T mark as viewed to prevent auto-skipping to quiz
        // markSummaryViewed(lessonSlug);
        console.log('🔍 DEBUG: Summary completed, moving to quiz');
        setCurrentStep('quiz');
        break;
      case 'quiz':
        // Quiz completion is handled by QuizComponent
        console.log('🔍 DEBUG: Quiz completed');
        break;
      case 'result':
        // Result step completion means advancing to next lesson
        console.log('🔍 DEBUG: Result completed');
        if (canAdvanceToNextLesson(lessonSlug)) {
          onCompleted?.();
          onClose();
        }
        break;
    }
  };

  const handleQuizComplete = async (result: QuizResult) => {
    try {
      // Format answers for backend submission
      const formattedAnswers = result.answers.map(answer => ({
        question_id: parseInt(answer.questionId) || 0,
        answer: String(answer.userAnswer)
      }));

      console.log('Submitting quiz answers:', formattedAnswers);
      
      // Submit quiz to backend
      const submissionResult = await api.submitQuiz(lessonId, formattedAnswers);
      console.log('Quiz submission result:', submissionResult);
      
      // Update result with backend response
      const updatedResult = {
        ...result,
        score: submissionResult.score * 100, // Convert to percentage
        passed: submissionResult.passed,
        backendResults: submissionResult.results
      };
      
      setQuizResult(updatedResult);
      markQuizAttempted(lessonSlug, updatedResult);
      
      // If quiz passed, complete the lesson with the score
      if (submissionResult.passed) {
        try {
          await api.completeLesson(lessonId, submissionResult.score, result.timeSpent);
          console.log('Lesson completed successfully');
        } catch (completeError) {
          console.warn('Failed to complete lesson:', completeError);
        }
      }
      
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      // Still show results even if backend submission fails
      setQuizResult(result);
      markQuizAttempted(lessonSlug, result);
    }
    
    setCurrentStep('result');
  };

  const handleRetryQuiz = () => {
    setQuizResult(null);
    setCurrentStep('quiz');
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      // This would trigger opening the next lesson
      onCompleted?.();
      onClose();
      // The parent component should handle opening the next lesson
    } else {
      onClose();
    }
  };

  // Get fresh progress for display
  const currentProgress = getLessonProgress(lessonSlug);
  const canAdvance = canAdvanceToStep(nextStep(currentStep), currentProgress);
  const stepProgress = getStepProgress(currentStep);

  if (!open) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full animate-spin border-4 border-blue-200 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
          {loadError && (
            <p className="text-sm text-amber-600 mt-2">{loadError}</p>
          )}
        </div>
      </div>
    );
  }

  // Validation - only show error if we've finished loading and still missing critical data
  if (!loading && lessonData !== null && quizData !== null) {
  const validationErrors: string[] = [];
    
    // Debug logging
    console.log('🔍 Validation check:', {
      lessonSlug,
      hasLessonData: !!lessonData,
      hasSections: !!lessonData?.content_json?.sections,
      sectionsLength: lessonData?.content_json?.sections?.length || 0,
      hasQuizData: Array.isArray(quizData),
      quizLength: Array.isArray(quizData) ? quizData.length : 'not array'
    });
    
    // Check lesson content - be more lenient
  if (!lessonData?.content_json?.sections || lessonData.content_json.sections.length === 0) {
      validationErrors.push('Lesson content sections are missing');
    }
    
    // Check quiz data - allow empty array
    if (!Array.isArray(quizData)) {
      validationErrors.push('Quiz questions failed to load properly');
    }

    // Only show error if we have critical validation failures
  if (validationErrors.length > 0) {
      console.warn('⚠️ Lesson validation failed', { 
        lessonSlug, 
        validationErrors, 
        lessonDataStructure: lessonData ? Object.keys(lessonData) : 'null',
        quizDataType: typeof quizData,
        quizDataIsArray: Array.isArray(quizData)
      });
      
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ Lesson Loading Issue</h2>
            <p className="text-gray-600 mb-4">There was a problem loading this lesson:</p>
          <ul className="text-left list-disc list-inside text-amber-700 mb-6">
            {validationErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()}>Reload Page</Button>
              <Button variant="outline" onClick={onClose}>Back to Lessons</Button>
            </div>
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
              <strong>Debug info:</strong><br/>
              Lesson: {lessonSlug}<br/>
              Data loaded: {lessonData ? 'Yes' : 'No'}<br/>
              Quiz loaded: {Array.isArray(quizData) ? `Yes (${quizData.length})` : 'No'}
            </div>
          </div>
      </div>
    );
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Close lesson"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-gray-800">{lessonTitle}</h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                {(['lesson', 'summary', 'quiz', 'result'] as FlowStep[]).map((step, index) => {
                  const isActive = step === currentStep;
                  const isCompleted = canAdvanceToStep(step, currentProgress);
                  const Icon = step === 'lesson' ? BookOpen : 
                             step === 'summary' ? FileText :
                             step === 'quiz' ? Brain : Trophy;
                  
                  return (
                    <div key={step} className="flex items-center">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        isActive 
                          ? 'bg-blue-100 text-blue-800' 
                          : isCompleted 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                        {getStepDisplayName(step)}
                      </div>
                      {index < 3 && (
                        <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="w-10"> {/* Spacer for balance */}</div>
          </div>
          
          <Progress value={stepProgress} className="h-2" />
          
          {loadError && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                ℹ️ {loadError}
              </p>
            </div>
          )}
          
          {isLocked && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                🔒 Preview mode: You can view content but progress/XP are locked until prerequisites are completed.
              </p>
            </div>
          )}
          
          {/* DEBUG CONTROLS - hidden unless explicitly enabled in dev */}
          {SHOW_DEBUG && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-800 text-sm">
                🐛 DEBUG: Current step: <strong>{currentStep}</strong>
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    localStorage.clear();
                    setCurrentStep('lesson');
                    console.log('🔄 CLEARED ALL STORAGE & RESET TO LESSON');
                  }}
                >
                  Clear All & Reset
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setCurrentStep('lesson')}
                >
                  Force Lesson
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setCurrentStep('summary')}
                >
                  Force Summary
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setCurrentStep('quiz')}
                >
                  Force Quiz
                </Button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Main Content (overlay scroll) */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-full"
          >
            {currentStep === 'lesson' && (
              <SlideErrorBoundary onReset={() => window.location.reload()}>
                <DuolingoLessonViewer
                  lessonTitle={lessonTitle}
                  slides={slides}
                  onComplete={() => handleStepComplete('lesson')}
                  onClose={onClose}
                />
              </SlideErrorBoundary>
            )}
            
            {currentStep === 'summary' && (
              <SummaryContent
                content={summaryContent}
                lessonTitle={lessonTitle}
                onComplete={() => handleStepComplete('summary')}
                isLocked={isLocked}
              />
            )}
            
            {currentStep === 'quiz' && (
              <QuizComponent
                questions={quizData}
                onComplete={handleQuizComplete}
                onClose={onClose}
                title={`${lessonTitle} - Quiz`}
              />
            )}
            
            {currentStep === 'result' && quizResult && (
              <ResultComponent
                result={quizResult}
                lessonTitle={lessonTitle}
                canAdvanceToNext={canAdvanceToNextLesson(lessonSlug)}
                nextLessonTitle={nextLesson?.title}
                onRetryQuiz={handleRetryQuiz}
                onNextLesson={handleNextLesson}
                onBackToLessons={onClose}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Summary Content Component
function SummaryContent({ 
  content, 
  lessonTitle, 
  onComplete, 
  isLocked 
}: { 
  content: string; 
  lessonTitle: string; 
  onComplete: () => void; 
  isLocked: boolean;
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Lesson Summary</h1>
          <p className="text-gray-600">{lessonTitle}</p>
        </div>
        
        {/* Summary Content */}
        <div className="prose prose-lg max-w-none mb-8">
          {content ? (
            <div dangerouslySetInnerHTML={{ 
              __html: marked.parse ? marked.parse(content) : marked(content)
            }} />
          ) : (
            <div>
              <h2>Key Takeaways</h2>
              <ul>
                <li>Probability measures uncertainty from 0 to 1</li>
                <li>Use P(A) = favorable outcomes / total outcomes for equally likely events</li>
                <li>Complement rule: P(not A) = 1 - P(A)</li>
              </ul>
              
              <Formula 
                latex="P(A^c) = 1 - P(A)"
                explanation="This is the complement rule. The probability of 'not A' equals 1 minus the probability of A."
                example="If P(rain) = 0.3, then P(no rain) = 1 - 0.3 = 0.7"
              />
            </div>
          )}
        </div>


        {/* Action Button */}
        <div className="text-center">
          <Button 
            onClick={onComplete}
            disabled={isLocked}
            className="px-8 py-3 text-lg"
          >
            Take the quiz
            <Brain className="w-5 h-5 ml-2" />
          </Button>
          
          {isLocked && (
            <p className="text-sm text-amber-600 mt-2">
              Complete previous lessons to unlock quiz
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Utilities and helper UI
function cryptoRandomId(): string {
  try {
    // @ts-ignore
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return String(Math.random()).slice(2);
  }
}

function getDefaultFallbackQuiz(lessonTitle: string): QuizQuestion[] {
  return [
    {
      id: 'fallback-q1',
      type: 'mcq',
      stem: `Which topic best matches this lesson: "${lessonTitle}"?`,
      choices: ['Probability basics', 'Data cleaning', 'Neural networks', 'Image processing'],
      correctAnswer: 0,
      explanation: 'This lesson focuses on probability fundamentals.',
      difficulty: 'easy'
    },
    {
      id: 'fallback-q2',
      type: 'tf',
      stem: 'Probabilities always lie between 0 and 1 inclusive.',
      correctAnswer: true,
      explanation: 'By definition, probability is in [0, 1].',
      difficulty: 'easy'
    }
  ];
}
