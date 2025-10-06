import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { 
  Flame, 
  Star, 
  Trophy, 
  Crown, 
  Zap, 
  Heart, 
  Target, 
  CheckCircle2, 
  Lock,
  Play,
  ArrowRight,
  Calendar,
  Award,
  TrendingUp,
  Brain,
  Gamepad2,
  Gift,
  Coffee
} from "lucide-react";

interface LearningNode {
  id: string;
  title: string;
  emoji: string;
  level: number;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
  xpReward: number;
  color: string;
  lessons?: number;
  completedLessons?: number;
}

interface DuolingoDashboardProps {
  userLevel?: number;
  userXP?: number;
  streak?: number;
  hearts?: number;
  achievements?: string[];
  onNavigate?: (section: string) => void;
}

export function DuolingoDashboard({ 
  userLevel = 8, 
  userXP = 2750, 
  streak = 12, 
  hearts = 5,
  achievements = [],
  onNavigate 
}: DuolingoDashboardProps) {
  const [selectedUnit, setSelectedUnit] = useState(0);

  // Learning path nodes (like Duolingo's lesson nodes)
  const learningPath: LearningNode[] = [
    {
      id: "1",
      title: "Basic Probability",
      emoji: "🎲",
      level: 1,
      isCompleted: true,
      isActive: false,
      isLocked: false,
      xpReward: 50,
      color: "bg-gradient-to-br from-green-400 to-emerald-500",
      lessons: 8,
      completedLessons: 8
    },
    {
      id: "2", 
      title: "Probability Rules",
      emoji: "⚖️",
      level: 2,
      isCompleted: true,
      isActive: false,
      isLocked: false,
      xpReward: 75,
      color: "bg-gradient-to-br from-blue-400 to-cyan-500",
      lessons: 10,
      completedLessons: 10
    },
    {
      id: "3",
      title: "Random Variables",
      emoji: "📊",
      level: 3,
      isCompleted: false,
      isActive: true,
      isLocked: false,
      xpReward: 100,
      color: "bg-gradient-to-br from-orange-400 to-red-500",
      lessons: 12,
      completedLessons: 7
    },
    {
      id: "4",
      title: "Distributions",
      emoji: "📈",
      level: 4,
      isCompleted: false,
      isActive: false,
      isLocked: false,
      xpReward: 125,
      color: "bg-gradient-to-br from-purple-400 to-pink-500",
      lessons: 15,
      completedLessons: 0
    },
    {
      id: "5",
      title: "Hypothesis Testing",
      emoji: "🔬",
      level: 5,
      isCompleted: false,
      isActive: false,
      isLocked: true,
      xpReward: 150,
      color: "bg-gradient-to-br from-indigo-400 to-purple-500",
      lessons: 18,
      completedLessons: 0
    },
    {
      id: "6",
      title: "Confidence Intervals",
      emoji: "🎯",
      level: 6,
      isCompleted: false,
      isActive: false,
      isLocked: true,
      xpReward: 175,
      color: "bg-gradient-to-br from-teal-400 to-green-500",
      lessons: 14,
      completedLessons: 0
    },
    {
      id: "7",
      title: "Advanced Topics",
      emoji: "🧠",
      level: 7,
      isCompleted: false,
      isActive: false,
      isLocked: true,
      xpReward: 200,
      color: "bg-gradient-to-br from-violet-400 to-purple-500",
      lessons: 20,
      completedLessons: 0
    }
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const streakDays = [true, true, false, true, true, true, true]; // Sample data

  const todaysGoal = {
    xpTarget: 100,
    currentXP: 65,
    completed: false
  };

  const nextLevelXP = 3000;
  const currentLevelXP = 2500;
  const progressPercent = ((userXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const renderLearningNode = (node: LearningNode, index: number) => {
    const isEven = index % 2 === 0;
    const marginClass = isEven ? "ml-0" : "ml-auto mr-0";
    
    return (
      <div key={node.id} className={`relative w-20 ${marginClass} mb-8`}>
        {/* Connection Line */}
        {index < learningPath.length - 1 && (
          <div className={`absolute top-20 left-1/2 w-1 h-16 bg-gray-200 dark:bg-gray-700 transform -translate-x-1/2 z-0 ${
            node.isCompleted ? 'bg-green-400' : ''
          }`} />
        )}
        
        {/* Node */}
        <div 
          className={`relative z-10 w-20 h-20 rounded-full ${node.color} shadow-lg cursor-pointer transform transition-all hover:scale-110 ${
            node.isActive ? 'ring-4 ring-yellow-400 animate-pulse' : ''
          } ${node.isLocked ? 'grayscale opacity-50' : ''}`}
          onClick={() => !node.isLocked && onNavigate?.('learning')}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {node.isLocked ? (
              <Lock className="w-8 h-8 text-white" />
            ) : node.isCompleted ? (
              <Crown className="w-8 h-8 text-yellow-300" />
            ) : (
              <span className="text-2xl">{node.emoji}</span>
            )}
          </div>
          
          {/* Progress ring for active lesson */}
          {node.isActive && node.lessons && node.completedLessons && (
            <svg className="absolute inset-0 w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - (node.completedLessons / node.lessons))}`}
                className="transition-all duration-500"
              />
            </svg>
          )}
        </div>
        
        {/* Node Info */}
        <div className="text-center mt-2">
          <div className="font-semibold text-sm">{node.title}</div>
          {node.lessons && (
            <div className="caption-sm text-muted-foreground">
              {node.completedLessons}/{node.lessons} lessons
            </div>
          )}
          {!node.isLocked && (
            <Badge variant="outline" className="mt-1 text-xs">
              +{node.xpReward} XP
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Avatar and Streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">{userLevel}</span>
          </div>
          <div>
            <h1 className="display-lg">Welcome back! 🎉</h1>
            <p className="text-muted-foreground">Ready to level up your stats skills?</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Hearts */}
          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart 
                key={i} 
                className={`w-5 h-5 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          
          {/* Streak */}
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-full">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-600">{streak}</span>
            <span className="caption-sm text-muted-foreground">day streak</span>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <div>
              <h3 className="font-semibold">Level {userLevel}</h3>
              <p className="caption-sm text-muted-foreground">Statistics Explorer</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-primary">{userXP.toLocaleString()} XP</div>
            <div className="caption-sm text-muted-foreground">{nextLevelXP - userXP} to next level</div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-3 bg-blue-100 dark:bg-blue-900/30" />
      </Card>

      {/* Today's Goal */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold">Today's Goal</h3>
              <p className="caption-sm text-muted-foreground">Earn {todaysGoal.xpTarget} XP</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{todaysGoal.currentXP}</div>
            <div className="caption-sm text-muted-foreground">of {todaysGoal.xpTarget} XP</div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={(todaysGoal.currentXP / todaysGoal.xpTarget) * 100} className="h-2 bg-green-100 dark:bg-green-900/30" />
        </div>
      </Card>

      {/* Main Learning Path */}
      <Card className="p-8 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20">
        <div className="text-center mb-8">
          <h2 className="display-md mb-2">Statistics Journey</h2>
          <p className="text-muted-foreground">Follow the path to master statistical concepts</p>
        </div>
        
        <div className="relative max-w-md mx-auto">
          {learningPath.map((node, index) => renderLearningNode(node, index))}
        </div>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Practice Quizzes */}
        <Card 
          className="p-6 text-center cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-800"
          onClick={() => onNavigate?.('learning')}
        >
          <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Brain className="w-6 h-6 text-pink-600" />
          </div>
          <h4 className="font-semibold mb-2 text-pink-700 dark:text-pink-400">Fun Quizzes</h4>
          <p className="caption-sm text-muted-foreground mb-3">Test your knowledge</p>
          <Badge className="bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800">
            +15 XP
          </Badge>
        </Card>

        {/* Simulation Lab */}
        <Card 
          className="p-6 text-center cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
          onClick={() => onNavigate?.('simulations')}
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gamepad2 className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-400">Simulation Lab</h4>
          <p className="caption-sm text-muted-foreground mb-3">Interactive experiments</p>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            +25 XP
          </Badge>
        </Card>

        {/* Leaderboard */}
        <Card 
          className="p-6 text-center cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800"
          onClick={() => onNavigate?.('leaderboard')}
        >
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <h4 className="font-semibold mb-2 text-yellow-700 dark:text-yellow-400">Leaderboard</h4>
          <p className="caption-sm text-muted-foreground mb-3">Compete with others</p>
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
            View Ranking
          </Badge>
        </Card>

        {/* Daily Bonus */}
        <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">Daily Bonus</h4>
          <p className="caption-sm text-muted-foreground mb-3">Claim your reward</p>
          <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            +50 XP
          </Badge>
        </Card>
      </div>

      {/* Streak Calendar & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak Calendar */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">This Week</h3>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-orange-600">{streak} day streak!</span>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center">
                <div className="caption-sm text-muted-foreground mb-2">{day}</div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  streakDays[index] 
                    ? 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400' 
                    : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'
                }`}>
                  {streakDays[index] && <Flame className="w-4 h-4 text-orange-500" />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Achievements */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Recent Achievements</h3>
            </div>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Quiz Master</h4>
                <p className="caption-sm text-muted-foreground">Completed 10 quizzes</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                New!
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Speed Learner</h4>
                <p className="caption-sm text-muted-foreground">Finished lesson in under 5 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Consistent Learner</h4>
                <p className="caption-sm text-muted-foreground">Maintained 7-day streak</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Motivational Quote */}
      <Card className="p-6 text-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
        <Coffee className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
        <h3 className="font-semibold mb-2 text-indigo-700 dark:text-indigo-400">
          "Statistics is the art of learning from data" 
        </h3>
        <p className="caption-lg text-muted-foreground">
          Keep going! You're building valuable analytical skills every day.
        </p>
      </Card>
    </div>
  );
}