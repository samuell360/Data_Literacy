import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';

interface CelebrationProps {
  show: boolean;
  onComplete: () => void;
  xpEarned?: number;
  title?: string;
}

export function Celebration({ show, onComplete, xpEarned = 20, title = "Lesson Complete!" }: CelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 flex items-center justify-center"
      >
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -100, 
                  x: Math.random() * window.innerWidth,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{ 
                  y: window.innerHeight + 100,
                  rotate: 360,
                  opacity: 0
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2
                }}
                className={`absolute w-3 h-3 ${
                  ['bg-yellow-300', 'bg-pink-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300'][i % 5]
                } rounded-full`}
              />
            ))}
          </div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            delay: 0.2
          }}
          className="text-center text-white z-10"
        >
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="mb-6"
          >
            <Trophy className="w-24 h-24 mx-auto text-yellow-200" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            {title}
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-4 text-2xl font-semibold"
          >
            <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
              <Zap className="w-6 h-6 text-yellow-200" />
              <span>+{xpEarned} XP</span>
            </div>
            
            <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
              <Star className="w-6 h-6 text-yellow-200" />
              <span>Level Up!</span>
            </div>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xl mt-6 opacity-90"
          >
            Great job! Keep up the momentum! 🚀
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
