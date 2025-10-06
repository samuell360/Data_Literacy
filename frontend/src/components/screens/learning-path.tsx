import React from "react";
import { LessonCard } from "../stats-ui/lesson-card";
import { QuestionCard } from "../stats-ui/question-card";
import { DuolingoQuiz } from "../stats-ui/duolingo-quiz";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  BookOpen, 
  Target,
  Play,
  ArrowLeft,
  Zap,
  Heart,
  Brain
} from "lucide-react";
import { progressApi, contentApi } from "../../services/api";
import { FlowLessonViewer } from "../../learning/ui/FlowLessonViewer";
import { sortLessons, getFirstLesson } from "../../utils/lessonOrder";
import { getNextLessonForContinue, getLessonDisplayStatus, type LessonWithStatus } from "../../utils/nextLesson";
import { getNextLessonToContinue, getLessonsProgressSummary } from "../../learning/continue";
import { canAdvanceToNextLesson } from "../../learning/progress";

type LearningPathProps = { 
  onBack?: () => void;
  // If true, open the first lesson automatically after load
  defaultOpen?: boolean;
  // Callback to reset the defaultOpen trigger in the parent
  onDefaultOpenConsumed?: () => void;
};

export function LearningPath({ onBack, defaultOpen, onDefaultOpenConsumed }: LearningPathProps) {
  // Real lessons from backend with proper typing
  const [lessons, setLessons] = useState<LessonWithStatus[]>([]);
  const [worldId, setWorldId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [activeLessonLocked, setActiveLessonLocked] = useState<boolean>(false);
  const [activeLessonSlug, setActiveLessonSlug] = useState<string>('');
  const [tab, setTab] = useState<string>("lessons");
  const [actionLoading, setActionLoading] = useState(false);

  // Convert lessons to LessonInfo format for new flow
  const lessonInfos = useMemo(() => lessons.map(lesson => ({
    lesson_id: lesson.lesson_id,
    slug: lesson.slug || `lesson-${lesson.lesson_id}`,
    title: lesson.title || 'Untitled Lesson',
    order: lesson.order,
    order_index: lesson.order_index,
    status: lesson.status,
    locked: lesson.locked
  })), [lessons]);
  const [viewerOpen, setViewerOpen] = useState(false);
  // Using new flow exclusively - old flow removed

  // New flow system - structured learning path

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Discover the Probability world dynamically
        const worlds = await contentApi.getWorlds();
        const probWorld = worlds.find(w => w.title.toLowerCase().includes('probability world')) || worlds.find(w => w.title.toLowerCase().includes('probability')) || worlds[0];
        const wid = probWorld?.id;
        if (wid) setWorldId(wid);
        let data = await contentApi.getLessons(wid);
        
        // Apply proper lesson ordering
        const sortedLessons = sortLessons(data || []);
        if (mounted) {
          setLessons(sortedLessons);
          
          // Get the next lesson for Continue Learning button
          const nextLesson = getNextLessonForContinue(sortedLessons);
          setActiveLessonId(nextLesson?.lesson_id ?? null);
          
          // Auto-open first lesson if requested
          if (defaultOpen && nextLesson) {
            const locked = nextLesson.locked === true;
            setActiveLessonLocked(locked);
            setViewerOpen(true);
            onDefaultOpenConsumed?.();
          }
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load lessons');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [defaultOpen, onDefaultOpenConsumed]);

  // Mock quiz data
  const sampleQuiz = [
    {
      id: "1",
      type: "multiple-choice" as const,
      question: "A bag contains 5 red balls and 3 blue balls. If you draw 2 balls without replacement, what is the probability that both balls are red?",
      options: ["5/14", "10/28", "5/16", "25/64"],
      correctAnswer: "5/14",
      explanation: "First draw: 5/8 chance of red. Second draw: 4/7 chance of red (4 red balls left out of 7 total). Multiply: (5/8) � (4/7) = 20/56 = 5/14",
      points: 10,
      difficulty: "medium" as const,
    },
    {
      id: "2", 
      type: "multiple-choice" as const,
      question: "What is the probability of getting exactly 2 heads when flipping a fair coin 3 times?",
      options: ["1/4", "3/8", "1/2", "5/8"],
      correctAnswer: "3/8",
      explanation: "There are 8 total outcomes (2�). The ways to get exactly 2 heads are: HHT, HTH, THH. So 3 favorable outcomes out of 8 total = 3/8",
      points: 8,
      difficulty: "easy" as const,
    },
    {
      id: "3",
      type: "multiple-choice" as const, 
      question: "If P(A) = 0.6 and P(B) = 0.4, and A and B are independent events, what is P(A n B)?",
      options: ["0.24", "0.10", "1.0", "0.4"],
      correctAnswer: "0.24",
      explanation: "For independent events, P(A n B) = P(A) � P(B) = 0.6 � 0.4 = 0.24",
      points: 12,
      difficulty: "hard" as const,
    }
  ];

  const reloadLessons = async () => {
    try {
      const data = await contentApi.getLessons(worldId ?? undefined);
      const sortedLessons = sortLessons(data || []);
      setLessons(sortedLessons);
      
      // Update active lesson if needed
      const nextLesson = getNextLessonForContinue(sortedLessons);
      setActiveLessonId(nextLesson?.lesson_id ?? null);
    } catch (e) {
      console.error('Failed to refresh lessons', e);
    }
  };

  const startOrContinue = async (lessonId: number) => {
    try {
      setActionLoading(true);
      await progressApi.startLesson(lessonId);
      setActiveLessonId(lessonId);
      await reloadLessons();
      setTab("lessons");
    } catch (e) {
      console.error('Failed to start lesson', e);
    } finally {
      setActionLoading(false);
    }
  };

  const counts = useMemo(() => {
    const total = lessons.length || 1;
    const completed = lessons.filter(l => l.status === 'COMPLETED' || l.status === 'MASTERED').length;
    const started = lessons.filter(l => l.status === 'STARTED').length;
    const remaining = Math.max(0, (lessons.length - completed - started));
    const percent = Math.round((completed / total) * 100);
    return { total, completed, started, remaining, percent };
  }, [lessons]);

  return (
    <>
    <div className="space-y-8">
      {loading && (
        <Card className="p-6"><div className="caption-lg text-muted-foreground">Loading learning path�</div></Card>
      )}
      {error && (
        <Card className="p-6"><div className="caption-lg text-red-600">{error}</div></Card>
      )}
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Worlds
          </Button>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-950/20 dark:to-blue-950/20 rounded-[24px] p-8 border border-pink-200/50 dark:border-pink-800/50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="bg-[#E86AA6]/10 text-[#E86AA6] border-[#E86AA6]/20">
                Probability
              </Badge>
              <Badge variant="outline">Beginner</Badge>
            </div>
            <h1 className="display-lg mb-4">Probability Foundations</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Master the fundamentals of probability theory, from basic concepts to advanced distributions. 
              Build a solid foundation for statistical inference and data analysis.
            </p>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>6-8 hours total</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>2,340 students</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.8 (156 reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted-foreground/20"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.round(2 * Math.PI * 28 * (counts.percent / 100))} 176`}
                    className="text-[#E86AA6]"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                  {counts.percent}%
                </span>
              </div>
            </div>
            <p className="caption-sm text-muted-foreground">Progress</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button className="flex items-center gap-2" disabled={actionLoading} onClick={async () => {
            try {
              setActionLoading(true);
              // Use new flow logic to determine next step
              const nextToContinue = getNextLessonToContinue(lessonInfos);
              
              if (!nextToContinue) {
                console.error('No lessons available to continue');
                return;
              }
              
              // Set active lesson and open viewer at the correct step
              setActiveLessonId(nextToContinue.lesson.lesson_id);
              setActiveLessonSlug(nextToContinue.lesson.slug || `lesson-${nextToContinue.lesson.lesson_id}`);
              setActiveLessonLocked(nextToContinue.lesson.locked === true);
              setViewerOpen(true);
              
              // Start lesson tracking if not locked
              if (!nextToContinue.lesson.locked) {
                await startOrContinue(nextToContinue.lesson.lesson_id);
              }
            } catch (e) {
              console.error('Failed to continue learning', e);
            } finally {
              setActionLoading(false);
            }
          }}>
            <Play className="w-4 h-4" />
            {actionLoading ? 'Loading�' : 'Continue Learning'}
          </Button>
          <Button variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:from-green-100 hover:to-blue-100" onClick={() => setTab('practice')}>
            <Target className="w-4 h-4 mr-2" />
            Fun Quizzes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lessons">Lessons ({counts.total})</TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-6">
          {/* Progress Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Learning Progress</h3>
              <span className="caption-sm text-muted-foreground">{counts.completed} of {counts.total} lessons completed</span>
            </div>
            <Progress value={counts.percent} className="mb-4" />
            <div className="grid grid-cols-3 gap-4 caption-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-muted-foreground">Completed</span>
                <div className="font-medium">{counts.completed} lesson{counts.completed === 1 ? '' : 's'}</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Play className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-muted-foreground">In Progress</span>
                <div className="font-medium">{counts.started} lesson{counts.started === 1 ? '' : 's'}</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">Remaining</span>
                <div className="font-medium">{counts.remaining} lesson{counts.remaining === 1 ? '' : 's'}</div>
              </div>
            </div>
          </Card>

          {/* Lesson List */}
          <div className="space-y-4">
            {lessons.map((lesson, index) => {
              const displayStatus = getLessonDisplayStatus(lesson);
              return (
                <React.Fragment key={lesson.lesson_id || index}>
                  <LessonCard
                    title={lesson.title}
                    learningObjectives={["Objective 1", "Objective 2", "Objective 3"]}
                    duration={`${lesson.estimated_minutes} minutes`}
                    status={displayStatus}
                    category="probability"
                    onClick={() => { 
                      setActiveLessonId(lesson.lesson_id);
                      setActiveLessonSlug(lesson.slug || `lesson-${lesson.lesson_id}`);
                      setActiveLessonLocked(lesson.locked === true);
                      setViewerOpen(true);
                    }}
                  />
                </React.Fragment>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          {/* Fun Quiz Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="display-md mb-2">Fun Quizzes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Test your knowledge with interactive, gamified quizzes! Earn points, maintain your streak, and master probability concepts in a fun way.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <span className="font-semibold text-red-600">5</span>
              </div>
              <p className="caption-sm text-muted-foreground">Hearts</p>
            </Card>

            <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-orange-600">12</span>
              </div>
              <p className="caption-sm text-muted-foreground">Day Streak</p>
            </Card>

            <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-green-500 fill-green-500" />
                <span className="font-semibold text-green-600">1,240</span>
              </div>
              <p className="caption-sm text-muted-foreground">Total Points</p>
            </Card>

            <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-blue-600">87%</span>
              </div>
              <p className="caption-sm text-muted-foreground">Accuracy</p>
            </Card>
          </div>

      {/* Interactive Quiz */}
          <DuolingoQuiz 
            title="Probability Foundations Quiz"
            questions={sampleQuiz}
            totalHearts={5}
            streakCount={12}
            onComplete={async (score, hearts) => {
              try {
                const useId = activeLessonId ?? (lessons[0]?.lesson_id || 1);
                await progressApi.completeLesson(useId, score, 120);
                await reloadLessons();
                setTab('lessons');
              } catch (e) {
                console.error('Failed to submit progress', e);
              }
            }}
          />

          {/* Quiz Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800" onClick={() => activeLessonId && startOrContinue(activeLessonId)}>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-400">Quick Practice</h4>
              <p className="caption-lg text-muted-foreground mb-4">5 questions - 2 minutes - Easy level</p>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                +25 XP
              </Badge>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800" onClick={() => setActiveLessonId((lessons.find(l => l.status==='STARTED') || lessons[0])?.lesson_id || null)}>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-400">Challenge Mode</h4>
              <p className="caption-lg text-muted-foreground mb-4">10 questions - 5 minutes - Hard level</p>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
                +50 XP
              </Badge>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-200 dark:border-green-800" onClick={() => onBack?.()}>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-green-600 fill-green-600" />
              </div>
              <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">Review Mistakes</h4>
              <p className="caption-lg text-muted-foreground mb-4">Focus on problem areas</p>
              <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                +15 XP
              </Badge>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Projects Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Apply your knowledge with real-world probability projects and case studies.
            </p>
            <Button variant="outline">Get Notified</Button>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-medium mb-4">Quick Reference</h4>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="caption-lg font-medium">Basic Probability Formula</h5>
                  <code className="caption-sm font-mono text-muted-foreground">
                    P(A) = Number of favorable outcomes / Total number of outcomes
                  </code>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="caption-lg font-medium">Conditional Probability</h5>
                  <code className="caption-sm font-mono text-muted-foreground">
                    P(A|B) = P(A n B) / P(B)
                  </code>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="caption-lg font-medium">Bayes' Theorem</h5>
                  <code className="caption-sm font-mono text-muted-foreground">
                    P(A|B) = P(B|A) � P(A) / P(B)
                  </code>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-medium mb-4">Additional Resources</h4>
              <div className="space-y-3">
                <a href="#" className="block p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                  <h5 className="caption-lg font-medium">Probability Cheat Sheet</h5>
                  <p className="caption-sm text-muted-foreground">
                    Essential formulas and concepts
                  </p>
                </a>
                <a href="#" className="block p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                  <h5 className="caption-lg font-medium">Interactive Visualizations</h5>
                  <p className="caption-sm text-muted-foreground">
                    Explore probability concepts visually
                  </p>
                </a>
                <a href="#" className="block p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                  <h5 className="caption-lg font-medium">Practice Problem Set</h5>
                  <p className="caption-sm text-muted-foreground">
                    Additional problems for practice
                  </p>
                </a>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    <FlowLessonViewer
      lessonId={activeLessonId || 0}
      lessonSlug={activeLessonSlug}
      lessonTitle={lessons.find(l => l.lesson_id === activeLessonId)?.title || 'Lesson'}
      open={viewerOpen}
      onClose={() => setViewerOpen(false)}
      onCompleted={async () => { await reloadLessons(); }}
      allLessons={lessonInfos}
    />
  </>
  );
}

