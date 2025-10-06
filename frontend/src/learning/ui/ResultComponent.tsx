/**
 * Result Component - Duolingo Style
 * 
 * Fun, engaging results with gamification elements
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Clock,
  Target,
  Award,
  BookOpen,
  Zap,
  Flame,
  Medal
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import type { QuizResult, QuizQuestion } from './QuizComponent';

interface ResultComponentProps {
  result: QuizResult;
  lessonTitle: string;
  canAdvanceToNext: boolean;
  nextLessonTitle?: string;
  onRetryQuiz: () => void;
  onNextLesson: () => void;
  onBackToLessons: () => void;
  passThreshold?: number;
  questions?: QuizQuestion[]; // Add questions to show full context
  xpEarned?: number; // Gamification
  currentStreak?: number; // Gamification
}

interface PerformanceLevel {
  level: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  message: string;
  celebration: string;
  tips: string[];
  xpMultiplier: number;
}

export function ResultComponent({
  result,
  lessonTitle,
  canAdvanceToNext,
  nextLessonTitle,
  onRetryQuiz,
  onNextLesson,
  onBackToLessons,
  passThreshold = 70,
  questions = [],
  xpEarned = 0,
  currentStreak = 0
}: ResultComponentProps) {
  const { score, totalQuestions, correctAnswers, timeSpent, answers } = result;
  const passed = score >= passThreshold;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const incorrectCount = totalQuestions - correctAnswers;
  
  // More realistic performance tiers
  const performance = useMemo((): PerformanceLevel => {
    if (accuracy === 100) {
      return {
        level: 'PERFECT',
        emoji: '🏆',
        color: 'text-yellow-600',
        bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
        borderColor: 'border-yellow-300',
        icon: <Trophy className="w-16 h-16 text-yellow-500" />,
        message: 'FLAWLESS VICTORY!',
        celebration: 'You absolutely crushed it! 🎉',
        tips: [
          '🎯 Perfect score! You\'re ready for the next challenge',
          '⚡ Consider helping others master this topic',
          '🔥 Keep that winning streak alive!'
        ],
        xpMultiplier: 2.0
      };
    }
    if (accuracy >= 90) {
      return {
        level: 'EXCELLENT',
        emoji: '⭐',
        color: 'text-green-600',
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
        borderColor: 'border-green-300',
        icon: <Star className="w-16 h-16 text-green-500" />,
        message: 'Outstanding Work!',
        celebration: 'You\'re on fire! 🔥',
        tips: [
          '💪 Almost perfect! Review those missed questions',
          '🎓 You\'re mastering this material',
          '🚀 Ready to level up!'
        ],
        xpMultiplier: 1.5
      };
    }
    if (accuracy >= 80) {
      return {
        level: 'GREAT',
        emoji: '🎯',
        color: 'text-blue-600',
        bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        borderColor: 'border-blue-300',
        icon: <Target className="w-16 h-16 text-blue-500" />,
        message: 'Great Job!',
        celebration: 'You\'re doing awesome! 💙',
        tips: [
          '📚 Solid understanding! A few more practice runs and you\'ll ace it',
          '🎮 Review incorrect answers to level up',
          '✨ You\'re so close to excellent!'
        ],
        xpMultiplier: 1.2
      };
    }
    if (accuracy >= 70) {
      return {
        level: 'GOOD',
        emoji: '👍',
        color: 'text-purple-600',
        bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
        borderColor: 'border-purple-300',
        icon: <Medal className="w-16 h-16 text-purple-500" />,
        message: 'Nice Work!',
        celebration: 'You passed! Keep it up! 💜',
        tips: [
          '📖 Good foundation! Review missed concepts',
          '🎯 Try the quiz again to boost your score',
          '💡 Focus on understanding, not just memorizing'
        ],
        xpMultiplier: 1.0
      };
    }
    if (accuracy >= 50) {
      return {
        level: 'KEEP TRYING',
        emoji: '💪',
        color: 'text-orange-600',
        bgColor: 'bg-gradient-to-br from-orange-50 to-yellow-50',
        borderColor: 'border-orange-300',
        icon: <TrendingUp className="w-16 h-16 text-orange-500" />,
        message: 'You\'re Getting There!',
        celebration: 'Progress over perfection! 🌟',
        tips: [
          '📚 Review the lesson material again',
          '🎯 Focus on one concept at a time',
          '💪 Practice makes progress—try again!',
          '🤝 Don\'t hesitate to ask for help'
        ],
        xpMultiplier: 0.5
      };
    }
    return {
      level: 'NEEDS PRACTICE',
      emoji: '📖',
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
      borderColor: 'border-red-300',
      icon: <BookOpen className="w-16 h-16 text-red-500" />,
      message: 'Let\'s Review Together',
      celebration: 'Every expert was once a beginner! 🌱',
      tips: [
        '📖 Take your time reviewing the lesson',
        '✍️ Take notes while studying',
        '🎯 Break the material into smaller chunks',
        '💡 Understanding takes time—be patient with yourself',
        '🤝 Ask questions and seek help'
      ],
      xpMultiplier: 0.3
    };
  }, [accuracy]);

  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  const avgTimePerQuestion = Math.round(timeSpent / totalQuestions);
  const totalXP = Math.round((xpEarned || correctAnswers * 10) * performance.xpMultiplier);

  // Group answers for better display
  const incorrectAnswers = useMemo(() => 
    answers.filter(a => !a.isCorrect), 
    [answers]
  );
  const correctAnswersArray = useMemo(() => 
    answers.filter(a => a.isCorrect), 
    [answers]
  );

  // Get question details
  const getQuestionDetails = (questionId: string) => {
    return questions.find(q => q.id === questionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Confetti Animation for High Scores */}
        {accuracy >= 90 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: -50,
                  rotate: 0
                }}
                animate={{ 
                  y: window.innerHeight + 50,
                  rotate: 360
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "linear"
                }}
              >
                {['🎉', '⭐', '🏆', '✨', '🎊'][i % 5]}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Header with Performance Icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="mb-4 inline-block"
          >
            {performance.icon}
          </motion.div>
          <motion.h1 
            className={`text-5xl font-bold mb-2 ${performance.color}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {performance.emoji} {performance.message}
          </motion.h1>
          <p className="text-xl text-gray-600 font-medium">
            {performance.celebration}
          </p>
          <p className="text-sm text-gray-500 mt-2">{lessonTitle}</p>
        </motion.div>

        {/* Main Results Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-6"
        >
          {/* Score Display */}
          <div className={`text-center mb-8 p-8 rounded-2xl border-4 ${performance.bgColor} ${performance.borderColor}`}>
            <motion.div 
              className={`text-7xl font-black ${performance.color} mb-3`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                delay: 0.5
              }}
            >
              {accuracy}%
            </motion.div>
            <Badge 
              variant={passed ? "default" : "secondary"} 
              className="text-lg px-6 py-2 mb-2"
            >
              {performance.level}
            </Badge>
            <div className="mt-4 text-sm text-gray-600">
              {correctAnswers} out of {totalQuestions} correct
            </div>
          </div>

          {/* XP and Streak */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div 
              className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-200"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-600 mb-1">XP EARNED</div>
                  <div className="text-3xl font-bold text-yellow-600">
                    +{totalXP}
                  </div>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border-2 border-orange-200"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-600 mb-1">STREAK</div>
                  <div className="text-3xl font-bold text-orange-600">
                    {currentStreak} 🔥
                  </div>
                </div>
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-green-50 p-4 rounded-xl text-center border-2 border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-600">
                {correctAnswers}
              </div>
              <div className="text-xs text-gray-600">Correct</div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-xl text-center border-2 border-red-200">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-red-600">
                {incorrectCount}
              </div>
              <div className="text-xs text-gray-600">Missed</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-xl text-center border-2 border-purple-200">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-600">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600">Time</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl text-center border-2 border-blue-200">
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-600">
                {avgTimePerQuestion}s
              </div>
              <div className="text-xs text-gray-600">Per Q</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
              <span>Accuracy</span>
              <span>{accuracy}%</span>
            </div>
            <div className="relative">
              <Progress value={accuracy} className="h-4" />
              <motion.div
                className="absolute top-0 left-0 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
              <Award className="w-6 h-6" />
              Next Steps
            </h3>
            <ul className="space-y-2">
              {performance.tips.map((tip, index) => (
                <motion.li 
                  key={index} 
                  className="text-sm text-blue-800 flex items-start gap-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <span>{tip}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Question Review with Full Context */}
        {answers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-3xl shadow-2xl p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BookOpen className="w-7 h-7" />
              Review Your Answers
            </h2>

            {/* Incorrect Answers First */}
            {incorrectAnswers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                  <XCircle className="w-6 h-6" />
                  Questions to Review ({incorrectAnswers.length})
                </h3>
                <div className="space-y-4">
                  {incorrectAnswers.map((answer) => {
                    const question = getQuestionDetails(answer.questionId);
                    const questionNumber = answers.findIndex(a => a.questionId === answer.questionId) + 1;
                    return (
                      <AnswerReviewCard
                        key={answer.questionId}
                        answer={answer}
                        question={question}
                        questionNumber={questionNumber}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Correct Answers - Collapsible */}
            {correctAnswersArray.length > 0 && (
              <details className="group">
                <summary className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2 cursor-pointer hover:text-green-800 list-none">
                  <CheckCircle className="w-6 h-6" />
                  Correct Answers ({correctAnswersArray.length})
                  <span className="ml-auto text-sm text-gray-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="space-y-4 mt-4">
                  {correctAnswersArray.map((answer) => {
                    const question = getQuestionDetails(answer.questionId);
                    const questionNumber = answers.findIndex(a => a.questionId === answer.questionId) + 1;
                    return (
                      <AnswerReviewCard
                        key={answer.questionId}
                        answer={answer}
                        question={question}
                        questionNumber={questionNumber}
                      />
                    );
                  })}
                </div>
              </details>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={onRetryQuiz}
            className="flex items-center gap-2 text-lg py-6"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </Button>

          {canAdvanceToNext ? (
            <Button
              size="lg"
              onClick={onNextLesson}
              className="flex items-center gap-2 text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {nextLessonTitle || 'Continue Learning'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={onBackToLessons}
              className="flex items-center gap-2 text-lg py-6"
            >
              Back to Lessons
              <BookOpen className="w-5 h-5" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Enhanced Answer Review Card
function AnswerReviewCard({ 
  answer, 
  question,
  questionNumber 
}: { 
  answer: QuizResult['answers'][0]; 
  question?: QuizQuestion;
  questionNumber: number;
}) {
  const isCorrect = answer.isCorrect;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border-3 transition-all ${
        isCorrect 
          ? 'bg-green-50 border-green-300 hover:shadow-lg hover:border-green-400' 
          : 'bg-red-50 border-red-300 hover:shadow-lg hover:border-red-400'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${
          isCorrect ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isCorrect ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-800 mb-3 text-lg">
            Question {questionNumber}
          </div>
          
          {/* Show Question Text */}
          {question && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-700 font-medium">{question.stem}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              <span className="font-semibold text-sm">Your answer: </span>
              <span className="font-mono font-bold">
                {formatAnswer(answer.userAnswer, question)}
              </span>
            </div>
            
            {!isCorrect && (
              <div className="p-3 rounded-lg bg-green-100 border-2 border-green-300">
                <span className="font-semibold text-sm text-green-800">Correct answer: </span>
                <span className="font-mono font-bold text-green-800">
                  {formatAnswer(answer.correctAnswer, question)}
                </span>
              </div>
            )}
            
            {/* Show Explanation */}
            {question?.explanation && (
              <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">💡</span>
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">Explanation:</div>
                    <p className="text-blue-800 text-sm">{question.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper function to format answers
function formatAnswer(answer: any, question?: QuizQuestion): string {
  if (typeof answer === 'boolean') {
    return answer ? 'True ✓' : 'False ✗';
  }
  if (typeof answer === 'number' && question?.type === 'mcq' && question.choices) {
    // Show both letter and text
    const letter = String.fromCharCode(65 + answer);
    const text = question.choices[answer];
    return `${letter}) ${text}`;
  }
  if (typeof answer === 'number') {
    return String.fromCharCode(65 + answer);
  }
  return String(answer);
}