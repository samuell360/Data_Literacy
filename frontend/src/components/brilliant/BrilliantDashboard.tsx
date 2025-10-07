import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Beaker, 
  Trophy, 
  TrendingUp, 
  Zap, 
  Star,
  Play,
  CheckCircle,
  Clock,
  Target,
  Award,
  Sparkles
} from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  color: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
}

interface Stats {
  streak: number;
  totalXP: number;
  lessonsCompleted: number;
  accuracy: number;
}

export const BrilliantDashboard: React.FC = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Mock data - in real app, this would come from API
  const learningPaths: LearningPath[] = [
    {
      id: 'probability',
      title: 'Probability Fundamentals',
      description: 'Master the basics of probability theory and random events',
      color: 'var(--brilliant-probability)',
      progress: 65,
      totalLessons: 12,
      completedLessons: 8,
      difficulty: 'beginner',
      estimatedTime: '2 hours'
    },
    {
      id: 'hypothesis',
      title: 'Hypothesis Testing',
      description: 'Learn to test hypotheses and make data-driven decisions',
      color: 'var(--brilliant-hypothesis)',
      progress: 30,
      totalLessons: 15,
      completedLessons: 5,
      difficulty: 'intermediate',
      estimatedTime: '3 hours'
    },
    {
      id: 'simulation',
      title: 'Statistical Simulations',
      description: 'Create and analyze simulations to understand complex systems',
      color: 'var(--brilliant-simulation)',
      progress: 0,
      totalLessons: 10,
      completedLessons: 0,
      difficulty: 'advanced',
      estimatedTime: '4 hours'
    }
  ];

  const achievements: Achievement[] = [
    {
      id: 'first-lesson',
      title: 'Getting Started',
      description: 'Complete your first lesson',
      icon: <Star className="w-5 h-5" />,
      unlocked: true
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: <Zap className="w-5 h-5" />,
      unlocked: false,
      progress: 5
    },
    {
      id: 'accuracy-90',
      title: 'Precision Master',
      description: 'Achieve 90% accuracy across all lessons',
      icon: <Target className="w-5 h-5" />,
      unlocked: false,
      progress: 75
    }
  ];

  const stats: Stats = {
    streak: 5,
    totalXP: 1250,
    lessonsCompleted: 13,
    accuracy: 87
  };

  // Simulate streak animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStreak(stats.streak);
      if (stats.streak > 0) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [stats.streak]);

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

  return (
    <div className="brilliant-dashboard" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--brilliant-gray-50) 0%, var(--brilliant-white) 100%)',
      padding: 'var(--brilliant-space-6)'
    }}>
      <div className="brilliant-container">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={showCelebration ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--brilliant-primary)' }}
            >
              <Sparkles className="w-8 h-8" style={{ color: 'var(--brilliant-gray-800)' }} />
            </motion.div>
            <div>
              <h1 className="brilliant-heading-xl mb-2">Welcome back!</h1>
              <p className="brilliant-body-lg" style={{ color: 'var(--brilliant-gray-600)' }}>
                Ready to continue your learning journey?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="brilliant-card text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-6 h-6" style={{ color: 'var(--brilliant-primary)' }} />
              <span className="brilliant-caption">Streak</span>
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="brilliant-heading-lg"
              style={{ color: 'var(--brilliant-primary)' }}
            >
              {currentStreak} days
            </motion.div>
          </div>

          <div className="brilliant-card text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Award className="w-6 h-6" style={{ color: 'var(--brilliant-probability)' }} />
              <span className="brilliant-caption">Total XP</span>
            </div>
            <div className="brilliant-heading-lg" style={{ color: 'var(--brilliant-probability)' }}>
              {stats.totalXP.toLocaleString()}
            </div>
          </div>

          <div className="brilliant-card text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle className="w-6 h-6" style={{ color: 'var(--brilliant-hypothesis)' }} />
              <span className="brilliant-caption">Completed</span>
            </div>
            <div className="brilliant-heading-lg" style={{ color: 'var(--brilliant-hypothesis)' }}>
              {stats.lessonsCompleted}
            </div>
          </div>

          <div className="brilliant-card text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Target className="w-6 h-6" style={{ color: 'var(--brilliant-simulation)' }} />
              <span className="brilliant-caption">Accuracy</span>
            </div>
            <div className="brilliant-heading-lg" style={{ color: 'var(--brilliant-simulation)' }}>
              {stats.accuracy}%
            </div>
          </div>
        </motion.div>

        {/* Learning Paths */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="brilliant-heading-md mb-6">Continue Learning</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {learningPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="brilliant-card-interactive"
                style={{ 
                  borderLeft: `4px solid ${path.color}`,
                  cursor: 'pointer'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="brilliant-heading-sm mb-2">{path.title}</h3>
                    <p className="brilliant-body-sm mb-4" style={{ color: 'var(--brilliant-gray-600)' }}>
                      {path.description}
                    </p>
                  </div>
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

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="brilliant-caption">Progress</span>
                    <span className="brilliant-caption">{path.completedLessons}/{path.totalLessons} lessons</span>
                  </div>
                  <div className="brilliant-progress">
                    <motion.div 
                      className="brilliant-progress-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${path.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 * index }}
                      style={{ background: path.color }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: 'var(--brilliant-gray-500)' }} />
                    <span className="brilliant-body-sm" style={{ color: 'var(--brilliant-gray-500)' }}>
                      {path.estimatedTime}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="brilliant-btn brilliant-btn-primary"
                    style={{ fontSize: 'var(--brilliant-text-sm)', padding: 'var(--brilliant-space-2) var(--brilliant-space-4)' }}
                  >
                    <Play className="w-4 h-4" />
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="brilliant-heading-md mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={`brilliant-card ${achievement.unlocked ? 'brilliant-celebration' : ''}`}
                style={{ 
                  opacity: achievement.unlocked ? 1 : 0.6,
                  background: achievement.unlocked ? 'var(--brilliant-white)' : 'var(--brilliant-gray-100)'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ 
                      background: achievement.unlocked ? 'var(--brilliant-primary)' : 'var(--brilliant-gray-300)',
                      color: achievement.unlocked ? 'var(--brilliant-gray-800)' : 'var(--brilliant-gray-500)'
                    }}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="brilliant-heading-sm">{achievement.title}</h4>
                    <p className="brilliant-body-sm" style={{ color: 'var(--brilliant-gray-600)' }}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
                
                {achievement.progress !== undefined && !achievement.unlocked && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="brilliant-caption">Progress</span>
                      <span className="brilliant-caption">{achievement.progress}%</span>
                    </div>
                    <div className="brilliant-progress">
                      <div 
                        className="brilliant-progress-bar"
                        style={{ width: `${achievement.progress}%`, background: 'var(--brilliant-gray-400)' }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="brilliant-heading-md mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="brilliant-card-interactive text-left p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--brilliant-probability)' }}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="brilliant-heading-sm">Practice Mode</h4>
                  <p className="brilliant-body-sm" style={{ color: 'var(--brilliant-gray-600)' }}>
                    Review concepts
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="brilliant-card-interactive text-left p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--brilliant-simulation)' }}>
                  <Beaker className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="brilliant-heading-sm">Simulation Lab</h4>
                  <p className="brilliant-body-sm" style={{ color: 'var(--brilliant-gray-600)' }}>
                    Interactive experiments
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="brilliant-card-interactive text-left p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--brilliant-hypothesis)' }}>
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="brilliant-heading-sm">Leaderboard</h4>
                  <p className="brilliant-body-sm" style={{ color: 'var(--brilliant-gray-600)' }}>
                    See rankings
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
