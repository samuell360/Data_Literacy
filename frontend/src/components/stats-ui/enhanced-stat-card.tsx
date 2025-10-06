import { TrendingUp, TrendingDown, Minus, Target, Award, BarChart3 } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period?: string;
  };
  icon?: React.ComponentType<{ className?: string }>; 
  variant?: "default" | "probability" | "hypothesis" | "simulation" | "regression";
  details?: {
    breakdown?: Array<{
      label: string;
      value: number;
      color: string;
    }>;
    recentScores?: number[];
    target?: number;
  };
}

const variantStyles = {
  default: "border-border",
  regression: "border-l-4 border-l-[#A78BFA] bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/10",
  probability: "border-l-4 border-l-[#E86AA6] bg-gradient-to-br from-pink-50/50 to-transparent dark:from-pink-950/10",
  hypothesis: "border-l-4 border-l-[#64E2BA] bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/10", 
  simulation: "border-l-4 border-l-[#7C9BFF] bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/10",
};

const changeStyles = {
  increase: "text-green-600 bg-green-50 dark:bg-green-900/20",
  decrease: "text-red-600 bg-red-50 dark:bg-red-900/20",
  neutral: "text-muted-foreground bg-muted",
};

export function EnhancedStatCard({
  title,
  value,
  change,
  icon: Icon,
  variant = "default",
  details,
}: EnhancedStatCardProps) {
  const getChangeIcon = () => {
    switch (change?.type) {
      case "increase":
        return TrendingUp;
      case "decrease":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const ChangeIcon = change ? getChangeIcon() : null;
  const numericValue = typeof value === "string" ? parseFloat(value.replace("%", "")) : value;
  
  const styleClass = variantStyles[variant] || variantStyles.default;
  return (
    <Card className={`p-8 ${styleClass} shadow-lg hover:shadow-xl transition-all duration-300 bg-card/60 backdrop-blur-sm border border-white/10`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="caption-sm text-muted-foreground">Performance metric</p>
          </div>
        </div>
        
        {details?.target && (
          <Badge variant="secondary" className="bg-muted/50">
            Target: {details.target}%
          </Badge>
        )}
      </div>
      
      {/* Main Value with Animation */}
      <div className="mb-6">
        <div className="flex items-end gap-2">
          <span className="text-[3.5rem] font-bold leading-none text-foreground bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {value}
          </span>
          {typeof value === "string" && value.includes("%") && (
            <div className="mb-3">
              <Award className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>
        
        {/* Progress to Target */}
        {details?.target && typeof numericValue === "number" && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="caption-sm text-muted-foreground">Progress to target</span>
              <span className="caption-sm font-medium text-foreground">
                {Math.round((numericValue / details.target) * 100)}%
              </span>
            </div>
            <Progress 
              value={(numericValue / details.target) * 100} 
              className="h-2"
            />
          </div>
        )}
      </div>
      
      {/* Change Indicator */}
      {change && ChangeIcon && (
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg caption-lg font-medium mb-4 ${changeStyles[change.type]}`}>
          <ChangeIcon className="w-4 h-4" />
          <span>
            {change.type === "increase" ? "+" : change.type === "decrease" ? "-" : ""}
            {Math.abs(change.value)}%
          </span>
          {change.period && (
            <span className="text-muted-foreground">
              {change.period}
            </span>
          )}
        </div>
      )}
      
      {/* Breakdown Details */}
      {details?.breakdown && (
        <div className="space-y-3">
          <div className="caption-sm text-muted-foreground font-medium">Score Breakdown</div>
          {details.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="caption-lg text-foreground">{item.label}</span>
              </div>
              <span className="caption-lg font-medium text-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Recent Scores Trend */}
      {details?.recentScores && details.recentScores.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="caption-sm text-muted-foreground font-medium mb-2">Recent Trend</div>
          <div className="flex items-end gap-1 h-8">
            {details.recentScores.map((score, index) => (
              <div
                key={index}
                className="flex-1 bg-primary/20 rounded-sm"
                style={{ 
                  height: `${(score / 100) * 100}%`,
                  minHeight: '4px'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
