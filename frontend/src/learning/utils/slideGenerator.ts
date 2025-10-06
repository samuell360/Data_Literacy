/**
 * Advanced Slide Generator with Intelligence & Edge Case Handling
 *
 * Converts lesson content_json into high-quality Duolingo-style slides
 * with intelligent type detection, content splitting, and formatting.
 */

import { marked } from 'marked';
import type { DuolingoSlide } from '../ui/DuolingoLessonViewer';

// Configuration for slide generation
const SLIDE_CONFIG = {
  MAX_CHARS_PER_SLIDE: 800,        // Maximum characters before splitting
  MIN_CHARS_FOR_SPLIT: 400,        // Minimum to consider splitting
  MAX_SLIDES_PER_SECTION: 3,       // Prevent infinite splitting
  MATH_INLINE_PATTERN: /\\\((.*?)\\\)/g,           // Inline math: \(...\)
  MATH_BLOCK_PATTERN: /\\\[(.*?)\\\]/gs,           // Block math: \[...\]
  MARKDOWN_BOLD_PATTERN: /\*\*(.*?)\*\*/g,         // **bold**
  MARKDOWN_ITALIC_PATTERN: /\*(.*?)\*/g,           // *italic*
  MARKDOWN_CODE_PATTERN: /`([^`]+)`/g,             // `code`
};

// Keywords that indicate slide types
const SLIDE_TYPE_KEYWORDS = {
  intro: ['introduction', 'welcome', 'overview', 'getting started', 'what is'],
  concept: ['definition', 'theory', 'rule', 'principle', 'law', 'formula'],
  example: ['example', 'practice', 'let\'s try', 'scenario', 'case study'],
  tip: ['tip', 'remember', 'note', 'important', 'key takeaway', 'pro tip'],
  practice: ['exercise', 'quiz', 'question', 'problem', 'challenge'],
  formula: ['formula', 'equation', 'calculation', 'math', 'mathematical', '\\[', '\\('],
  completion: ['complete', 'finished', 'done', 'congratulations', 'great job']
};

type LessonContent = {
  title?: string;
  content_json?: {
    sections?: Array<
      | { type: 'markdown'; content: string; title?: string }
      | { type: 'content'; content: string; title?: string }
      | { type: 'example'; content: string; title?: string }
      | { type: 'formula'; formula: { latex?: string; explanation?: string; whenToUse?: string; example?: string }; title?: string }
      | { [key: string]: any }
    >;
  };
};

const DEBUG = process.env.NODE_ENV === 'development';

function log(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[SlideGenerator] ${message}`, data || '');
  }
}

/**
 * Sanitize and format content for safe HTML rendering
 */
function sanitizeContent(raw: string): string {
  if (!raw || !raw.trim()) return '';

  // 1) Preprocess: drop generic "Section X" headers that leak from sources
  let content = raw.replace(/^#*\s*Section\s+\d+(\s*\(Part\s*\d+\))?.*$/gim, '').trim();

  // 2) Convert markdown to HTML using marked (handles headings/lists/tables/code)
  marked.setOptions({ breaks: true, gfm: true });
  let html = (marked.parse(content) as string) || '';

  // 3) Add Tailwind-friendly classes to common elements for nicer rendering
  html = html
    .replace(/<h1>/g, '<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">')
    .replace(/<h2>/g, '<h2 class="text-2xl md:text-3xl font-bold text-gray-800 mt-6 mb-4">')
    .replace(/<h3>/g, '<h3 class="text-xl md:text-2xl font-semibold text-gray-800 mt-4 mb-3">')
    .replace(/<p>/g, '<p class="text-lg leading-relaxed text-gray-700 mb-4">')
    .replace(/<ul>/g, '<ul class="list-disc pl-6 space-y-2 my-4">')
    .replace(/<ol>/g, '<ol class="list-decimal pl-6 space-y-2 my-4">')
    .replace(/<li>/g, '<li class="text-lg text-gray-700">')
    .replace(/<strong>/g, '<strong class="font-semibold text-gray-900">')
    .replace(/<code>/g, '<code class="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">');

  // 4) Wrap LaTeX blocks/inline in MathJax-friendly containers after HTML conversion
  html = html.replace(SLIDE_CONFIG.MATH_BLOCK_PATTERN, (_m, formula) => {
    return `<div class="math-block my-6 text-center text-xl">\\[${String(formula).trim()}\\]</div>`;
  });
  html = html.replace(SLIDE_CONFIG.MATH_INLINE_PATTERN, (_m, formula) => {
    return `<span class="math-inline">\\(${String(formula).trim()}\\)</span>`;
  });

  // 5) Basic XSS hardening (keep attrs minimal; full sanitization can be added with DOMPurify if needed)
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/on\w+="[^"]*"/gi, '');

  return html;
}

/**
 * Determine the most appropriate slide type based on content
 */
