import { Badge } from "../ui/badge";
import { Clock, CheckCircle, Lock, Play, Heart, Zap, Trophy } from "lucide-react";

interface LessonCardProps {
  title: string;
  learningObjectives: string[];
  duration: string;
  status: "New" | "Started" | "Mastered" | "Locked";
  category?: "probability" | "hypothesis" | "simulation";
  onClick?: () => void;
}

const statusConfig = {
  New: {
    icon: Zap,
    color: "text-green-600",
    bgColor: "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
    label: "Start Learning"
  },
  Started: {
    icon: Heart,
    color: "text-orange-600",
    bgColor: "bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20",
    label: "Continue"
  },
  Mastered: {
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20",
    label: "Mastered"
  },
  Locked: {
    icon: Lock,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Locked"
  }
};

const categoryAccents = {
  probability: "border-l-[#E86AA6]",
  hypothesis: "border-l-[#64E2BA]",
  simulation: "border-l-[#7C9BFF]",
};

export function LessonCard({
  title,
  learningObjectives,
  duration,
  status,
  category = "probability",
  onClick,
}: LessonCardProps) {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  // Soft-lock: keep visual state but do not block clicks
  const isLocked = status === "Locked";

  return (
    <div
      className={`group bg-card border border-border rounded-[16px] p-6 transition-all duration-200 border-l-4 ${categoryAccents[category]} ${
        onClick ? "hover:shadow-[0_4px_12px_rgba(16,23,39,0.04)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.16)] cursor-pointer hover:scale-[1.01]" : ""
      } ${isLocked ? "opacity-80" : ""}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-medium mb-1 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <div className="flex items-center gap-3 text-muted-foreground caption-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">Interactive</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isLocked && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
              Preview
            </span>
          )}
          <Badge
            variant="secondary"
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : -1}
            onClick={(e) => { e.stopPropagation(); if (onClick) onClick(); }}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onClick) { e.preventDefault(); onClick(); } }}
            className={`${statusInfo.bgColor} ${statusInfo.color} border-0 flex items-center gap-1`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </Badge>
        </div>
      </div>
      
      {/* Interactive Learning Features */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
          <Heart className="w-3 h-3 fill-red-500 text-red-500" />
          <span>Hearts & Lives System</span>
        </div>
        
        <div>
          <span className="caption-sm text-muted-foreground font-medium mb-2 block">
            You'll Learn:
          </span>
          <ul className="space-y-1">
            {learningObjectives.slice(0, 3).map((objective, index) => (
              <li key={index} className="caption-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="leading-relaxed">{objective}</span>
              </li>
            ))}
            {learningObjectives.length > 3 && (
              <li className="caption-sm text-muted-foreground italic">
                +{learningObjectives.length - 3} more concepts
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
