import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, Sparkles, Zap, Heart } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface AvatarSelectionProps {
  onAvatarSelected: (avatar: string) => void;
  userName: string;
}

interface Avatar {
  id: string;
  name: string;
  personality: string;
  imageUrl: string;
  color: string;
  gradient: string;
}

const avatars: Avatar[] = [
  {
    id: "lion",
    name: "Lion",
    personality: "Brave & Leadership",
    imageUrl: "https://images.unsplash.com/photo-1652218740538-871f50a614f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwbGlvbiUyMGZhY2UlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg3MzgzNDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-amber-500 to-orange-500",
    gradient: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
  },
  {
    id: "elephant",
    name: "Elephant",
    personality: "Wise & Loyal",
    imageUrl: "https://images.unsplash.com/photo-1710007362221-dcc737fb7edf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZWxlcGhhbnQlMjBmYWNlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU4NzM4MzUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-gray-500 to-slate-500",
    gradient: "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20"
  },
  {
    id: "fox",
    name: "Fox",
    personality: "Clever & Cunning",
    imageUrl: "https://images.unsplash.com/photo-1753638182474-37a3af427e58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZm94JTIwZmFjZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODczODM1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-orange-500 to-red-500",
    gradient: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
  },
  {
    id: "owl",
    name: "Owl",
    personality: "Wise & Observant",
    imageUrl: "https://images.unsplash.com/photo-1599773230174-91fcd6afc0c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwb3dsJTIwZmFjZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODczODM2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-amber-500 to-yellow-500",
    gradient: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20"
  },
  {
    id: "panda",
    name: "Panda",
    personality: "Calm & Peaceful",
    imageUrl: "https://images.unsplash.com/photo-1685992667739-e4480b21eaa7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGFuZGElMjBmYWNlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU4NzM4MzY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-slate-500 to-gray-500",
    gradient: "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20"
  },
  {
    id: "dolphin",
    name: "Dolphin",
    personality: "Playful & Smart",
    imageUrl: "https://images.unsplash.com/photo-1649621991067-ac6902755ba8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZG9scGhpbiUyMGZhY2UlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg3MzgzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-blue-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
  },
  {
    id: "monkey",
    name: "Monkey",
    personality: "Curious & Energetic",
    imageUrl: "https://images.unsplash.com/photo-1618473466287-08dc7679fe01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwbW9ua2V5JTIwZmFjZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODczODM3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-yellow-500 to-orange-500",
    gradient: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
  },
  {
    id: "wolf",
    name: "Wolf",
    personality: "Independent & Strong",
    imageUrl: "https://images.unsplash.com/photo-1512788741607-b4c448feadaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwd29sZiUyMGZhY2UlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg3MzgzNzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-gray-500 to-blue-500",
    gradient: "bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20"
  },
  {
    id: "cat",
    name: "Cat",
    personality: "Independent & Curious",
    imageUrl: "https://images.unsplash.com/photo-1736114295342-4e85bb418764?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZmFjZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODczODM4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-purple-500 to-pink-500",
    gradient: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
  },
  {
    id: "dog",
    name: "Dog",
    personality: "Loyal & Friendly",
    imageUrl: "https://images.unsplash.com/photo-1721656363860-0f2858d5ca09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZG9nJTIwZmFjZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODczODM4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-yellow-500 to-amber-500",
    gradient: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20"
  },
  {
    id: "penguin",
    name: "Penguin",
    personality: "Social & Determined",
    imageUrl: "https://images.unsplash.com/photo-1729957900265-50b27f1d7499?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGVuZ3VpbiUyMGZhY2UlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg3MzgzOTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-slate-500 to-blue-500",
    gradient: "bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/20"
  },
  {
    id: "rabbit",
    name: "Rabbit",
    personality: "Quick & Gentle",
    imageUrl: "https://images.unsplash.com/photo-1553986641-deec79e48bb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcmFiYml0JTIwZmFjZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODczODM5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "from-pink-500 to-rose-500",
    gradient: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20"
  }
];

