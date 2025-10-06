import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  // Scatter as ScatterIcon, // Not available in lucide-react
  BarChart2 as ScatterIcon,
  Activity,
  Target,
  Star,
  Trophy,
  Flame,
  Settings,
  Eye,
  Download,
  Share2
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, PieChart as RechartsPie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface SimulationConfig {
  type: "dice" | "coin" | "cards" | "normal" | "bootstrap" | "hypothesis" | "monte-carlo";
  parameters: Record<string, any>;
  visualization: "line" | "bar" | "scatter" | "pie" | "area" | "histogram";
  speed: number;
  samples: number;
  showAnimation: boolean;
}

interface SimulationResults {
  data: any[];
  statistics: Record<string, number>;
  insights: string[];
  score: number;
  achievements: string[];
}

interface InteractiveSimulationProps {
  onComplete?: (results: SimulationResults) => void;
  onScoreUpdate?: (score: number) => void;
}

export function InteractiveSimulation({ onComplete, onScoreUpdate }: InteractiveSimulationProps) {
  const [config, setConfig] = useState<SimulationConfig>({
    type: "dice",
    parameters: { sides: 6, rolls: 100 },
    visualization: "bar",
    speed: 50,
    samples: 100,
    showAnimation: true
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentSample, setCurrentSample] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<Record<string, number>>({});
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Simulation types with fun descriptions
  const simulationTypes = [
    {
      id: "dice",
      name: "🎲 Dice Roller",
      description: "Roll dice and watch probability come to life!",
      category: "Games",
      difficulty: "Beginner",
      color: "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20",
      borderColor: "border-red-200 dark:border-red-800"
    },
    {
      id: "coin",
      name: "🪙 Coin Flipper",
      description: "Flip coins and discover the law of large numbers!",
      category: "Probability",
      difficulty: "Beginner",
      color: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800"
    },
    {
      id: "cards",
      name: "🃏 Card Draw",
      description: "Draw cards and explore conditional probability!",
      category: "Games",
      difficulty: "Intermediate",
      color: "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    {
      id: "normal",
      name: "📊 Normal Distribution",
      description: "Generate normal distributions and see the bell curve!",
      category: "Distributions",
      difficulty: "Intermediate",
      color: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      id: "bootstrap",
      name: "🔄 Bootstrap Sampling",
      description: "Resample your data and estimate parameters!",
      category: "Inference",
      difficulty: "Advanced",
      color: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      borderColor: "border-green-200 dark:border-green-800"
    },
    {
      id: "hypothesis",
      name: "🔬 Hypothesis Testing",
      description: "Test hypotheses and explore p-values!",
      category: "Testing",
      difficulty: "Advanced",
      color: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
      borderColor: "border-pink-200 dark:border-pink-800"
    },
    {
      id: "monte-carlo",
      name: "🎯 Monte Carlo",
      description: "Use random sampling to solve complex problems!",
      category: "Advanced",
      difficulty: "Expert",
      color: "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20",
      borderColor: "border-violet-200 dark:border-violet-800"
    }
  ];

  const visualizationTypes = [
    { id: "bar", name: "Bar Chart", icon: BarChart3 },
    { id: "line", name: "Line Chart", icon: TrendingUp },
    { id: "area", name: "Area Chart", icon: Activity },
    { id: "scatter", name: "Scatter Plot", icon: Scatter },
    { id: "pie", name: "Pie Chart", icon: PieChart },
  ];

  // Generate sample data based on simulation type
  const generateSampleData = () => {
    const data = [];
    for (let i = 0; i < currentSample; i++) {
      switch (config.type) {
        case "dice":
          data.push({
            x: i + 1,
            value: Math.floor(Math.random() * config.parameters.sides) + 1,
            name: `Roll ${i + 1}`
          });
          break;
        case "coin":
          data.push({
            x: i + 1,
            value: Math.random() > 0.5 ? 1 : 0,
            name: i % 2 === 0 ? "Heads" : "Tails"
          });
          break;
        case "normal":
          // Box-Muller transform for normal distribution
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          data.push({
            x: i + 1,
            value: z0 * config.parameters.stdDev + config.parameters.mean,
            name: `Sample ${i + 1}`
          });
          break;
        default:
          data.push({
            x: i + 1,
            value: Math.random() * 100,
            name: `Sample ${i + 1}`
          });
      }
    }
    return data;
  };

  // Calculate statistics
  const calculateStatistics = (data: any[]): Record<string, number> => {
    if (data.length === 0) return {
      mean: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      samples: 0
    };
    
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      mean: parseFloat(mean.toFixed(3)),
      stdDev: parseFloat(stdDev.toFixed(3)),
      min: parseFloat(min.toFixed(3)),
      max: parseFloat(max.toFixed(3)),
      samples: data.length
    };
  };

  // Animation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && currentSample < config.samples) {
      interval = setInterval(() => {
        setCurrentSample(prev => {
          const newSample = prev + 1;
          const newData = generateSampleData();
          setResults(newData);
          setStatistics(calculateStatistics(newData));
          
          // Calculate score based on samples and complexity
          const newScore = Math.floor(newSample * (config.type === "monte-carlo" ? 5 : config.type === "hypothesis" ? 4 : config.type === "bootstrap" ? 3 : 1));
          setScore(newScore);
          onScoreUpdate?.(newScore);
          
          if (newSample >= config.samples) {
            setIsRunning(false);
            setShowResults(true);
            setStreak(prev => prev + 1);
            
            const results: SimulationResults = {
              data: newData,
              statistics: calculateStatistics(newData),
              insights: generateInsights(newData, config.type),
              score: newScore,
              achievements: generateAchievements(newSample, newScore, streak + 1)
            };
            
            onComplete?.(results);
          }
          
          return newSample;
        });
      }, Math.max(10, 1000 - config.speed * 10));
    }
    
    return () => clearInterval(interval);
  }, [isRunning, currentSample, config, streak]);

  const generateInsights = (data: any[], type: string): string[] => {
    const insights = [];
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    
    switch (type) {
      case "dice":
        insights.push(`Average roll: ${mean.toFixed(2)} (Expected: ${(config.parameters.sides + 1) / 2})`);
        if (data.length > 50) {
          insights.push("🎯 With enough rolls, the average approaches the expected value!");
        }
        break;
      case "coin":
        const heads = values.filter(v => v === 1).length;
        insights.push(`Heads: ${heads}/${data.length} (${(heads/data.length*100).toFixed(1)}%)`);
        if (Math.abs(heads/data.length - 0.5) < 0.1) {
          insights.push("⚖️ Great! Your results are close to the expected 50/50 ratio!");
        }
        break;
      case "normal":
        insights.push(`Your data follows a normal distribution!`);
        if (Math.abs(mean) < 0.5 && data.length > 100) {
          insights.push("📈 Central Limit Theorem in action - your sample mean is close to 0!");
        }
        break;
    }
    
    return insights;
  };

  const generateAchievements = (samples: number, score: number, streak: number): string[] => {
    const achievements = [];
    
    if (samples >= 100) achievements.push("🏆 Century Club - 100+ samples!");
    if (samples >= 1000) achievements.push("🌟 Statistician - 1000+ samples!");
    if (streak >= 5) achievements.push("🔥 On Fire - 5+ simulations in a row!");
    if (score >= 500) achievements.push("💎 High Scorer - 500+ points!");
    
    return achievements;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentSample(0);
    setResults([]);
    setStatistics({});
    setShowResults(false);
    setScore(0);
  };

  const updateConfig = (key: keyof SimulationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    handleReset();
  };

  const renderChart = () => {
    if (results.length === 0) return null;

    const chartProps = {
      data: results,
      width: 500,
      height: 300
    };

    switch (config.visualization) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis dataKey="value" />
              <Tooltip />
              <Scatter dataKey="value" fill="#3B82F6" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const currentSimType = simulationTypes.find(t => t.id === config.type)!;

  return (
    <div className="space-y-6">
      {/* Simulation Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {simulationTypes.map((simType) => (
          <Card 
            key={simType.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              config.type === simType.id 
                ? `${simType.color} ${simType.borderColor} shadow-lg scale-105` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => updateConfig('type', simType.id)}
          >
            <div className="text-center space-y-2">
              <div className="text-2xl mb-2">{simType.name.split(' ')[0]}</div>
              <h4 className="font-semibold text-sm">{simType.name.substring(3)}</h4>
              <p className="caption-sm text-muted-foreground">{simType.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {simType.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {simType.category}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Simulation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="p-6 space-y-6">
          <div className="text-center">
            <div className="text-3xl mb-2">{currentSimType.name.split(' ')[0]}</div>
            <h3 className="font-semibold">{currentSimType.name.substring(3)}</h3>
            <p className="caption-sm text-muted-foreground mt-1">{currentSimType.description}</p>
          </div>

          {/* Score & Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
              <Star className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="font-semibold text-blue-600">{score}</div>
              <div className="caption-sm text-muted-foreground">Score</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <div className="font-semibold text-orange-600">{streak}</div>
              <div className="caption-sm text-muted-foreground">Streak</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="font-semibold text-green-600">{currentSample}</div>
              <div className="caption-sm text-muted-foreground">Samples</div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between caption-sm">
              <span>Progress</span>
              <span>{currentSample}/{config.samples}</span>
            </div>
            <Progress value={(currentSample / config.samples) * 100} className="h-2" />
          </div>

          {/* Parameters */}
          <div className="space-y-4">
            <div>
              <label className="caption-lg font-medium mb-2 block">Sample Size</label>
              <Slider
                value={[config.samples]}
                onValueChange={([value]) => updateConfig('samples', value)}
                max={1000}
                min={10}
                step={10}
                disabled={isRunning}
              />
              <div className="caption-sm text-muted-foreground mt-1">{config.samples} samples</div>
            </div>

            <div>
              <label className="caption-lg font-medium mb-2 block">Speed</label>
              <Slider
                value={[config.speed]}
                onValueChange={([value]) => updateConfig('speed', value)}
                max={100}
                min={1}
                step={1}
              />
              <div className="caption-sm text-muted-foreground mt-1">Speed: {config.speed}%</div>
            </div>

            {config.type === "dice" && (
              <div>
                <label className="caption-lg font-medium mb-2 block">Dice Sides</label>
                <Select value={config.parameters.sides?.toString()} onValueChange={(value) => 
                  updateConfig('parameters', { ...config.parameters, sides: parseInt(value) })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4-sided</SelectItem>
                    <SelectItem value="6">6-sided</SelectItem>
                    <SelectItem value="8">8-sided</SelectItem>
                    <SelectItem value="12">12-sided</SelectItem>
                    <SelectItem value="20">20-sided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="caption-lg font-medium">Animation</label>
              <Switch
                checked={config.showAnimation}
                onCheckedChange={(checked) => updateConfig('showAnimation', checked)}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!isRunning ? (
              <Button onClick={handleStart} className="flex-1 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Start
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" className="flex-1 flex items-center gap-2">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </Card>

        {/* Visualization */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Live Results</h3>
            <div className="flex items-center gap-2">
              {visualizationTypes.map((viz) => (
                <Button
                  key={viz.id}
                  variant={config.visualization === viz.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateConfig('visualization', viz.id)}
                  className="p-2"
                >
                  <viz.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

          <div className="min-h-[300px] flex items-center justify-center">
            {results.length > 0 ? (
              renderChart()
            ) : (
              <div className="text-center text-muted-foreground">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Start the simulation to see live results!</p>
              </div>
            )}
          </div>

          {/* Statistics */}
          {Object.keys(statistics).length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statistics).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-semibold">{typeof value === 'number' ? value.toFixed(3) : value}</div>
                  <div className="caption-sm text-muted-foreground capitalize">{key}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Results Modal/Summary */}
      {showResults && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <div className="text-center mb-6">
            <Trophy className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="display-md text-green-600">Simulation Complete!</h2>
            <p className="text-muted-foreground">Great job! You've completed {config.samples} samples.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{score}</div>
              <div className="caption-lg text-muted-foreground">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{streak}</div>
              <div className="caption-lg text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{config.samples}</div>
              <div className="caption-lg text-muted-foreground">Samples Generated</div>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={handleReset} className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Run Again
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Results
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}