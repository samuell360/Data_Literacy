import { Zap, Star } from "lucide-react";

interface LevelIndicatorProps {
  level: number;
  currentXP: number;
}

export function LevelIndicator({ level, currentXP }: LevelIndicatorProps) {
  return (
    <div className="flex items-center gap-2 bg-card border rounded-full px-3 py-2 shadow-sm">
      {/* Level Badge */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Star className="w-3 h-3 text-white" />
        </div>
        <span className="caption-lg font-medium text-foreground">
          Lv {level}
        </span>
      </div>
      
      {/* XP Counter */}
      <div className="flex items-center gap-1 pl-2 border-l border-border">
        <Zap className="w-3 h-3 text-primary" />
        <span className="caption-sm text-muted-foreground">
          {currentXP.toLocaleString()}
        </span>
      </div>
    </div>
  );
}