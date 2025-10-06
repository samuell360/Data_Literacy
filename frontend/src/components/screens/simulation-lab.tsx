import { useState } from "react";
import { InteractiveSimulation } from "../stats-ui/interactive-simulation";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Beaker, 
  Play, 
  Bookmark, 
  Share2, 
  History,
  TrendingUp,
  BarChart3,
  Zap,
  ArrowLeft,
  Star,
  Trophy,
  Target,
  Flame,
  Brain,
  Gamepad2,
  Award
} from "lucide-react";

export function SimulationLab() {
  const [totalScore, setTotalScore] = useState(2450);
  const [completedSimulations, setCompletedSimulations] = useState(18);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [achievements, setAchievements] = useState([
    "First Simulation", "Coin Master", "Dice Expert", "Speed Runner"
  ]);

  const handleSimulationComplete = (results: any) => {
    setCompletedSimulations(prev => prev + 1);
    setTotalScore(prev => prev + results.score);
    setAchievements(prev => [...prev, ...results.achievements]);
  };

  const handleScoreUpdate = (score: number) => {
    // Real-time score updates during simulation
  };

  // Mock recent simulations
  const recentSimulations = [
    {
      id: 1,
      name: "Central Limit Theorem Demo",
      type: "Normal Distribution",
      date: "2 hours ago",
      samples: 5000,
    },
    {
      id: 2,
      name: "Bootstrap Confidence Intervals",
      type: "Bootstrap Sampling",
      date: "1 day ago",
      samples: 10000,
    },
    {
      id: 3,
      name: "Hypothesis Testing Power",
      type: "T-Test",
      date: "3 days ago",
      samples: 1000,
    },
  ];

  // Mock simulation templates
  const templates = [
    {
      id: 1,
      name: "Central Limit Theorem",
      description: "Demonstrate how sample means approach normal distribution",
      category: "Foundations",
      difficulty: "Beginner",
    },
    {
      id: 2,
      name: "Bootstrap Sampling",
      description: "Estimate population parameters using resampling methods",
      category: "Inference",
      difficulty: "Intermediate",
    },
    {
      id: 3,
      name: "Monte Carlo Integration",
      description: "Approximate definite integrals using random sampling",
      category: "Advanced",
      difficulty: "Advanced",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bookmark className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Lab Header */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20 rounded-[24px] p-8 border border-purple-200/50 dark:border-purple-800/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="bg-[#7C9BFF]/10 text-[#7C9BFF] border-[#7C9BFF]/20">
                <Gamepad2 className="w-3 h-3 mr-1" />
                Simulation Playground
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                <Zap className="w-3 h-3 mr-1" />
                Gamified
              </Badge>
            </div>
            <h1 className="display-lg mb-4">🎮 Interactive Simulation Lab</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Dive into addictive statistical simulations! Choose your experiment, customize visualizations, 
              earn points, and unlock achievements while mastering probability and statistics concepts.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 max-w-lg">
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <div className="font-semibold text-yellow-600">{totalScore.toLocaleString()}</div>
                <div className="caption-sm text-muted-foreground">Points</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <div className="font-semibold text-blue-600">{completedSimulations}</div>
                <div className="caption-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <div className="font-semibold text-orange-600">{currentStreak}</div>
                <div className="caption-sm text-muted-foreground">Streak</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <div className="font-semibold text-purple-600">{achievements.length}</div>
                <div className="caption-sm text-muted-foreground">Badges</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <p className="caption-sm text-muted-foreground">Smart Lab</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="playground" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="playground" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Playground
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="space-y-6">
          <InteractiveSimulation 
            onComplete={handleSimulationComplete}
            onScoreUpdate={handleScoreUpdate}
          />
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="display-md mb-2">Daily Challenges</h2>
            <p className="text-muted-foreground">Complete special challenges for bonus rewards!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Challenge Cards */}
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
                  Daily
                </Badge>
                <div className="text-2xl">🎲</div>
              </div>
              <h4 className="font-semibold mb-2">Dice Master</h4>
              <p className="caption-lg text-muted-foreground mb-4">
                Roll 1000 dice and achieve an average within 0.1 of the expected value
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between caption-sm">
                  <span>Progress</span>
                  <span>340/1000</span>
                </div>
                <Progress value={34} className="h-2" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="caption-lg font-medium">+100 XP</span>
                </div>
                <Button size="sm">Continue</Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                  Weekly
                </Badge>
                <div className="text-2xl">📊</div>
              </div>
              <h4 className="font-semibold mb-2">Normal Expert</h4>
              <p className="caption-lg text-muted-foreground mb-4">
                Generate 5 normal distributions with different parameters
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between caption-sm">
                  <span>Progress</span>
                  <span>2/5</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="caption-lg font-medium">+250 XP</span>
                </div>
                <Button size="sm">Start</Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                  Special
                </Badge>
                <div className="text-2xl">🏆</div>
              </div>
              <h4 className="font-semibold mb-2">Speed Runner</h4>
              <p className="caption-lg text-muted-foreground mb-4">
                Complete 10 simulations in under 5 minutes
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between caption-sm">
                  <span>Best Time</span>
                  <span>6:42</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="caption-lg font-medium">+500 XP</span>
                </div>
                <Button size="sm" variant="outline">Locked</Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="display-md mb-2">Achievements & Badges</h2>
            <p className="text-muted-foreground">Show off your simulation mastery!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Achievement Cards */}
            {achievements.map((achievement, index) => (
              <Card key={index} className="p-4 text-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-sm mb-1">{achievement}</h4>
                <p className="caption-sm text-muted-foreground">Unlocked!</p>
                <Badge className="mt-2 bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                  Earned
                </Badge>
              </Card>
            ))}
            
            {/* Locked Achievements */}
            <Card className="p-4 text-center opacity-50">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Monte Carlo Master</h4>
              <p className="caption-sm text-muted-foreground">Complete 100 Monte Carlo simulations</p>
              <Badge variant="outline" className="mt-2">
                Locked
              </Badge>
            </Card>

            <Card className="p-4 text-center opacity-50">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Streak Legend</h4>
              <p className="caption-sm text-muted-foreground">Maintain a 30-day simulation streak</p>
              <Badge variant="outline" className="mt-2">
                Locked
              </Badge>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="display-md mb-2">Global Leaderboard</h2>
            <p className="text-muted-foreground">Compete with simulation enthusiasts worldwide!</p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              {/* Top 3 */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">StatWizard2024</h4>
                    <p className="caption-sm text-muted-foreground">University of Statistics</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-yellow-600">12,450 pts</div>
                  <div className="caption-sm text-muted-foreground">245 simulations</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">DataNinja</h4>
                    <p className="caption-sm text-muted-foreground">Statistics Academy</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-600">11,230 pts</div>
                  <div className="caption-sm text-muted-foreground">201 simulations</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">ProbabilityPro</h4>
                    <p className="caption-sm text-muted-foreground">Math Institute</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-orange-600">9,890 pts</div>
                  <div className="caption-sm text-muted-foreground">187 simulations</div>
                </div>
              </div>

              {/* Current User */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">47</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">You</h4>
                    <p className="caption-sm text-muted-foreground">Keep climbing!</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">{totalScore.toLocaleString()} pts</div>
                  <div className="caption-sm text-muted-foreground">{completedSimulations} simulations</div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}