function detectSlideType(
  title: string, 
  content: string, 
  sectionIndex: number,
  totalSections: number
): DuolingoSlide['type'] {
  const text = (title + ' ' + content).toLowerCase();
  
  // First section is usually intro
  if (sectionIndex === 0) {
    return 'intro';
  }
  
  // Last section often has tips or completion
  if (sectionIndex === totalSections - 1) {
    // Check if it's a completion message
    if (SLIDE_TYPE_KEYWORDS.completion.some(keyword => text.includes(keyword))) {
      return 'completion';
    }
    return 'tip';
  }
  
  // Check for mathematical formulas first (formula type)
  if (SLIDE_CONFIG.MATH_BLOCK_PATTERN.test(content) || 
      SLIDE_CONFIG.MATH_INLINE_PATTERN.test(content) ||
      text.includes('formula') || text.includes('equation')) {
    return 'formula';
  }
  
  // Check for keywords in title and content
  for (const [type, keywords] of Object.entries(SLIDE_TYPE_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return type as DuolingoSlide['type'];
    }
  }
  
  // Check for numbered examples
  if (/example\s+\d+/i.test(title) || /example\s*:/i.test(title)) {
    return 'example';
  }
  
  // Default to concept
  return 'concept';
}

/**
 * Split long content into multiple slides intelligently
 */
function splitLongContent(
  content: string,
  title: string,
  slideType: DuolingoSlide['type']
): Array<{ content: string; title: string }> {
  
  // If content is short enough, return as-is
  if (content.length <= SLIDE_CONFIG.MAX_CHARS_PER_SLIDE) {
    return [{ content, title }];
  }
  
  const slides: Array<{ content: string; title: string }> = [];
  
  // Try to split by paragraphs first
  const paragraphs = content.split('</p>').filter(p => p.trim());
  
  let currentContent = '';
  let partNumber = 1;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i] + '</p>';
    
    // If adding this paragraph would exceed limit
    if ((currentContent + para).length > SLIDE_CONFIG.MAX_CHARS_PER_SLIDE && currentContent) {
      // Save current slide
      slides.push({
        title: slides.length === 0 ? title : `${title} (Part ${partNumber})`,
        content: currentContent
      });
      
      partNumber++;
      currentContent = para;
      
      // Safety: don't create too many slides
      if (slides.length >= SLIDE_CONFIG.MAX_SLIDES_PER_SECTION) {
        break;
      }
    } else {
      currentContent += para;
    }
  }
  
  // Add remaining content
  if (currentContent) {
    slides.push({
      title: slides.length === 0 ? title : `${title} (Part ${partNumber})`,
      content: currentContent
    });
  }
  
  return slides.length > 0 ? slides : [{ content, title }];
}

/**
 * Assign appropriate emoji based on slide type and content
 */
function getSlideVisual(type: DuolingoSlide['type'], title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase();
  
  // Type-based defaults
  const typeDefaults: Record<DuolingoSlide['type'], string> = {
    intro: '📚',
    concept: '💡',
    example: '🎯',
    tip: '✨',
    practice: '🎮',
    formula: '🧮',
    completion: '🎉'
  };
  
  // Content-specific overrides
  if (text.includes('probability')) return '🎲';
  if (text.includes('statistic')) return '📊';
  if (text.includes('distribution')) return '📈';
  if (text.includes('sample')) return '🎯';
  if (text.includes('test') || text.includes('hypothesis')) return '🔬';
  if (text.includes('correlation')) return '🔗';
  if (text.includes('regression')) return '📉';
  if (text.includes('data')) return '📊';
  if (text.includes('formula') || text.includes('equation')) return '🧮';
  if (text.includes('rule') || text.includes('law')) return '⚖️';
  if (text.includes('coin') || text.includes('flip')) return '🪙';
  if (text.includes('dice') || text.includes('roll')) return '🎲';
  if (text.includes('card') || text.includes('deck')) return '🃏';
  if (text.includes('game') || text.includes('gaming')) return '🎮';
  if (text.includes('music') || text.includes('song')) return '🎵';
  if (text.includes('weather') || text.includes('rain')) return '🌧️';
  if (text.includes('sports') || text.includes('team')) return '⚽';
  if (text.includes('money') || text.includes('price')) return '💰';
  if (text.includes('time') || text.includes('clock')) return '⏰';
  if (text.includes('success') || text.includes('win')) return '🏆';
  if (text.includes('learn') || text.includes('study')) return '📖';
  if (text.includes('think') || text.includes('consider')) return '🤔';
  if (text.includes('remember') || text.includes('memory')) return '🧠';
  if (text.includes('key') || text.includes('important')) return '🔑';
  if (text.includes('star') || text.includes('excellent')) return '⭐';
  if (text.includes('fire') || text.includes('hot')) return '🔥';
  if (text.includes('light') || text.includes('bright')) return '💡';
  if (text.includes('target') || text.includes('aim')) return '🎯';
  if (text.includes('sparkle') || text.includes('magic')) return '✨';
  if (text.includes('check') || text.includes('correct')) return '✅';
  if (text.includes('warning') || text.includes('careful')) return '⚠️';
  if (text.includes('question') || text.includes('ask')) return '❓';
  if (text.includes('answer') || text.includes('solve')) return '💡';
  if (text.includes('complete') || text.includes('finish')) return '🎉';
  if (text.includes('congratulations') || text.includes('great job')) return '🎊';
  
  return typeDefaults[type] || '📖';
}

