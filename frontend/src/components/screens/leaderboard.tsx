import { LeaderboardRow, BadgeShelf } from "../stats-ui/gamification";
import { StatCard } from "../stats-ui/stat-card";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Calendar,
  Users,
  Star,
  Zap,
  Filter
} from "lucide-react";

export function Leaderboard() {
  // Mock leaderboard data
  const globalLeaders = [
    {
      rank: 1,
      user: {
        name: "Alex Chen",
        avatar: undefined,
        xp: 15420,
        trend: "up" as const,
      },
    },
    {
      rank: 2,
      user: {
        name: "Sarah Johnson",
        avatar: undefined,
        xp: 14890,
        trend: "same" as const,
      },
    },
    {
      rank: 3,
      user: {
        name: "Michael Kim",
        avatar: undefined,
        xp: 14205,
        trend: "up" as const,
      },
    },
    {
      rank: 4,
      user: {
        name: "Emma Rodriguez",
        avatar: undefined,
        xp: 13750,
        trend: "down" as const,
      },
    },
    {
      rank: 5,
      user: {
        name: "David Park",
        avatar: undefined,
        xp: 13200,
        trend: "up" as const,
      },
      isCurrentUser: true,
    },
    {
      rank: 6,
      user: {
        name: "Lisa Wang",
        avatar: undefined,
        xp: 12980,
        trend: "same" as const,
      },
    },
    {
      rank: 7,
      user: {
        name: "James Wilson",
        avatar: undefined,
        xp: 12650,
        trend: "up" as const,
      },
    },
    {
      rank: 8,
      user: {
        name: "Rachel Green",
        avatar: undefined,
        xp: 12400,
        trend: "down" as const,
      },
    },
  ];

  // Mock achievements data
  const achievements = [
    {
      id: "first-steps",
      name: "First Steps",
      description: "Complete your first lesson",
      icon: "🏁",
      earned: true,
      earnedDate: "2023-12-01",
      category: "achievement" as const,
    },
    {
      id: "probability-master",
      name: "Probability Master",
      description: "Complete all probability modules",
      icon: "🎲",
      earned: true,
      earnedDate: "2023-12-15",
      category: "probability" as const,
    },
    {
      id: "hypothesis-hero",
      name: "Hypothesis Hero",
      description: "Master hypothesis testing",
      icon: "🔬",
      earned: false,
      category: "hypothesis" as const,
    },
    {
      id: "simulation-sage",
      name: "Simulation Sage",
      description: "Run 100 simulations",
      icon: "⚡",
      earned: true,
      earnedDate: "2023-12-20",
      category: "simulation" as const,
    },
    {
      id: "streak-champion",
      name: "Streak Champion",
      description: "Maintain a 30-day streak",
      icon: "🔥",
      earned: false,
      category: "achievement" as const,
    },
    {
      id: "perfect-score",
      name: "Perfect Score",
      description: "Score 100% on any assessment",
      icon: "⭐",
      earned: true,
      earnedDate: "2023-12-10",
      category: "achievement" as const,
    },
    {
      id: "helping-hand",
      name: "Helping Hand",
      description: "Help 10 fellow students",
      icon: "🤝",
      earned: false,
      category: "achievement" as const,
    },
    {
      id: "speed-learner",
      name: "Speed Learner",
      description: "Complete 5 lessons in one day",
      icon: "⚡",
      earned: false,
      category: "achievement" as const,
    },
  ];

  // Mock stats
  const leaderboardStats = [
    {
      title: "Your Rank",
      value: "#5",
      change: { value: 2, type: "increase" as const, period: "this week" },
      icon: Trophy,
    },
    {
      title: "Total XP",
      value: "13,200",
      change: { value: 15, type: "increase" as const, period: "this week" },
      icon: Zap,
    },
    {
      title: "Achievements",
      value: "4/8",
      change: { value: 1, type: "increase" as const, period: "this month" },
      icon: Medal,
    },
    {
      title: "Streak",
      value: "5 days",
      change: { value: 3, type: "increase" as const, period: "personal best: 12" },
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="display-lg mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you stack up against other statistics learners worldwide
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {leaderboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="global" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Select defaultValue="all-time">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="daily">Today</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="global" className="space-y-6">
          {/* Top 3 Podium */}
          <Card className="p-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {/* 2nd Place */}
              <div className="text-center order-1">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="font-semibold">SJ</span>
                </div>
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Medal className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold">Sarah Johnson</h4>
                <p className="caption-sm text-muted-foreground">14,890 XP</p>
              </div>

              {/* 1st Place */}
              <div className="text-center order-2">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-yellow-400">
                  <span className="font-semibold">AC</span>
                </div>
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold">Alex Chen</h4>
                <p className="caption-sm text-muted-foreground">15,420 XP</p>
              </div>

              {/* 3rd Place */}
              <div className="text-center order-3">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="font-semibold">MK</span>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Medal className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold">Michael Kim</h4>
                <p className="caption-sm text-muted-foreground">14,205 XP</p>
              </div>
            </div>
          </Card>

          {/* Full Leaderboard */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Global Rankings</h3>
              <div className="flex items-center gap-2 caption-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>12,847 total participants</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {globalLeaders.map((leader) => (
                <LeaderboardRow key={leader.rank} {...leader} />
              ))}
            </div>
            
            <div className="text-center mt-6">
              <Button variant="outline">
                View More Rankings
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="space-y-6">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Connect with Friends</h3>
            <p className="text-muted-foreground mb-4">
              Add friends to see how you compare and motivate each other to learn.
            </p>
            <Button>Find Friends</Button>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <BadgeShelf badges={achievements} />
          
          {/* Achievement Progress */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">In Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔬</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Hypothesis Hero</h4>
                    <p className="caption-sm text-muted-foreground">Complete 5 hypothesis testing modules</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="caption-sm font-medium mb-1">3/5</div>
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div className="w-3/5 bg-primary rounded-full h-2" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔥</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Streak Champion</h4>
                    <p className="caption-sm text-muted-foreground">Maintain a 30-day learning streak</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="caption-sm font-medium mb-1">5/30</div>
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div className="w-1/6 bg-primary rounded-full h-2" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}