/**
 * Duolingo-Style Lesson Viewer
 * 
 * Complete visual overhaul with colored cards, progress bars, interactive elements,
 * and structured layouts matching Duolingo's actual design system.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Target, 
  Lightbulb,
  CheckCircle,
  X,
  Heart
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { initMathJax, renderMath } from '../../utils/mathRenderer';
import { useSlideAnalytics } from '../hooks/useSlideAnalytics';
import { 
  IntroTemplate, 
  ConceptTemplate, 
  ExampleTemplate, 
  TipTemplate,
  PracticeTemplate,
  FormulaTemplate,
  CompletionTemplate
} from './slide-templates';

// Type Definitions
export interface DuolingoSlide {
  id: string;
  type: 'intro' | 'concept' | 'example' | 'practice' | 'tip' | 'formula' | 'completion';
  title: string;
  content: string;
  visual?: string;
  highlight?: string;
}

interface DuolingoLessonViewerProps {
  lessonTitle: string;
  slides: DuolingoSlide[];
  onComplete: () => void;
  onClose?: () => void;
}

/**
 * Duo-style mascot that appears on certain slides
 */
function Mascot({ emotion = 'happy' }: { emotion?: 'happy' | 'thinking' | 'celebrating' }) {
  const emojis = {
    happy: '😊',
    thinking: '🤔',
    celebrating: '🎉'
  };

  return (
    <motion.div
      className="fixed bottom-24 left-8 text-6xl z-50"
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3
      }}
    >
      {emojis[emotion]}
    </motion.div>
  );
}

export function DuolingoLessonViewer({
  lessonTitle,
  slides,
  onComplete,
  onClose
}: DuolingoLessonViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lives] = useState(5); // Hearts/lives system
  const contentRef = useRef<HTMLDivElement>(null);
  const analytics = useSlideAnalytics(lessonTitle);
  
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;
  const progress = ((currentSlide + 1) / slides.length) * 100;
  
  const currentSlideData = slides[currentSlide];

  // Slide transition variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  // Initialize MathJax once
  useEffect(() => {
    initMathJax();
  }, []);

  // Render math when slide changes
  useEffect(() => {
    if (contentRef.current) {
      renderMath(contentRef.current);
    }
  }, [currentSlide]);

  // Track slide views (avoid effect loop by not depending on analytics object)
  useEffect(() => {
    if (currentSlideData) {
      analytics.recordSlideView(currentSlideData.id);
    }
  }, [currentSlide, currentSlideData?.id]);

  // Navigation handlers
  const handleNext = () => {
    setDirection(1);
    if (isLastSlide) {
      const totalTime = analytics.getTotalTimeSpent();
      const avgTime = analytics.getAverageTimePerSlide();
      console.log(`Lesson completed in ${totalTime}s, avg ${avgTime}s per slide`);
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLastSlide) {
        handleNext();
      }
      if (e.key === 'ArrowLeft' && !isFirstSlide) {
        handleBack();
      }
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isLastSlide, isFirstSlide, onClose]);

  // Render slide using appropriate template
  const renderSlideTemplate = () => {
    if (!currentSlideData) return null;

    const templateProps = {
      content: currentSlideData.content,
      visual: currentSlideData.visual,
      highlight: currentSlideData.highlight
    };

    switch (currentSlideData.type) {
      case 'intro':
        return <IntroTemplate {...templateProps} />;
      case 'concept':
        return <ConceptTemplate {...templateProps} />;
      case 'example':
        return <ExampleTemplate {...templateProps} />;
      case 'tip':
        return <TipTemplate {...templateProps} />;
      case 'practice':
        return <PracticeTemplate {...templateProps} />;
      case 'formula':
        return <FormulaTemplate {...templateProps} />;
      case 'completion':
        return <CompletionTemplate {...templateProps} />;
      default:
        return <ConceptTemplate {...templateProps} />;
    }
  };

  // Validate slides
  if (!slides || slides.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Lesson Content</h2>
          <p className="text-gray-600 mb-6">This lesson doesn't have any slides available.</p>
          {onClose && <Button onClick={onClose}>Back</Button>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Enhanced Progress Header */}
      <div className="bg-white shadow-md border-b-4 border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* Top Row: Close button + Hearts */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            
            {/* Hearts/Lives Display */}
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ delay: i * 0.1 }}
                >
                  {i < lives ? (
                    <Heart className="w-7 h-7 fill-red-500 text-red-500" />
                  ) : (
                    <Heart className="w-7 h-7 text-gray-300" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            
            {/* Progress Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">
                {currentSlide + 1} / {slides.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container - Page scroll (no inner scroll) */}
      <div className="flex-1 flex items-start justify-center p-6 py-12">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-3xl shadow-2xl">
            <div className="p-8 md:p-12">
              {/* Render slide using appropriate template */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="min-h-[500px]"
                >
                  {renderSlideTemplate()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Duolingo-Style Footer */}
      <div className="bg-white border-t-4 border-gray-200 shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Skip Button (left) */}
            {currentSlide > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-gray-600 font-bold hover:text-gray-800 transition"
              >
                ← BACK
              </button>
            )}
            {currentSlide === 0 && <div />}

            {/* Center: Slide Dots */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 bg-green-500'
                      : index < currentSlide
                      ? 'w-3 bg-green-500'
                      : 'w-3 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Continue Button (right) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className={`px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-lg transition ${
                isLastSlide
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-r from-green-400 to-blue-500'
              }`}
            >
              {isLastSlide ? 'FINISH' : 'CONTINUE'} →
            </motion.button>
          </div>
        </div>
      </div>

      {/* Show mascot on intro and completion slides */}
      {currentSlideData?.type === 'intro' && <Mascot emotion="happy" />}
      {currentSlideData?.type === 'completion' && <Mascot emotion="celebrating" />}
    </div>
  );
}