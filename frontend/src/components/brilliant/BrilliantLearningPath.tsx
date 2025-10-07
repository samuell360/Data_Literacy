import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Play, 
  Clock, 
  Star,
  ArrowRight,
  Target,
  Award,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  locked: boolean;
  xpReward: number;
  prerequisites?: string[];
}

interface Level {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  color: string;
  completed: boolean;
  progress: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  levels: Level[];
  totalLessons: number;
  completedLessons: number;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  color: string;
}

interface BrilliantLearningPathProps {
  onLessonStart: (lessonId: string) => void;
  onBack: () => void;
}

export const BrilliantLearningPath: React.FC<BrilliantLearningPathProps> = ({
  onLessonStart,
  onBack
}) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  // Mock data - in real app, this would come from API
  const learningPaths: LearningPath[] = [
    {
      id: 'probability',
      title: 'Probability Fundamentals',
      description: 'Master the basics of probability theory and random events',
      color: 'var(--brilliant-probability)',
      totalLessons: 12,
      completedLessons: 8,
      estimatedTime: 120,
      difficulty: 'beginner',
      levels: [
        {
          id: 'level-1',
          title: 'Basic Concepts',
          description: 'Introduction to probability and basic terminology',
          color: 'var(--brilliant-probability)',
          completed: true,
          progress: 100,
          lessons: [
            {
              id: 'lesson-1',
              title: 'What is Probability?',
              description: 'Understanding the fundamental concept of probability',
              duration: 15,
              difficulty: 'beginner',
              completed: true,
              locked: false,
              xpReward: 50
            },
            {
              id: 'lesson-2',
              title: 'Sample Spaces',
              description: 'Exploring all possible outcomes of an experiment',
              duration: 20,
              difficulty: 'beginner',
              completed: true,
              locked: false,
              xpReward: 75
            },
            {
              id: 'lesson-3',
              title: 'Events and Outcomes',
              description: 'Understanding events and their relationships',
              duration: 18,
              difficulty: 'beginner',
              completed: false,
              locked: false,
              xpReward: 60
            }
          ]
        },
        {
          id: 'level-2',
          title: 'Probability Rules',
          description: 'Learning the fundamental rules of probability',
          color: 'var(--brilliant-probability)',
          completed: false,
          progress: 60,
          lessons: [
            {
              id: 'lesson-4',
              title: 'Addition Rule',
              description: 'Calculating probabilities of mutually exclusive events',
              duration: 25,
              difficulty: 'intermediate',
              completed: true,
              locked: false,
              xpReward: 100
            },
            {
              id: 'lesson-5',
              title: 'Multiplication Rule',
              description: 'Understanding independent and dependent events',
              duration: 30,
              difficulty: 'intermediate',
              completed: false,
              locked: false,
              xpReward: 120
            },
            {
              id: 'lesson-6',
              title: 'Conditional Probability',
              description: 'Probability given that another event has occurred',
              duration: 35,
              difficulty: 'intermediate',
              completed: false,
              locked: true,
              xpReward: 150
            }
          ]
        }
      ]
    },
    {
      id: 'hypothesis',
      title: 'Hypothesis Testing',
      description: 'Learn to test hypotheses and make data-driven decisions',
      color: 'var(--brilliant-hypothesis)',
      totalLessons: 15,
      completedLessons: 5,
      estimatedTime: 180,
      difficulty: 'intermediate',
      levels: [
        {
          id: 'level-3',
          title: 'Introduction to Testing',
          description: 'Basic concepts of hypothesis testing',
          color: 'var(--brilliant-hypothesis)',
          completed: false,
          progress: 40,
          lessons: [
            {
              id: 'lesson-7',
              title: 'Null and Alternative Hypotheses',
              description: 'Setting up hypotheses for testing',
              duration: 20,
              difficulty: 'intermediate',
              completed: true,
              locked: false,
              xpReward: 80
            },
            {
              id: 'lesson-8',
              title: 'Type I and Type II Errors',
              description: 'Understanding the risks in hypothesis testing',
              duration: 25,
              difficulty: 'intermediate',
              completed: false,
              locked: false,
              xpReward: 100
            }
          ]
        }
      ]
    }
  ];

  const toggleLevelExpansion = (levelId: string) => {
    setExpandedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(levelId)) {
        newSet.delete(levelId);
      } else {
        newSet.add(levelId);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'var(--brilliant-success)';
      case 'intermediate': return 'var(--brilliant-warning)';
      case 'advanced': return 'var(--brilliant-error)';
      default: return 'var(--brilliant-gray-400)';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return 'Unknown';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="brilliant-learning-path" style={{ 
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
              ← Back
            </motion.button>
            <div>
              <h1 className="brilliant-heading-xl">Learning Paths</h1>
              <p className="brilliant-body-lg" style={{ color: 'var(--brilliant-gray-600)' }}>
                Choose your learning journey and master statistics step by step
              </p>
            </div>
          </div>
        </motion.div>

        {/* Learning Paths */}
        <div className="space-y-8">
          {learningPaths.map((path, pathIndex) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pathIndex * 0.1 }}
              className="brilliant-card"
            >
              {/* Path Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: path.color }}
                    >
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="brilliant-heading-lg">{path.title}</h2>
                      <p className="brilliant-body-md" style={{ color: 'var(--brilliant-gray-600)' }}>
                        {path.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          background: `${getDifficultyColor(path.difficulty)}20`,
                          color: getDifficultyColor(path.difficulty)
                        }}
                      >
                        {getDifficultyLabel(path.difficulty)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: 'var(--brilliant-gray-500)' }} />
                      <span className="brilliant-body-sm" style={{ color: 'var(--brilliant-gray-500)' }}>
                        {formatTime(path.estimatedTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" style={{ color: 'var(--brilliant-gray-500)' }} />
                      <span className="brilliant-body-sm" style={{ color: 'var(--brilliant-gray-500)' }}>
                        {path.completedLessons}/{path.totalLessons} lessons
                      </span>
                    </div>
                  </div>
                  
                  {/* Overall Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="brilliant-caption">Overall Progress</span>
                      <span className="brilliant-caption">
                        {Math.round((path.completedLessons / path.totalLessons) * 100)}%
                      </span>
                    </div>
                    <div className="brilliant-progress">
                      <motion.div 
                        className="brilliant-progress-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${(path.completedLessons / path.totalLessons) * 100}%` }}
                        transition={{ duration: 1, delay: pathIndex * 0.2 }}
                        style={{ background: path.color }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Levels */}
              <div className="space-y-4">
                {path.levels.map((level, levelIndex) => (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (pathIndex * 0.1) + (levelIndex * 0.05) }}
                    className="border rounded-xl overflow-hidden"
                    style={{ borderColor: 'var(--brilliant-gray-200)' }}
                  >
                    {/* Level Header */}
                    <motion.button
                      whileHover={{ backgroundColor: 'var(--brilliant-gray-50)' }}
                      onClick={() => toggleLevelExpansion(level.id)}
                      className="w-full p-4 text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: level.color }}
                        >
                          {level.completed ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="brilliant-heading-sm">{level.title}</h3>
                          <p className="brilliant-body-sm" style={{ color: 'var(--brilliant-gray-600)' }}>
                            {level.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="brilliant-caption">
                            {level.lessons.filter(l => l.completed).length}/{level.lessons.length}
                          </div>
                          <div className="brilliant-caption" style={{ color: 'var(--brilliant-gray-500)' }}>
                            {Math.round(level.progress)}%
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedLevels.has(level.id) ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight className="w-4 h-4" style={{ color: 'var(--brilliant-gray-500)' }} />
                        </motion.div>
                      </div>
                    </motion.button>

                    {/* Level Lessons */}
                    <AnimatePresence>
                      {expandedLevels.has(level.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t"
                          style={{ borderColor: 'var(--brilliant-gray-200)' }}
                        >
                          <div className="p-4 space-y-3">
                            {level.lessons.map((lesson, lessonIndex) => (
                              <motion.div
                                key={lesson.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: lessonIndex * 0.05 }}
                                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                                  lesson.locked 
                                    ? 'bg-gray-50 opacity-60' 
                                    : lesson.completed
                                      ? 'bg-green-50 border border-green-200'
                                      : 'bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex items-center justify-center w-8 h-8">
                                    {lesson.locked ? (
                                      <Lock className="w-4 h-4" style={{ color: 'var(--brilliant-gray-400)' }} />
                                    ) : lesson.completed ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <div 
                                        className="w-4 h-4 rounded-full border-2"
                                        style={{ borderColor: level.color }}
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="brilliant-heading-sm">{lesson.title}</h4>
                                    <p className="brilliant-body-sm" style={{ color: 'var(--brilliant-gray-600)' }}>
                                      {lesson.description}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Clock className="w-3 h-3" style={{ color: 'var(--brilliant-gray-500)' }} />
                                      <span className="brilliant-caption" style={{ color: 'var(--brilliant-gray-500)' }}>
                                        {lesson.duration}m
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Award className="w-3 h-3" style={{ color: 'var(--brilliant-primary)' }} />
                                      <span className="brilliant-caption" style={{ color: 'var(--brilliant-primary)' }}>
                                        {lesson.xpReward} XP
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {!lesson.locked && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => onLessonStart(lesson.id)}
                                      className="brilliant-btn brilliant-btn-primary"
                                      style={{ 
                                        fontSize: 'var(--brilliant-text-sm)', 
                                        padding: 'var(--brilliant-space-2) var(--brilliant-space-4)' 
                                      }}
                                    >
                                      {lesson.completed ? (
                                        <>
                                          <RotateCcw className="w-4 h-4" />
                                          Review
                                        </>
                                      ) : (
                                        <>
                                          <Play className="w-4 h-4" />
                                          Start
                                        </>
                                      )}
                                    </motion.button>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
