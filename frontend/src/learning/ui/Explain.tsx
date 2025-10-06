/**
 * Explain Component
 * 
 * Renders friendly explanations with highlighted styling
 */

import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ExplainProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'tip' | 'important' | 'formula';
  className?: string;
}

export function Explain({ 
  children, 
  title, 
  variant = 'default',
  className = '' 
}: ExplainProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'tip':
        return 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100';
      case 'important':
        return 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100';
      case 'formula':
        return 'bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-100';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'tip':
      case 'important':
      case 'formula':
        return <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />;
      default:
        return null;
    }
  };

  return (
    <div className={`rounded-lg border p-4 my-4 ${getVariantStyles()} ${className}`}>
      <div className="flex gap-3">
        {getIcon()}
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide">
              {title}
            </h4>
          )}
          <div className="prose prose-sm max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pre-configured explanation variants
 */
export function ExplainTip({ children, title = "💡 Tip" }: { children: React.ReactNode; title?: string }) {
  return (
    <Explain variant="tip" title={title}>
      {children}
    </Explain>
  );
}

export function ExplainImportant({ children, title = "⚠️ Important" }: { children: React.ReactNode; title?: string }) {
  return (
    <Explain variant="important" title={title}>
      {children}
    </Explain>
  );
}

export function ExplainFormula({ children, title = "📐 Formula Breakdown" }: { children: React.ReactNode; title?: string }) {
  return (
    <Explain variant="formula" title={title}>
      {children}
    </Explain>
  );
}
