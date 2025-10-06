import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { ArrowRight, Clock, Target } from "lucide-react";
import { progressApi, contentApi } from "../../services/api";
import type { ProgressSummary, NextStep, World } from "../../services/api";

interface DashboardCTAProps {
  progressSummary?: ProgressSummary | null;
  onNavigate?: (path: string) => void;
}

export function DashboardCTA({ progressSummary, onNavigate }: DashboardCTAProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Check if user has started learning
      const isNew = !progressSummary || 
                   progressSummary.hasStarted === false || 
                   progressSummary.lessonsCompleted === 0;

      if (isNew) {
        // New user - get worlds and navigate to first world/lesson
        const worlds = await contentApi.getWorlds();
        if (worlds?.length > 0) {
          // Navigate to the first world
          onNavigate?.(`/worlds/${worlds[0].id}`);
        } else {
          // Fallback to worlds index
          onNavigate?.('/worlds');
        }
      } else {
        // Returning user - get next step
        const next = await progressApi.getNextStep();
        if (next?.link) {
          onNavigate?.(next.link);
        } else {
          // Fallback - maybe user completed everything, go to worlds
          onNavigate?.('/worlds');
        }
      }
    } catch (error) {
      console.error('Failed to navigate:', error);
      // Fallback navigation
      onNavigate?.('/worlds');
    } finally {
      setLoading(false);
    }
  };

  // Determine button state based on progress
  const isNew = !progressSummary || 
               progressSummary.hasStarted === false || 
               progressSummary.lessonsCompleted === 0;
  
  const buttonLabel = isNew ? 'Start learning' : 'Continue learning';
  const title = isNew ? 'Begin Your Statistics Journey' : 'Continue Learning';
  const description = isNew 
    ? 'Start with the fundamentals of probability and statistics'
    : `Pick up where you left off - ${progressSummary?.lessonsCompleted || 0} lessons completed`;

  // Calculate progress percentage for returning users
  const progressPercentage = progressSummary && progressSummary.totalLessons > 0
    ? (progressSummary.lessonsCompleted / progressSummary.totalLessons) * 100
    : 0;

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">
            {description}
          </p>
          
          {!isNew && progressSummary && (
            <>
              <Progress value={progressPercentage} className="w-48 mb-4" />
              <div className="flex items-center gap-4 caption-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>
                    {progressSummary.lessonsCompleted} of {progressSummary.totalLessons} lessons
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Level {progressSummary.currentLevel}</span>
                </div>
              </div>
            </>
          )}
          
          {isNew && (
            <div className="flex items-center gap-4 caption-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>Start with Probability Basics</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>~8 hours total</span>
              </div>
            </div>
          )}
        </div>
        
        <Button 
          className="flex items-center gap-2" 
          onClick={handleClick}
          disabled={loading}
          aria-label={buttonLabel}
        >
          {loading ? 'Loading...' : buttonLabel}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </Card>
  );
}
