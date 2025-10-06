import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface ProfessionalStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period?: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "probability" | "hypothesis" | "simulation" | "regression";
  trend?: number[]; // For mini chart
  additionalMetric?: {
    label: string;
    value: string | number;
  };
}

const variantStyles = {
  default: {
    gradient: "bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20",
    border: "border-gray-200 dark:border-gray-800",
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    accentColor: "text-gray-600",
  },
  regression: {
    gradient: "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
    border: "border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    accentColor: "text-purple-600",
  },
  probability: {
    gradient: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
    border: "border-pink-200 dark:border-pink-800",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
    accentColor: "text-pink-600",
  },
  hypothesis: {
    gradient: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    accentColor: "text-emerald-600",
  },
  simulation: {
    gradient: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    accentColor: "text-blue-600",
  },
};

const changeStyles = {
  increase: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  decrease: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  neutral: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
};

export function ProfessionalStatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  variant = "default",
  trend,
  additionalMetric,
}: ProfessionalStatCardProps) {
  const styles = variantStyles[variant] || variantStyles.default;
  
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

  const renderMiniChart = () => {
    if (!trend || trend.length === 0) return null;

    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;

    return (
      <div className="flex items-end gap-1 h-12 mt-4">
        {trend.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className={`flex-1 ${styles.iconBg} rounded-sm opacity-60 transition-all hover:opacity-100`}
              style={{ 
                height: `${Math.max(height, 8)}%`,
                minHeight: '2px'
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Card className={`${styles.gradient} ${styles.border} p-6 hover:shadow-lg transition-all duration-200 relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-current transform translate-x-8 -translate-y-8" />
      </div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="caption-lg font-medium text-muted-foreground mb-1">
              {title}
            </h3>
            {subtitle && (
              <p className="caption-sm text-muted-foreground opacity-75">
                {subtitle}
              </p>
            )}
          </div>
          
          {Icon && (
            <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
              <Icon className={`w-6 h-6 ${styles.iconColor}`} />
            </div>
          )}
        </div>

        {/* Main Value */}
        <div className="mb-4">
          <div className={`text-3xl font-bold leading-none ${styles.accentColor} mb-2`}>
            {value}
          </div>
          
          {/* Change Indicator */}
          {change && ChangeIcon && (
            <Badge
              variant="outline"
              className={`${changeStyles[change.type]} font-medium`}
            >
              <ChangeIcon className="w-3 h-3 mr-1" />
              {change.type === "increase" ? "+" : change.type === "decrease" ? "-" : ""}
              {Math.abs(change.value)}%
              {change.period && (
                <span className="ml-1 opacity-75">
                  {change.period}
                </span>
              )}
            </Badge>
          )}
        </div>

        {/* Additional Metric */}
        {additionalMetric && (
          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg mb-4 backdrop-blur-sm">
            <span className="caption-sm text-muted-foreground font-medium">
              {additionalMetric.label}
            </span>
            <span className={`caption-lg font-semibold ${styles.accentColor}`}>
              {additionalMetric.value}
            </span>
          </div>
        )}

        {/* Mini Trend Chart */}
        {renderMiniChart()}
      </div>
    </Card>
  );
}
