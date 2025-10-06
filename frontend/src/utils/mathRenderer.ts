/**
 * MathJax Renderer Utility
 * 
 * Initialize MathJax for rendering mathematical notation
 */

let mathJaxInitialized = false;

export function initMathJax() {
  if (mathJaxInitialized) return;
  
  // Add MathJax script to head
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  script.async = true;
  
  script.onload = () => {
    window.MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['\\[', '\\]']],
      },
      svg: {
        fontCache: 'global'
      }
    };
    mathJaxInitialized = true;
  };
  
  document.head.appendChild(script);
}

export function renderMath(element: HTMLElement) {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise([element]).catch((err: any) => {
      console.error('MathJax rendering error:', err);
    });
  }
}

// Type definition for window.MathJax
declare global {
  interface Window {
    MathJax?: {
      tex?: any;
      svg?: any;
      typesetPromise?: (elements: HTMLElement[]) => Promise<void>;
    };
  }
}
