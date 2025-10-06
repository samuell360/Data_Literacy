import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Flame, Star, Trophy, Zap, TrendingUp } from "lucide-react";

// XP Progress Bar Component
interface XPBarProps {
  currentXP: number;
  levelXP: number;
  nextLevelXP: number;
  level: number;
}

export function XPBar({ currentXP, levelXP, nextLevelXP, level }: XPBarProps) {
  const progress = ((currentXP - levelXP) / (nextLevelXP - levelXP)) * 100;
  
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">{level}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Level {level}</span>
            <span className="caption-sm text-muted-foreground">
              {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="text-center">
          <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
          <span className="caption-sm text-muted-foreground">XP</span>
        </div>
      </div>
    </Card>
  );
}

// Streak Calendar Component
interface StreakCalendarProps {
  streak: number;
  weekData: boolean[]; // 7 days, true = completed
}

export function StreakCalendar({ streak, weekData }: StreakCalendarProps) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <div>
          <h4 className="font-medium">Daily Streak</h4>
          <span className="caption-sm text-muted-foreground">
            {streak} day{streak !== 1 ? 's' : ''} in a row
          </span>
        </div>
        <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
          {streak} 🔥
        </Badge>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div key={index} className="text-center">
            <div className="caption-sm text-muted-foreground mb-2">{day}</div>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                weekData[index] 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-muted'
              }`}
            >
              {weekData[index] && <Flame className="w-3 h-3" />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Badge Shelf Component
interface BadgeShelfProps {
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: string;
    category: "probability" | "hypothesis" | "simulation" | "achievement";
  }>;
}

export function BadgeShelf({ badges }: BadgeShelfProps) {
  const categoryColors = {
    probability: "text-[#E86AA6] bg-pink-50 dark:bg-pink-950/20",
    hypothesis: "text-[#64E2BA] bg-green-50 dark:bg-green-950/20",
    simulation: "text-[#7C9BFF] bg-blue-50 dark:bg-blue-950/20",
    achievement: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-600" />
        <h4 className="font-medium">Achievements</h4>
        <Badge variant="secondary" className="ml-auto">
          {badges.filter(b => b.earned).length} / {badges.length}
        </Badge>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`relative p-4 rounded-lg border text-center transition-all ${
              badge.earned
                ? `${categoryColors[badge.category]} border-current/20`
                : 'bg-muted text-muted-foreground border-border opacity-50'
            }`}
          >
            <div className="w-8 h-8 mx-auto mb-2 text-2xl">
              {badge.icon}
            </div>
            <h5 className="caption-sm font-medium mb-1">{badge.name}</h5>
            <p className="caption-sm opacity-75 leading-tight">
              {badge.description}
            </p>
            {badge.earned && badge.earnedDate && (
              <span className="caption-sm opacity-60 block mt-1">
                {new Date(badge.earnedDate).toLocaleDateString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// Leaderboard Row Component
interface LeaderboardRowProps {
  rank: number;
  user: {
    name: string;
    avatar?: string;
    xp: number;
    trend: "up" | "down" | "same";
  };
  isCurrentUser?: boolean;
}

export function LeaderboardRow({ rank, user, isCurrentUser = false }: LeaderboardRowProps) {
  const getRankColor = () => {
    switch (rank) {
      case 1: return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case 2: return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
      case 3: return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getTrendIcon = () => {
    switch (user.trend) {
      case "up": return <TrendingUp className="w-3 h-3 text-green-600" />;
      case "down": return <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />;
      default: return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg ${
      isCurrentUser ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800" : ""
    }`}>
      {/* Rank */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center caption-sm font-medium ${getRankColor()}`}>
        {rank <= 3 ? (
          <Trophy className="w-4 h-4" />
        ) : (
          <span>{rank}</span>
        )}
      </div>
      
      {/* Avatar */}
      <Avatar className="w-10 h-10">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="caption-sm">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      
      {/* User Info */}
      <div className="flex-1">
        <div className="font-medium">{user.name}</div>
        <div className="caption-sm text-muted-foreground">
          {user.xp.toLocaleString()} XP
        </div>
      </div>
      
      {/* Trend */}
      <div className="flex items-center gap-1">
        {getTrendIcon()}
      </div>
      
      {/* Sparkline Placeholder */}
      <div className="w-16 h-8 bg-muted rounded opacity-50" />
    </div>
  );
}

