import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  ArrowRight, 
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Target,
  Clock,
  Award
} from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple-choice' | 'numeric' | 'true-false' | 'interactive';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  estimatedTime: number;
  xpReward: number;
}

interface BrilliantLessonViewerProps {
  lesson: Lesson;
  onComplete: (score: number, timeSpent: number) => void;
  onBack: () => void;
}

export const BrilliantLessonViewer: React.FC<BrilliantLessonViewerProps> = ({
  lesson,
  onComplete,
  onBack
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);

  const currentQuestion = lesson.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === lesson.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / lesson.questions.length) * 100;

  const handleAnswerSelect = (answer: string | number) => {
    if (showExplanation) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
    
    if (correct) {
      setShowCelebration(true);
      setScore(prev => prev + 1);
      setTimeout(() => setShowCelebration(false), 1500);
    }
    
    setCompletedQuestions(prev => new Set([...prev, currentQuestionIndex]));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const finalScore = score / lesson.questions.length;
      onComplete(finalScore, timeSpent);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsCorrect(null);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsCorrect(null);
      setShowHint(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'var(--brilliant-success)';
      case 'medium': return 'var(--brilliant-warning)';
      case 'hard': return 'var(--brilliant-error)';
      default: return 'var(--brilliant-gray-400)';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return 'Unknown';
    }
  };

  return (
    <div className="brilliant-lesson-viewer" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--brilliant-gray-50) 0%, var(--brilliant-white) 100%)',
      padding: 'var(--brilliant-space-6)'
    }}>
      <div className="brilliant-container">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="brilliant-btn brilliant-btn-ghost"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>
            <div>
              <h1 className="brilliant-heading-lg">{lesson.title}</h1>
              <p className="brilliant-body-md" style={{ color: 'var(--brilliant-gray-600)' }}>
                {lesson.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--brilliant-gray-500)' }} />
              <span className="brilliant-body-sm" style={{ color: 'var(--brilliant-gray-500)' }}>
                {lesson.estimatedTime} min
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" style={{ color: 'var(--brilliant-primary)' }} />
              <span className="brilliant-body-sm" style={{ color: 'var(--brilliant-primary)' }}>
                {lesson.xpReward} XP
              </span>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="brilliant-caption">Progress</span>
            <span className="brilliant-caption">
              {currentQuestionIndex + 1} of {lesson.questions.length}
            </span>
          </div>
          <div className="brilliant-progress">
            <motion.div 
              className="brilliant-progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              style={{ background: 'var(--brilliant-primary)' }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="brilliant-card mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ 
                background: `${getDifficultyColor(currentQuestion.difficulty)}20`,
                color: getDifficultyColor(currentQuestion.difficulty)
              }}
            >
              {getDifficultyLabel(currentQuestion.difficulty)}
            </div>
            
            {currentQuestion.hint && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHint(!showHint)}
                className="brilliant-btn brilliant-btn-ghost"
                style={{ fontSize: 'var(--brilliant-text-sm)' }}
              >
                <Lightbulb className="w-4 h-4" />
                Hint
              </motion.button>
            )}
          </div>

          <h2 className="brilliant-heading-md mb-6">{currentQuestion.question}</h2>

          {/* Hint */}
          <AnimatePresence>
            {showHint && currentQuestion.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-lg"
                style={{ 
                  background: 'var(--brilliant-warning-light)20',
                  border: '1px solid var(--brilliant-warning-light)40'
                }}
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 mt-0.5" style={{ color: 'var(--brilliant-warning)' }} />
                  <p className="brilliant-body-sm" style={{ color: 'var(--brilliant-warning)' }}>
                    {currentQuestion.hint}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options?.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswerSelect(option)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                  showExplanation 
                    ? option === currentQuestion.correctAnswer
                      ? 'border-2 border-green-500 bg-green-50'
                      : selectedAnswer === option
                        ? 'border-2 border-red-500 bg-red-50'
                        : 'border border-gray-200 bg-gray-50'
                    : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="brilliant-body-md">{option}</span>
                  {showExplanation && option === currentQuestion.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {showExplanation && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-xl mb-6 ${
                  isCorrect 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 mt-0.5 text-red-500" />
                  )}
                  <div>
                    <p className={`brilliant-body-md mb-2 ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {isCorrect ? 'Correct!' : 'Not quite right.'}
                    </p>
                    <p className="brilliant-body-sm" style={{ color: 'var(--brilliant-gray-700)' }}>
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="brilliant-btn brilliant-btn-ghost"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!showExplanation}
              className="brilliant-btn brilliant-btn-primary"
            >
              {isLastQuestion ? 'Complete Lesson' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Celebration Animation */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.6 }}
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--brilliant-primary)' }}
                >
                  <Sparkles className="w-12 h-12" style={{ color: 'var(--brilliant-gray-800)' }} />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="brilliant-heading-lg"
                  style={{ color: 'var(--brilliant-primary)' }}
                >
                  Excellent!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="brilliant-body-md"
                  style={{ color: 'var(--brilliant-gray-600)' }}
                >
                  You're doing great!
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
