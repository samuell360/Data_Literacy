import { marked } from 'marked';

export interface LessonSlide {
  type: 'content' | 'example' | 'question' | 'summary' | 'story' | 'concept' | 'formula';
  content?: string;
  title?: string;
  question?: {
    type: 'mcq' | 'tf' | 'fill' | 'match' | 'tap-words' | 'FILL' | 'TAP_WORDS' | 'MATCH';
    stem: string;
    choices?: string[];
    correctAnswer: string | number | boolean;
    explanation: string;
    scenario?: string;
    hint?: string;
    realWorldContext?: string;
    learningObjectives?: string[];
    prerequisiteConcepts?: string[];
  };
  formula?: {
    latex: string;
    explanation: string;
    whenToUse: string;
    example: string;
  };
}

export function parseLessonContent(
  lessonMarkdown: string,
  quizData: any[],
  summaryContent?: string
): LessonSlide[] {
  const slides: LessonSlide[] = [];

  if (!lessonMarkdown) return slides;

  // Configure marked for better HTML output
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  // Split markdown into sections by headers
  const sections = lessonMarkdown.split(/(?=^#{1,3}\s+)/gm).filter(section => section.trim());

  sections.forEach((section, index) => {
    if (!section.trim()) return;

    // Remove the header from content and use it as a title if needed
    const lines = section.split('\n');
    const headerMatch = lines[0].match(/^#{1,3}\s+(.+)/);
    const contentWithoutHeader = headerMatch ? lines.slice(1).join('\n').trim() : section.trim();

    if (contentWithoutHeader.length > 30) {
      // Break long sections into smaller chunks (paragraphs)
      const paragraphs = contentWithoutHeader
        .split(/\n\s*\n/)
        .filter(para => para.trim().length > 20);

      paragraphs.forEach((paragraph, paraIndex) => {
        // Add content slide
        slides.push({
          type: 'content',
          content: marked.parse ? marked.parse(paragraph.trim()) as string : marked(paragraph.trim()) as string
        });

        // Add quiz question after every 2-3 content slides
        const contentSlidesCount = slides.filter(s => s.type === 'content').length;
        const questionsAdded = slides.filter(s => s.type === 'question').length;
        
        if (contentSlidesCount % 2 === 0 && questionsAdded < quizData.length) {
          const quiz = quizData[questionsAdded];
          if (quiz) {
            slides.push(createQuestionSlide(quiz));
          }
        }
      });
    }
  });

  // Add any remaining quiz questions
  const questionsAdded = slides.filter(s => s.type === 'question').length;
  for (let i = questionsAdded; i < quizData.length; i++) {
    const quiz = quizData[i];
    if (quiz) {
      slides.push(createQuestionSlide(quiz));
    }
  }

  // Add summary slide at the end if provided
  if (summaryContent && summaryContent.trim()) {
    slides.push({
      type: 'summary',
      content: marked.parse ? marked.parse(summaryContent) as string : marked(summaryContent) as string
    });
  }

  return slides;
}

function createQuestionSlide(quiz: any): LessonSlide {
  let correctAnswer: string | number | boolean;
  
  // Handle different quiz formats
  if (quiz.type === 'mcq') {
    correctAnswer = quiz.answerIndex ?? quiz.correctAnswer ?? 0;
  } else if (quiz.type === 'tf') {
    correctAnswer = quiz.answer ?? quiz.correctAnswer ?? true;
  } else {
    correctAnswer = quiz.answer ?? quiz.correctAnswer ?? '';
  }

  return {
    type: 'question',
    question: {
      type: quiz.type,
      stem: quiz.stem || quiz.question || '',
      choices: quiz.choices || quiz.options,
      correctAnswer,
      explanation: quiz.explain || quiz.explanation || 'Great job!',
      scenario: quiz.scenario,
      hint: quiz.hint,
      realWorldContext: quiz.realWorldContext,
      learningObjectives: quiz.learningObjectives,
      prerequisiteConcepts: quiz.prerequisiteConcepts
    }
  };
}

// Helper function to create slides from existing lesson data
export function createSlidesFromLesson(lesson: any): LessonSlide[] {
  // Extract content - try multiple possible locations
  let content = '';
  if (lesson.content_json) {
    if (typeof lesson.content_json === 'string') {
      content = lesson.content_json;
    } else if (lesson.content_json.content) {
      content = lesson.content_json.content;
    } else if (lesson.content_json.sections && Array.isArray(lesson.content_json.sections)) {
      content = lesson.content_json.sections.map((s: any) => s.content || '').join('\n\n');
    }
  }

  // If no content found, try to load from markdown files (fallback)
  if (!content && lesson.title) {
    // This would be the markdown content from the lesson files
    content = `# ${lesson.title}\n\nThis lesson covers the fundamentals of probability theory.\n\n## Key Concepts\n\nProbability is a measure of uncertainty that ranges from 0 to 1.\n\n## Examples\n\nWhen you flip a fair coin, the probability of getting heads is 0.5.`;
  }

  // Extract quiz data from various possible locations
  let quizData: any[] = [];
  
  // Try lesson.quiz first
  if (lesson.quiz) {
    if (Array.isArray(lesson.quiz)) {
      quizData = lesson.quiz;
    } else if (lesson.quiz.items && Array.isArray(lesson.quiz.items)) {
      quizData = lesson.quiz.items;
    }
  }
  
  // Try lesson.quiz_json as backup
  if (quizData.length === 0 && lesson.quiz_json) {
    if (Array.isArray(lesson.quiz_json)) {
      quizData = lesson.quiz_json;
    } else if (lesson.quiz_json.items && Array.isArray(lesson.quiz_json.items)) {
      quizData = lesson.quiz_json.items;
    }
  }

  // Normalize quiz data to handle different formats
  quizData = normalizeQuizData(quizData);

  // Extract summary
  let summary = '';
  if (lesson.summary) {
    summary = typeof lesson.summary === 'string' ? lesson.summary : lesson.summary.content || '';
  }

  // If no summary, create a default one
  if (!summary) {
    summary = `## Key Takeaways\n\n- Probability ranges from 0 to 1\n- All outcomes in a sample space sum to 1\n- Use complements: P(A^c) = 1 - P(A)`;
  }

  return parseLessonContent(content, quizData, summary);
}

// Helper to convert old quiz format to new format
export function normalizeQuizData(quizItems: any[]): any[] {
  if (!Array.isArray(quizItems)) return [];

  return quizItems.map(item => {
    // Normalize question type
    let questionType = item.type || item.question_type || 'mcq';
    if (questionType === 'FILL') questionType = 'fill';
    if (questionType === 'TAP_WORDS') questionType = 'tap-words';
    if (questionType === 'MATCH') questionType = 'match';
    if (questionType === 'MCQ') questionType = 'mcq';
    if (questionType === 'TRUE_FALSE') questionType = 'tf';

    // Handle different choice formats for different question types
    let choices = item.choices || item.options || item.options_json || [];
    
    // For tap-words, if choices is a string, split it
    if (questionType === 'tap-words' && typeof choices === 'string') {
      choices = choices.split(' ').filter(word => word.trim());
    }
    
    // For match questions, ensure we have pairs
    if (questionType === 'match' && choices.length > 0) {
      // If choices is a single array, split it into two columns
      if (Array.isArray(choices) && choices.length > 2) {
        const midPoint = Math.ceil(choices.length / 2);
        choices = [...choices.slice(0, midPoint), ...choices.slice(midPoint)];
      }
    }

    return {
      type: questionType,
      stem: item.stem || item.question || 'Question',
      choices: choices,
      answerIndex: item.answerIndex,
      answer: item.answer || item.correct_answer,
      correctAnswer: item.correctAnswer || (item.correct_answer ?? (questionType === 'mcq' ? item.answerIndex : item.answer)),
      explain: item.explain || item.explanation || item.explanation_correct || 'Great job!',
      scenario: item.scenario || item.scenario_text,
      hint: item.hint || item.hint_text,
      realWorldContext: item.realWorldContext || item.real_world_context,
      learningObjectives: item.learningObjectives || item.learning_objectives || [],
      prerequisiteConcepts: item.prerequisiteConcepts || item.prerequisite_concepts || []
    };
  });
}
