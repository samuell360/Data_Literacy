/**
 * Formula Component
 * 
 * Renders mathematical formulas with LaTeX support and explanations
 * Provides educational context for mathematical concepts
 */

import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { BookOpen, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import 'katex/dist/katex.min.css';

interface FormulaProps {
  latex?: string;
  children?: React.ReactNode;
  inline?: boolean;
  explanation?: string;
  whenToUse?: string;
  example?: string;
  variables?: Record<string, string>;
  className?: string;
  showError?: boolean;
}

export function Formula({ 
  latex, 
  children, 
  inline = false,
  explanation,
  whenToUse,
  example,
  variables,
  className = '',
  showError = false
}: FormulaProps) {
  const [error, setError] = useState<string | null>(null);

  const renderMath = () => {
    if (latex) {
      try {
        return inline ? (
          <InlineMath math={latex} />
        ) : (
          <BlockMath math={latex} />
        );
      } catch (err) {
        console.error('Formula rendering error:', err);
        return (
          <span className="text-red-600 text-sm">
            Error rendering formula
          </span>
        );
      }
    }
    return children;
  };

  if (inline) {
    return (
      <span 
        className={`font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm align-middle ${className}`}
        title={error || undefined}
      >
        {renderMath()}
      </span>
    );
  }

  return (
    <div className={`my-6 ${className}`} role="region" aria-label="Mathematical formula">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
        {/* Formula Display */}
        <div className="text-center mb-4">
          <div className="text-lg overflow-x-auto py-2">
            {renderMath()}
          </div>
          {error && showError && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Formula rendering issue</span>
            </div>
          )}
        </div>

        {/* Variables Legend */}
        {variables && Object.keys(variables).length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Variables:
            </h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(variables).map(([variable, description]) => (
                <div key={variable} className="flex items-start gap-2 text-sm">
                  <dt className="font-mono font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded">
                    {variable}
                  </dt>
                  <dd className="text-slate-600 dark:text-slate-400">{description}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        
        {/* Explanation */}
        {explanation && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              What this means:
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {explanation}
            </p>
          </div>
        )}
        
        {/* When to Use */}
        {whenToUse && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              When to use:
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {whenToUse}
            </p>
          </div>
        )}
        
        {/* Example */}
        {example && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">
              Example:
            </h4>
            <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700">
              <div className="whitespace-pre-wrap font-sans">
                {example}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Inline formula for use within text
 */
export function InlineFormula({ 
  latex, 
  children,
  className = ""
}: { 
  latex?: string; 
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Formula 
      latex={latex} 
      inline={true}
      className={className}
    >
      {children}
    </Formula>
  );
}

/**
 * Formula with full explanation breakdown
 */
export function FormulaExplained({ 
  latex, 
  explanation, 
  whenToUse, 
  example,
  variables,
  className = ""
}: { 
  latex: string; 
  explanation: string; 
  whenToUse?: string; 
  example?: string;
  variables?: Record<string, string>;
  className?: string;
}) {
  return (
    <Formula 
      latex={latex} 
      explanation={explanation} 
      whenToUse={whenToUse} 
      example={example}
      variables={variables}
      className={className}
    />
  );
}

/**
 * Formula with variable definitions
 */
export function FormulaWithVariables({
  latex,
  variables,
  explanation,
  className = ""
}: {
  latex: string;
  variables: Record<string, string>;
  explanation?: string;
  className?: string;
}) {
  return (
    <Formula
      latex={latex}
      variables={variables}
      explanation={explanation}
      className={className}
    />
  );
}

/**
 * Simple formula card without extra context
 */
export function FormulaCard({
  latex,
  title,
  className = ""
}: {
  latex: string;
  title?: string;
  className?: string;
}) {
  return (
    <div className={`my-4 ${className}`}>
      {title && (
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {title}
        </h4>
      )}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <div className="text-center">
          <BlockMath math={latex} />
        </div>
      </div>
    </div>
  );
}

/**
 * Side-by-side formula comparison
 */
export function FormulaComparison({
  formulas,
  className = ""
}: {
  formulas: Array<{
    latex: string;
    label: string;
    description?: string;
  }>;
  className?: string;
}) {
  return (
    <div className={`my-6 grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {formulas.map((formula, index) => (
        <div 
          key={index}
          className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4"
        >
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
            {formula.label}
          </div>
          <div className="text-center mb-2">
            <BlockMath math={formula.latex} />
          </div>
          {formula.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {formula.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Formula derivation steps
 */
export function FormulaDerivation({
  steps,
  title = "Derivation",
  className = ""
}: {
  steps: Array<{
    latex: string;
    explanation: string;
  }>;
  title?: string;
  className?: string;
}) {
  return (
    <div className={`my-6 ${className}`}>
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
        {title}
      </h4>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={index}
            className="bg-slate-50 dark:bg-slate-800/50 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-r-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <BlockMath math={step.latex} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {step.explanation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}