export function AvatarSelection({ onAvatarSelected, userName }: AvatarSelectionProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };

  const handleContinue = () => {
    if (selectedAvatar) {
      const avatar = avatars.find(a => a.id === selectedAvatar);
      if (avatar) {
        onAvatarSelected(avatar.imageUrl);
      }
    }
  };

  const selectedAvatarData = avatars.find(a => a.id === selectedAvatar);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8 space-y-4">
          {/* Animated Header */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="display-lg text-foreground">
              Hey {userName}! 🌟
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              <strong>If you were to be an animal, what animal would you be?</strong>
              <br />
              Choose your spirit animal companion for your learning adventure! Each animal has its own unique personality that will represent you throughout the platform.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center">
            <Badge variant="outline" className="px-4 py-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="caption-lg">Step 2 of 2</span>
              </div>
            </Badge>
          </div>
        </div>

        {/* Avatar Grid */}
        <Card className="p-8 bg-white/80 dark:bg-black/20 backdrop-blur-sm border-white/20 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {avatars.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;
              const isHovered = hoveredAvatar === avatar.id;
              
              return (
                <div
                  key={avatar.id}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    isSelected ? 'scale-105' : isHovered ? 'scale-102' : ''
                  }`}
                  onClick={() => handleAvatarSelect(avatar.id)}
                  onMouseEnter={() => setHoveredAvatar(avatar.id)}
                  onMouseLeave={() => setHoveredAvatar(null)}
                >
                  <div className={`
                    ${avatar.gradient}
                    p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden
                    ${isSelected 
                      ? 'border-primary shadow-lg ring-4 ring-primary/20' 
                      : isHovered 
                        ? 'border-primary/50 shadow-md' 
                        : 'border-border hover:border-primary/30'
                    }
                  `}>
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-current transform translate-x-4 -translate-y-4" />
                    </div>
                    
                    {/* Avatar image */}
                    <div className="relative text-center">
                      <div className={`mb-3 transition-transform duration-300 ${
                        isSelected || isHovered ? 'scale-105' : ''
                      }`}>
                        <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-lg">
                          <ImageWithFallback
                            src={avatar.imageUrl}
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Avatar name and personality */}
                      <div className="space-y-1">
                        <h3 className="caption-lg font-medium text-foreground leading-tight">
                          {avatar.name}
                        </h3>
                        <p className="caption-sm text-muted-foreground leading-tight">
                          {avatar.personality}
                        </p>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Hover effect */}
                    {isHovered && !isSelected && (
                      <div className="absolute inset-0 bg-primary/5 rounded-2xl transition-opacity duration-200" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Avatar Preview & Continue Button */}
        <div className="mt-8 text-center space-y-6">
          {selectedAvatarData && (
            <div className="flex justify-center">
              <Card className="p-6 bg-white/80 dark:bg-black/20 backdrop-blur-sm border-white/20 inline-flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                  <ImageWithFallback
                    src={selectedAvatarData.imageUrl}
                    alt={selectedAvatarData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    You're a {selectedAvatarData.name}! <Heart className="w-4 h-4 text-red-500" />
                  </h4>
                  <p className="caption-lg text-muted-foreground">{selectedAvatarData.personality}</p>
                </div>
              </Card>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="bg-white/80 dark:bg-black/20 backdrop-blur-sm"
              onClick={() => setSelectedAvatar(null)}
              disabled={!selectedAvatar}
            >
              Reset Selection
            </Button>
            
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!selectedAvatar}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg"
            >
              {selectedAvatar ? 'Start My Learning Journey' : 'Choose Your Animal'}
              {selectedAvatar && <Sparkles className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          <p className="caption-sm text-muted-foreground max-w-md mx-auto">
            Your spirit animal will represent you in leaderboards, achievements, and throughout your learning journey. 
            Choose the one that speaks to your soul! 🦋
          </p>
        </div>
      </div>
    </div>
  );
}