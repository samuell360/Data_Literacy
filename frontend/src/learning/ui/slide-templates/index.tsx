import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lightbulb, Target, Zap, BookOpen, Sparkles } from 'lucide-react';

interface SlideTemplateProps {
  content: string;
  visual?: string;
  highlight?: string;
}

/**
 * Intro Template - Clean welcome with mascot
 */
export function IntroTemplate({ content, visual, highlight }: SlideTemplateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
      {/* Large Mascot/Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-8"
      >
        <div className="text-9xl">{visual || '🎓'}</div>
      </motion.div>

      {/* Title Content */}
      <div 
        className="text-3xl font-bold text-gray-800 max-w-2xl px-4"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Bottom Badge */}
      {highlight && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 px-6 py-3 bg-green-500 text-white rounded-full text-lg font-medium shadow-lg"
        >
          {highlight}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Concept Template - Clean card-based layout
 */
export function ConceptTemplate({ content, visual, highlight }: SlideTemplateProps) {
  return (
    <div className="space-y-6">
      {/* Main Content Card */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl">{visual || '💡'}</div>
          <div className="text-xl font-bold text-gray-800">Key Concept</div>
        </div>
        
        <div 
          className="prose prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Highlight Box */}
      {highlight && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-start gap-4 p-6 bg-green-50 border border-green-200 rounded-2xl"
        >
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <p className="text-lg font-medium text-green-900">{highlight}</p>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Example Template - Clean split screen layout
 */
export function ExampleTemplate({ content, visual, highlight }: SlideTemplateProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: Visual */}
      <div className="flex items-center justify-center bg-green-50 border border-green-200 rounded-3xl p-12 min-h-[400px]">
        <div className="text-center">
          <div className="text-9xl mb-4">{visual || '🎯'}</div>
          <div className="text-green-700 text-2xl font-bold">Example</div>
        </div>
      </div>

      {/* Right: Explanation */}
      <div className="flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div 
            className="prose prose-lg text-gray-700"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {highlight && (
          <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <Target className="w-6 h-6 text-green-600" />
            <p className="font-medium text-green-900">{highlight}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Tip Template - Clean callout style
 */
export function TipTemplate({ content, visual, highlight }: SlideTemplateProps) {
  return (
    <div className="space-y-6">
      {/* Animated Icon */}
      <motion.div
        animate={{ 
          rotate: [0, -10, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}
        className="flex justify-center"
      >
        <div className="text-8xl">{visual || '💡'}</div>
      </motion.div>

      {/* Main Tip Card */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-8 h-8 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-800">Pro Tip</h3>
        </div>
        
        <div 
          className="prose prose-lg text-gray-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Bottom emphasis */}
      {highlight && (
        <div className="text-center p-6 bg-green-50 border border-green-200 rounded-2xl">
          <p className="text-xl font-bold text-green-900">{highlight}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Practice Template - Interactive quiz-like appearance
 */
export function PracticeTemplate({ content, visual }: SlideTemplateProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6" />
          <span className="text-xl font-bold">Quick Practice</span>
        </div>
        <div className="text-4xl">{visual || '🎮'}</div>
      </div>

      {/* Content Card */}
      <div className="bg-white border-4 border-blue-200 rounded-3xl p-8 shadow-xl">
        <div 
          className="prose prose-lg"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

/**
 * Formula Template - Special template for mathematical content
 */
export function FormulaTemplate({ content, visual, highlight }: SlideTemplateProps) {
  return (
    <div className="space-y-6">
      {/* Math Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white">
        <div className="text-4xl">{visual || '🧮'}</div>
        <div className="text-xl font-bold">Formula</div>
      </div>

      {/* Formula Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-4 border-indigo-200 rounded-3xl p-8">
        <div 
          className="prose prose-lg text-center"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Explanation Box */}
      {highlight && (
        <div className="flex items-start gap-4 p-6 bg-indigo-50 border-3 border-indigo-300 rounded-2xl">
          <Sparkles className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
          <p className="text-lg font-medium text-indigo-900">{highlight}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Completion Template - Celebration style
 */
export function CompletionTemplate({ content, visual, highlight }: SlideTemplateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
      {/* Celebration Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 200,
          delay: 0.2
        }}
        className="mb-8"
      >
        <div className="text-9xl">{visual || '🎉'}</div>
      </motion.div>

      {/* Completion Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-bold text-gray-800 max-w-2xl px-4 mb-6"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Success Badge */}
      {highlight && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-full text-xl font-bold shadow-lg"
        >
          {highlight}
        </motion.div>
      )}
    </div>
  );
}
