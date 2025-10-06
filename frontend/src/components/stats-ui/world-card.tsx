import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Lock, Clock, Users } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface WorldCardProps {
  title: string;
  description: string;
  image?: string;
  progress?: number;
  duration?: string;
  participants?: number;
  isLocked?: boolean;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  category?: "probability" | "hypothesis" | "simulation";
  onClick?: () => void;
}

const categoryColors = {
  probability: "bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-950/20 dark:to-blue-950/20",
  hypothesis: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
  simulation: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
};

const categoryAccents = {
  probability: "text-[#E86AA6]",
  hypothesis: "text-[#64E2BA]",
  simulation: "text-[#7C9BFF]",
};

export function WorldCard({
  title,
  description,
  image,
  progress = 0,
  duration,
  participants,
  isLocked = false,
  difficulty = "Beginner",
  category = "probability",
  onClick,
}: WorldCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[24px] bg-card border border-border shadow-[0_8px_28px_rgba(16,23,39,0.08)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.24)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(16,23,39,0.12)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.32)] ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {/* Header Image with Gradient Overlay */}
      <div className={`relative h-48 ${categoryColors[category]}`}>
        {image && (
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Lock Ribbon */}
        {isLocked && (
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-2">
            <Lock className="w-3 h-3" />
            <span className="caption-sm">Locked</span>
          </div>
        )}
        
        {/* Progress Ring */}
        {!isLocked && progress > 0 && (
          <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 0.88} 88`}
                  className={categoryAccents[category]}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center caption-sm font-medium">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        )}
        
        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between text-white">
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/20">
              {difficulty}
            </Badge>
            <div className="flex items-center gap-4 caption-sm">
              {duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{duration}</span>
                </div>
              )}
              {participants && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{participants.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground caption-lg leading-relaxed">
          {description}
        </p>
        
        {/* Progress Bar */}
        {!isLocked && progress > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="caption-sm text-muted-foreground">Progress</span>
              <span className="caption-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>
    </div>
  );
}