import React, { useState, useEffect } from "react";
import { AppLayout } from "./components/layout/app-layout";
import { Dashboard } from "./components/screens/dashboard";
import { LearningPath } from "./components/screens/learning-path";
import { SimulationLab } from "./components/screens/simulation-lab";
import { Leaderboard } from "./components/screens/leaderboard";
import { Login } from "./components/screens/login";
import { Signup } from "./components/screens/signup";
import { AvatarSelection } from "./components/screens/avatar-selection";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { authApi, apiClient } from "./services/api";
import type { User } from "./services/api";
import "./learning/reset"; // Import reset utilities
import "./styles/brilliant-design-system.css"; // Import Brilliant.org design system
import { BrilliantDashboard } from "./components/brilliant/BrilliantDashboard";
import { BrilliantLearningPath } from "./components/brilliant/BrilliantLearningPath";
import { BrilliantLessonViewer } from "./components/brilliant/BrilliantLessonViewer";
import { 
  Home, 
  BookOpen, 
  Beaker, 
  Trophy, 
  Palette, 
  Moon, 
  Sun,
  BarChart3
} from "lucide-react";

type Screen = "dashboard" | "learning" | "simulations" | "leaderboard" | "showcase" | "lesson";
type AuthScreen = "login" | "signup";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("showcase");
  const [currentAuthScreen, setCurrentAuthScreen] = useState<AuthScreen>("login");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsAvatarSelection, setNeedsAvatarSelection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openFirstLesson, setOpenFirstLesson] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<any>(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
          setCurrentScreen("dashboard");
        } catch (error) {
          // Token is invalid, clear it silently
          localStorage.removeItem('auth_token');
          apiClient.clearToken();
          console.debug('Auth token invalid, cleared');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);


  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Check if user already has an avatar, if not, show avatar selection
    if (!userData.avatar_url) {
      setNeedsAvatarSelection(true);
    } else {
      setCurrentScreen("dashboard");
    }
  };

  const handleSignup = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    // New users always need to select an avatar
    setNeedsAvatarSelection(true);
  };

  const handleAvatarSelected = (avatar: string) => {
    if (user) {
      // For now, just store locally - later we can save to backend
      setUser({ ...user, avatar_url: avatar });
      setNeedsAvatarSelection(false);
      setCurrentScreen("dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear client-side state regardless of server response
      setUser(null);
      setIsAuthenticated(false);
      setNeedsAvatarSelection(false);
      setCurrentScreen("showcase");
      
      // Clear all user-related data from localStorage
      localStorage.removeItem('auth_token');
      // Clear any other cached user data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('user_') || key.startsWith('progress_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  };

  const handleNavigate = (path: string) => {
    // Simple path-to-screen mapping for now
    // In a real app, this would use React Router
    if (path.startsWith('/worlds')) {
      setCurrentScreen("learning");
    } else if (path.startsWith('/simulations')) {
      setCurrentScreen("simulations");
    } else if (path.startsWith('/leaderboard')) {
      setCurrentScreen("leaderboard");
    } else if (path.startsWith('/progress')) {
      setCurrentScreen("dashboard"); // For now, stay on dashboard
    } else {
      setCurrentScreen("dashboard");
    }
  };

  const handleLessonStart = (lessonId: string) => {
    // Mock lesson data - in real app, this would come from API
    const mockLesson = {
      id: lessonId,
      title: "What is Probability?",
      description: "Understanding the fundamental concept of probability",
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice' as const,
          question: 'What is the probability of flipping a fair coin and getting heads?',
          options: ['0.25', '0.5', '0.75', '1.0'],
          correctAnswer: '0.5',
          explanation: 'A fair coin has two equally likely outcomes: heads or tails. The probability of getting heads is 1/2 = 0.5.',
          difficulty: 'easy' as const
        },
        {
          id: 'q2',
          type: 'multiple-choice' as const,
          question: 'If you roll a standard six-sided die, what is the probability of rolling a number greater than 4?',
          options: ['1/6', '1/3', '1/2', '2/3'],
          correctAnswer: '1/3',
          explanation: 'The numbers greater than 4 on a six-sided die are 5 and 6. So there are 2 favorable outcomes out of 6 total outcomes, giving us 2/6 = 1/3.',
          difficulty: 'medium' as const
        }
      ],
      estimatedTime: 15,
      xpReward: 50
    };
    setCurrentLesson(mockLesson);
    setCurrentScreen("lesson");
  };

  const handleLessonComplete = (score: number, timeSpent: number) => {
    console.log(`Lesson completed with score: ${score}, time: ${timeSpent}s`);
    setCurrentLesson(null);
    setCurrentScreen("learning");
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <BrilliantDashboard />;
      case "learning":
        return <BrilliantLearningPath onLessonStart={handleLessonStart} onBack={() => setCurrentScreen("dashboard")} />;
      case "lesson":
        return currentLesson ? (
          <BrilliantLessonViewer 
            lesson={currentLesson} 
            onComplete={handleLessonComplete}
            onBack={() => setCurrentScreen("learning")}
          />
        ) : null;
      case "simulations":
        return <SimulationLab />;
      case "leaderboard":
        return <Leaderboard />;
      case "showcase":
      default:
        return <DesignShowcase />;
    }
  };

  const DesignShowcase = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h1 className="display-xl mb-4">StatLearn UI Kit</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A comprehensive design system for statistics learning platforms. Featuring premium editorial design, 
          layered glass cards, and a complete component library with light/dark mode support.
        </p>
      </div>

      {/* Design Tokens */}
      <Card className="p-8">
        <h2 className="display-md mb-6">Design System</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Typography */}
          <div>
            <h3 className="font-semibold mb-4">Typography Scale</h3>
            <div className="space-y-4">
              <div className="display-xl">Display XL (48px)</div>
              <div className="display-lg">Display Large (36px)</div>
              <div className="display-md">Display Medium (30px)</div>
              <h1>Heading 1 (24px)</h1>
              <h2>Heading 2 (20px)</h2>
              <p>Body Text (16px) - Inter Regular with 1.6 line height for optimal readability</p>
              <div className="caption-lg">Caption Large (14px)</div>
              <div className="caption-sm">Caption Small (12px)</div>
              <code className="font-mono">Code (JetBrains Mono)</code>
            </div>
          </div>
          
          {/* Colors */}
          <div>
            <h3 className="font-semibold mb-4">Color Palette</h3>
            <div className="space-y-4">
              <div>
                <div className="caption-sm text-muted-foreground mb-2">Accent Colors</div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <div className="w-full h-12 bg-[#E86AA6] rounded-lg"></div>
                    <div className="caption-sm">Probability</div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-12 bg-[#64E2BA] rounded-lg"></div>
                    <div className="caption-sm">Hypothesis</div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-12 bg-[#7C9BFF] rounded-lg"></div>
                    <div className="caption-sm">Simulation</div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-12 bg-[#3B82F6] rounded-lg"></div>
                    <div className="caption-sm">Primary</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="caption-sm text-muted-foreground mb-2">Status Colors</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <div className="w-full h-8 bg-[#10B981] rounded-lg"></div>
                    <div className="caption-sm">Success</div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-8 bg-[#F59E0B] rounded-lg"></div>
                    <div className="caption-sm">Warning</div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-8 bg-[#EF4444] rounded-lg"></div>
                    <div className="caption-sm">Error</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Screen Navigation */}
      <Card className="p-8">
        <h2 className="display-md mb-6">Screen Showcase</h2>
        <p className="text-muted-foreground mb-6">
          Explore the complete learning platform with interactive screens and components.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`brilliant-card-interactive flex flex-col items-center gap-3 p-6 ${
              currentScreen === "dashboard" ? 'border-2' : ''
            }`}
            style={{ 
              borderColor: currentScreen === "dashboard" ? 'var(--brilliant-primary)' : 'transparent'
            }}
            onClick={() => setCurrentScreen("dashboard")}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: currentScreen === "dashboard" ? 'var(--brilliant-primary)' : 'var(--brilliant-gray-200)',
                color: currentScreen === "dashboard" ? 'var(--brilliant-gray-800)' : 'var(--brilliant-gray-600)'
              }}
            >
              <Home className="w-6 h-6" />
            </div>
            <span className="brilliant-heading-sm">Dashboard</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`brilliant-card-interactive flex flex-col items-center gap-3 p-6 ${
              currentScreen === "learning" ? 'border-2' : ''
            }`}
            style={{ 
              borderColor: currentScreen === "learning" ? 'var(--brilliant-probability)' : 'transparent'
            }}
            onClick={() => setCurrentScreen("learning")}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: currentScreen === "learning" ? 'var(--brilliant-probability)' : 'var(--brilliant-gray-200)',
                color: 'white'
              }}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="brilliant-heading-sm">Learning Path</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`brilliant-card-interactive flex flex-col items-center gap-3 p-6 ${
              currentScreen === "simulations" ? 'border-2' : ''
            }`}
            style={{ 
              borderColor: currentScreen === "simulations" ? 'var(--brilliant-simulation)' : 'transparent'
            }}
            onClick={() => setCurrentScreen("simulations")}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: currentScreen === "simulations" ? 'var(--brilliant-simulation)' : 'var(--brilliant-gray-200)',
                color: 'white'
              }}
            >
              <Beaker className="w-6 h-6" />
            </div>
            <span className="brilliant-heading-sm">Simulation Lab</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`brilliant-card-interactive flex flex-col items-center gap-3 p-6 ${
              currentScreen === "leaderboard" ? 'border-2' : ''
            }`}
            style={{ 
              borderColor: currentScreen === "leaderboard" ? 'var(--brilliant-hypothesis)' : 'transparent'
            }}
            onClick={() => setCurrentScreen("leaderboard")}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: currentScreen === "leaderboard" ? 'var(--brilliant-hypothesis)' : 'var(--brilliant-gray-200)',
                color: 'white'
              }}
            >
              <Trophy className="w-6 h-6" />
            </div>
            <span className="brilliant-heading-sm">Leaderboard</span>
          </motion.button>
        </div>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-semibold mb-2">Token-Driven Design</h4>
          <p className="caption-lg text-muted-foreground">
            Consistent 8px spacing system, semantic color tokens, and responsive typography scale
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-semibold mb-2">Interactive Components</h4>
          <p className="caption-lg text-muted-foreground">
            Simulation panels, question cards, gamification elements, and data visualization
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Moon className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-semibold mb-2">Accessibility First</h4>
          <p className="caption-lg text-muted-foreground">
            WCAG AA compliant, reduced motion support, and comprehensive focus management
          </p>
        </Card>
      </div>

      {/* Actions */}
      <div className="text-center space-y-4">
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={toggleDarkMode}
            className="flex items-center gap-2"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </Button>
          
          {isAuthenticated && (
            <>
              <Button
                onClick={() => setCurrentScreen("dashboard")}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Button>
              
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
          
          {!isAuthenticated && (
            <Button
              onClick={() => setCurrentAuthScreen("login")}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div className="caption-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  // Show authentication screens if not authenticated
  if (!isAuthenticated) {
    if (currentAuthScreen === "login") {
      return (
        <Login 
          onLogin={handleLogin}
          onSwitchToSignup={() => setCurrentAuthScreen("signup")}
        />
      );
    } else {
      return (
        <Signup 
          onSignup={handleSignup}
          onSwitchToLogin={() => setCurrentAuthScreen("login")}
        />
      );
    }
  }

  // Show avatar selection if user needs to select an avatar
  if (needsAvatarSelection && user) {
    return (
      <AvatarSelection 
        onAvatarSelected={handleAvatarSelected}
        userName={user.full_name || user.username}
      />
    );
  }

  // Show showcase mode if selected
  if (currentScreen === "showcase") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto p-6">
          <DesignShowcase />
        </div>
      </div>
    );
  }

  // User progress is now handled by individual components

  // Show main application
  return (
    <AppLayout 
      currentPage={currentScreen} 
      user={user}
      onNavigate={(page) => setCurrentScreen(page as Screen)}
      onLogout={handleLogout}
    >
      {renderCurrentScreen()}
    </AppLayout>
  );
}
