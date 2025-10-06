/**
 * Quiz Component
 * 
 * Duolingo-style quiz interface with immediate feedback and robust error handling
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Heart, Lightbulb, ArrowRight, X, AlertCircle, Award, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'fill' | 'tf' | 'match';
  stem: string;
  choices?: string[];
  correctAnswer: string | number | boolean;
  explanation: string;
  hint?: string;
  scenario?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
  }>;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
  onComplete: (result: QuizResult) => void;
  onClose?: () => void;
  title?: string;
  hearts?: number;
  allowRetry?: boolean;
}

export function QuizComponent({ 
  questions, 
  onComplete, 
  onClose,
  title = "Quiz Time",
  hearts: initialHearts = 5,
  allowRetry = true
}: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(initialHearts);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [answers, setAnswers] = useState<QuizResult['answers']>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate questions on mount
  useEffect(() => {
    if (!questions || questions.length === 0) {
      console.error('QuizComponent: No questions provided');
    }
  }, [questions]);

  const question = questions?.[currentQuestion];
  const progress = questions?.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const checkAnswer = useCallback((answer: any, question: QuizQuestion): boolean => {
    if (!question) return false;

    switch (question.type) {
      case 'fill':
        return String(answer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim();
      case 'tf':
        return Boolean(answer) === Boolean(question.correctAnswer);
      case 'mcq':
        return answer === question.correctAnswer;
      default:
        console.warn(`Unknown question type: ${question.type}`);
        return false;
    }
  }, []);

  const handleAnswer = useCallback((answer: any) => {
    if (!question || showFeedback) return;

    setSelectedAnswer(answer);
    
    const correct = checkAnswer(answer, question);
    setIsCorrect(correct);
    setShowFeedback(true);

    // Record the answer
    const answerRecord = {
      questionId: question.id,
      userAnswer: answer,
      correctAnswer: question.correctAnswer,
      isCorrect: correct
    };
    setAnswers(prev => [...prev, answerRecord]);

    if (correct) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
      setHearts(prev => Math.max(0, prev - 1));
    }
  }, [question, showFeedback, checkAnswer]);

  const handleNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      
      // Focus input for fill-in-the-blank questions
      if (questions[currentQuestion + 1]?.type === 'fill') {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } else {
      // Quiz complete
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const score = Math.round((correctCount / questions.length) * 100);
      
      const result: QuizResult = {
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        timeSpent,
        answers
      };
      
      onComplete(result);
    }
  }, [currentQuestion, questions, correctCount, startTime, answers, onComplete]);

  const handleRetry = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setHearts(initialHearts);
    setCorrectCount(0);
    setAnswers([]);
    setStreak(0);
  }, [initialHearts]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showFeedback && (e.key === 'Enter' || e.key === ' ')) {
        handleNext();
      } else if (!showFeedback && question?.type === 'mcq' && question.choices) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= question.choices.length) {
          handleAnswer(num - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFeedback, question, handleNext, handleAnswer]);

  // Validate questions exist
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-6">
            This quiz doesn't have any questions yet. Please check back later.
          </p>
          {onClose && (
            <Button onClick={onClose} className="w-full">
              Back to Lesson
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Game over if hearts reach 0
  if (hearts === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center"
        >
          <Heart className="w-20 h-20 text-red-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Out of Hearts</h2>
          <p className="text-gray-600 mb-2">
            You answered {correctCount} out of {currentQuestion + 1} questions correctly.
          </p>
          {bestStreak > 1 && (
            <p className="text-sm text-gray-500 mb-6">
              Best streak: {bestStreak} in a row
            </p>
          )}
          <p className="text-gray-600 mb-6">
            Learning takes practice. Review the lesson and try again when you're ready.
          </p>
          <div className="space-y-3">
            {allowRetry && (
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
            )}
            {onClose && (
              <Button variant="outline" onClick={onClose} className="w-full">
                Back to Lesson
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            {onClose && (
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                aria-label="Close quiz"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">{title}</h1>
            <div className="flex items-center gap-2">
              {[...Array(initialHearts)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 transition-all ${
                    i < hearts 
                      ? 'text-red-500 fill-current scale-100' 
                      : 'text-gray-300 scale-90'
                  }`}
                  aria-label={i < hearts ? 'Heart remaining' : 'Heart lost'}
                />
              ))}
            </div>
          </div>
          
          <Progress value={progress} className="h-2 bg-green-100" />
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            {streak > 1 && (
              <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <TrendingUp className="w-4 h-4" />
                {streak} streak
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionSlide
              question={question}
              selectedAnswer={selectedAnswer}
              onAnswer={handleAnswer}
              showFeedback={showFeedback}
              isCorrect={isCorrect}
              onNext={handleNext}
              inputRef={inputRef}
              questionNumber={currentQuestion + 1}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Individual Question Slide Component
function QuestionSlide({
  question,
  selectedAnswer,
  onAnswer,
  showFeedback,
  isCorrect,
  onNext,
  inputRef,
  questionNumber
}: {
  question: QuizQuestion;
  selectedAnswer: any;
  onAnswer: (answer: any) => void;
  showFeedback: boolean;
  isCorrect: boolean;
  onNext: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  questionNumber: number;
}) {
  if (!question) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-500">Question not available</p>
        </div>
      </div>
    );
  }

  // Difficulty badge
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    hard: 'bg-red-100 text-red-700 border-red-200'
  };

  const renderDifficultyBadge = () => {
    if (!question.difficulty) return null;
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[question.difficulty]}`}>
        {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
      </div>
    );
  };

  if (question.type === 'mcq') {
    if (!question.choices || question.choices.length === 0) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-gray-500 text-center">This question has no answer choices</p>
            <Button onClick={onNext} className="mt-4 mx-auto block">Skip Question</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Question {questionNumber}</span>
            {renderDifficultyBadge()}
          </div>
          
          {question.scenario && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mb-6">
              <p className="text-green-800 font-medium">{question.scenario}</p>
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{question.stem}</h2>
          
          <div className="space-y-3">
            {question.choices.map((choice, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectChoice = index === question.correctAnswer;
              
              let bgColor = "bg-gray-50 hover:bg-gray-100 border border-gray-200";
              let textColor = "text-gray-800";
              let checkmarkColor = "";
              
              if (showFeedback) {
                if (isSelected) {
                  if (isCorrect) {
                    bgColor = "bg-green-500 border-green-500";
                    textColor = "text-white";
                    checkmarkColor = "text-white";
                  } else {
                    bgColor = "bg-red-100 border-red-500";
                    textColor = "text-red-900";
                    checkmarkColor = "text-red-600";
                  }
                } else if (isCorrectChoice && !isCorrect) {
                  bgColor = "bg-green-100 border-green-500";
                  textColor = "text-green-900";
                  checkmarkColor = "text-green-600";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && onAnswer(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-200 ${bgColor} ${textColor} ${!showFeedback ? 'hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]' : 'cursor-default'}`}
                  aria-label={`Choice ${String.fromCharCode(65 + index)}: ${choice}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{choice}</span>
                    {showFeedback && (isSelected || (isCorrectChoice && !isCorrect)) && (
                      <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center ${checkmarkColor}`}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {!showFeedback && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Press 1-{question.choices.length} to select, or click an answer
            </p>
          )}
        </div>

        {showFeedback && (
          <FeedbackCard
            isCorrect={isCorrect}
            explanation={question.explanation}
            hint={question.hint}
            onNext={onNext}
          />
        )}
      </div>
    );
  }

  if (question.type === 'tf') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Question {questionNumber}</span>
            {renderDifficultyBadge()}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-8">{question.stem}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'True', value: true, icon: CheckCircle, baseColor: 'green' },
              { label: 'False', value: false, icon: XCircle, baseColor: 'red' }
            ].map((option) => {
              const isSelected = selectedAnswer === option.value;
              const isCorrectAnswer = option.value === question.correctAnswer;
              const Icon = option.icon;
              
              let colorClasses = `bg-${option.baseColor}-50 hover:bg-${option.baseColor}-100 border-2 border-${option.baseColor}-200`;
              
              if (showFeedback && isSelected) {
                colorClasses = isCorrect 
                  ? 'bg-green-100 border-2 border-green-500'
                  : 'bg-red-100 border-2 border-red-500';
              }

              return (
                <button
                  key={option.label}
                  onClick={() => !showFeedback && onAnswer(option.value)}
                  disabled={showFeedback}
                  className={`p-8 rounded-2xl font-bold text-xl transition-all duration-200 ${colorClasses} ${!showFeedback ? 'hover:shadow-lg hover:scale-105 active:scale-95' : 'cursor-default'}`}
                  aria-label={option.label}
                >
                  <Icon className="w-16 h-16 mx-auto mb-3" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback && (
          <FeedbackCard
            isCorrect={isCorrect}
            explanation={question.explanation}
            hint={question.hint}
            onNext={onNext}
          />
        )}
      </div>
    );
  }

  if (question.type === 'fill') {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = () => {
      if (inputValue.trim()) {
        onAnswer(inputValue);
      }
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Question {questionNumber}</span>
            {renderDifficultyBadge()}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{question.stem}</h2>
          
          <input
            ref={inputRef}
            type="text"
            value={showFeedback ? selectedAnswer : inputValue}
            onChange={(e) => !showFeedback && setInputValue(e.target.value)}
            disabled={showFeedback}
            className={`w-full p-4 border-2 rounded-xl text-lg text-center font-mono transition-all ${
              showFeedback
                ? isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="Type your answer..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim() && !showFeedback) {
                handleSubmit();
              }
            }}
            autoFocus
          />
          
          {!showFeedback && inputValue.trim() && (
            <div className="mt-4 text-center">
              <Button onClick={handleSubmit} size="lg">
                Submit Answer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-sm text-gray-500 mt-2">or press Enter</p>
            </div>
          )}
        </div>

        {showFeedback && (
          <FeedbackCard
            isCorrect={isCorrect}
            explanation={question.explanation}
            hint={question.hint}
            onNext={onNext}
            correctAnswer={String(question.correctAnswer)}
          />
        )}
      </div>
    );
  }

  // Default fallback for unsupported question types
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{question.stem}</h2>
        <p className="text-gray-600 mb-6 text-center">
          Question type '{question.type}' is not yet supported.
        </p>
        <Button onClick={onNext} className="mx-auto block">
          Skip Question
        </Button>
      </div>
    </div>
  );
}

// Feedback Card Component
function FeedbackCard({
  isCorrect,
  explanation,
  hint,
  onNext,
  correctAnswer
}: {
  isCorrect: boolean;
  explanation: string;
  hint?: string;
  onNext: () => void;
  correctAnswer?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white rounded-3xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-2 rounded-full ${
          isCorrect ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {isCorrect ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <XCircle className="w-5 h-5 text-white" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg mb-2 ${
            isCorrect ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCorrect ? 'Correct!' : 'Not Quite'}
          </h3>
          
          <p className="text-gray-700 leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>
      
      {!isCorrect && correctAnswer && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Correct answer:</p>
          <p className="font-mono text-lg">{correctAnswer}</p>
        </div>
      )}
      
      {!isCorrect && hint && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-900 text-sm mb-1">Hint</p>
              <p className="text-yellow-800 text-sm leading-relaxed">{hint}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <Button 
          onClick={onNext} 
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          Next Question
        </Button>
      </div>
    </motion.div>
  );
}