/**
 * Extract key takeaway/highlight from content
 */
function extractHighlight(content: string, slideType: DuolingoSlide['type']): string | undefined {
  // Don't extract highlights for intro slides
  if (slideType === 'intro') return undefined;
  
  // Look for explicit highlight markers
  const highlightPatterns = [
    /(?:key takeaway|remember|important|note):\s*([^.!?]+[.!?])/i,
    /<strong>([^<]+)<\/strong>/,
    /\*\*([^*]+)\*\*/
  ];
  
  for (const pattern of highlightPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      // Clean HTML tags and trim
      const highlight = match[1].replace(/<[^>]+>/g, '').trim();
      // Only use if it's a reasonable length
      if (highlight.length > 20 && highlight.length < 150) {
        return highlight;
      }
    }
  }
  
  // For concept slides, try to extract the first formula or definition
  if (slideType === 'concept') {
    const mathMatch = content.match(/\\\[(.*?)\\\]/);
    if (mathMatch) {
      return 'Key formula to remember';
    }
  }
  
  return undefined;
}

/**
 * Fallback slides for when content is missing or invalid
 */
function createFallbackSlides(): DuolingoSlide[] {
  return [
    {
      id: 'fallback-1',
      type: 'intro',
      visual: '📚',
      title: 'Lesson Content',
      content: '<p class="text-xl">This lesson is being prepared.</p><p class="mt-4">Please check back soon for updated content.</p>'
    }
  ];
}

export function generateSlidesFromLesson(lessonData: LessonContent | null | undefined, fallbackTitle: string): DuolingoSlide[] {
  log('Starting slide generation', { 
    hasLessonData: !!lessonData, 
    fallbackTitle,
    sectionsCount: lessonData?.content_json?.sections?.length || 0 
  });

  if (!lessonData || !lessonData.content_json?.sections || !Array.isArray(lessonData.content_json.sections)) {
    log('Invalid content structure, using fallback');
    return createFallbackSlides();
  }

  const slides: DuolingoSlide[] = [];
  const title = (lessonData.title || fallbackTitle || 'Lesson').trim();
  const sections = lessonData.content_json.sections.filter((s: any) => s && (s.title || s.content || s.body));

  if (sections.length === 0) {
    log('No valid sections found, using fallback');
    return createFallbackSlides();
  }

  // Process each section
  sections.forEach((section: any, index: number) => {
    const rawTitle = section.title || `Section ${index + 1}`;
    const rawContent = section.content || section.body || '';
    
    // Skip empty sections
    if (!rawContent.trim()) {
      log(`Skipping empty section: ${rawTitle}`);
      return;
    }
    
    // Detect slide type
    const slideType = detectSlideType(rawTitle, rawContent, index, sections.length);
    log(`Detected slide type: ${slideType} for "${rawTitle}"`);
    
    // Sanitize content
    const sanitizedContent = sanitizeContent(rawContent);
    
    // Split if too long
    const splitSlides = splitLongContent(sanitizedContent, rawTitle, slideType);
    log(`Split content into ${splitSlides.length} slides`, { 
      originalLength: rawContent.length,
      splitNeeded: rawContent.length > SLIDE_CONFIG.MAX_CHARS_PER_SLIDE 
    });
    
    // Create slides
    splitSlides.forEach((split, splitIndex) => {
      const slideId = `slide-${index}-${splitIndex}`;
      const visual = getSlideVisual(slideType, split.title, split.content);
      const highlight = extractHighlight(split.content, slideType);
      
      slides.push({
        id: slideId,
        type: slideType,
        visual,
        title: split.title,
        content: split.content,
        highlight
      });
    });
  });
  
  // Ensure we have at least one slide
  if (slides.length === 0) {
    log('No slides generated, using fallback');
    return createFallbackSlides();
  }
  
  // Add a completion slide at the end
  slides.push({
    id: 'slide-complete',
    type: 'tip',
    visual: '🎉',
    title: 'Great Job!',
    content: '<p class="text-xl mb-4">You\'ve completed this lesson!</p><p>Ready to test your knowledge with a quiz?</p>',
    highlight: 'Click finish to continue to the summary'
  });
  
  log('Generated slides successfully', { totalSlides: slides.length });
  return slides;
}


