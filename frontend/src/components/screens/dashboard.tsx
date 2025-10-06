import React, { useEffect, useState } from "react";
import { ProfessionalStatCard } from "../stats-ui/professional-stat-card";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Beaker, CheckCircle, Target, Zap } from "lucide-react";
import { progressApi, contentApi } from "../../services/api";
import type { ProgressSummary, World } from "../../services/api";
import { connectSSE } from "../../realtime/sse";

interface DashboardProps {
  onContinueLearning?: () => void;
  onNavigate?: (path: string) => void;
}

export function Dashboard({ onContinueLearning, onNavigate }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [worlds, setWorlds] = useState<World[]>([]);

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      try {
        setLoading(true);
        const [s, w] = await Promise.all([
          progressApi.getProgressSummary().catch(() => null),
          contentApi.getWorlds().catch(() => [] as World[]),
        ]);
        if (!mounted) return;
        setSummary(s);
        setWorlds(w);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Initial fetch
    refresh();

    // Real-time updates via SSE (if authenticated)
    const sse = connectSSE({
      onProgressUpdated: () => {
        // Re-fetch summary/worlds when server pushes updates
        refresh();
      },
    });

    return () => {
      mounted = false;
      sse?.close?.();
    };
  }, []);

  const userStats = {
    lessonsCompleted: summary?.lessonsCompleted ?? 0,
    totalLessons: summary?.totalLessons ?? 0,
    streak: summary?.currentStreak ?? 0,
    avgScore: 0,
  };

  const stats = [
    {
      title: "Lessons Completed",
      value: String(userStats.lessonsCompleted),
      change: { value: 0, type: "neutral" as const, period: "" },
      icon: CheckCircle,
      variant: "probability" as const,
    },
    {
      title: "Simulations Run",
      value: String(0),
      change: { value: 0, type: "neutral" as const, period: "" },
      icon: Beaker,
      variant: "simulation" as const,
    },
    {
      title: "Study Streak",
      value: String(userStats.streak),
      change: { value: 0, type: "neutral" as const, period: "days" },
      icon: Zap,
      variant: "hypothesis" as const,
    },
    {
      title: "Average Score",
      value: `${userStats.avgScore}%`,
      change: { value: 0, type: "neutral" as const, period: "" },
      icon: Target,
      variant: "default" as const,
    },
  ];

  const goWorlds = () => onNavigate?.("/worlds");

  const probabilityWorld = worlds.find(w => w.title.toLowerCase().includes("probability world"))
    || worlds.find(w => w.title.toLowerCase().includes("probability"))
    || worlds[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-md">Welcome back</h1>
          <p className="text-muted-foreground">Track your progress and continue learning.</p>
        </div>
        <Button onClick={onContinueLearning || goWorlds}>Continue Learning</Button>
      </div>

      {loading && (
        <Card className="p-6">
          <div className="caption-lg text-muted-foreground">Loading your dashboard.</div>
        </Card>
      )}
      {error && (
        <Card className="p-6">
          <div className="caption-lg text-red-600">{error}</div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <ProfessionalStatCard
            key={`stat-${i}`}
            title={s.title}
            value={s.value}
            change={s.change}
            icon={s.icon}
            variant={s.variant}
          />
        ))}
      </div>

      {/* Featured World */}
      {probabilityWorld && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{probabilityWorld.title}</h2>
              <p className="text-muted-foreground caption-lg">{probabilityWorld.description}</p>
            </div>
            <Button variant="outline" onClick={goWorlds}>Open</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// Provide default export for resilience with import styles
export default Dashboard;
