import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period?: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "probability" | "hypothesis" | "simulation" | "regression";
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

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
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

  const styleClass = variantStyles[variant] || variantStyles.default;
  return (
    <div className={`bg-card border rounded-[16px] p-6 ${styleClass} shadow-[0_2px_8px_rgba(16,23,39,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.12)]`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="caption-lg text-muted-foreground font-medium">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
      
      {/* Value */}
      <div className="mb-2">
        <span className="text-[2rem] font-semibold leading-none text-foreground">
          {value}
        </span>
      </div>
      
      {/* Change Indicator */}
      {change && ChangeIcon && (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md caption-sm font-medium ${changeStyles[change.type]}`}>
          <ChangeIcon className="w-3 h-3" />
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
    </div>
  );
}
