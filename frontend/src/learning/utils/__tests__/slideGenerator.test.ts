/**
 * Slide Generator Tests
 * 
 * Comprehensive test suite for the slide generation system
 */

import { generateSlidesFromLesson } from '../slideGenerator';

describe('Slide Generator', () => {
  test('handles empty content gracefully', () => {
    const slides = generateSlidesFromLesson(null, 'Test Lesson');
    expect(slides.length).toBeGreaterThan(0);
    expect(slides[0].type).toBe('intro');
  });
  
  test('handles invalid content structure', () => {
    const slides = generateSlidesFromLesson({}, 'Test Lesson');
    expect(slides.length).toBeGreaterThan(0);
    expect(slides[0].type).toBe('intro');
  });
  
  test('splits long content into multiple slides', () => {
    const longContent = 'x'.repeat(1500);
    const content = {
      content_json: {
        sections: [{
          title: 'Test',
          content: longContent
        }]
      }
    };
    const slides = generateSlidesFromLesson(content, 'Test Lesson');
    expect(slides.length).toBeGreaterThan(1);
  });
  
  test('detects slide types correctly', () => {
    const content = {
      content_json: {
        sections: [
          { title: 'Introduction to Stats', content: 'Welcome...' },
          { title: 'Example 1: Coin Flip', content: 'Let\'s try...' },
          { title: 'Key Takeaway', content: 'Remember...' }
        ]
      }
    };
    const slides = generateSlidesFromLesson(content, 'Test Lesson');
    expect(slides[0].type).toBe('intro');
    expect(slides[1].type).toBe('example');
    expect(slides[2].type).toBe('tip');
  });
  
  test('sanitizes HTML content', () => {
    const content = {
      content_json: {
        sections: [{
          title: 'Test',
          content: '<script>alert("xss")</script>**bold** text'
        }]
      }
    };
    const slides = generateSlidesFromLesson(content, 'Test Lesson');
    expect(slides[0].content).not.toContain('<script>');
    expect(slides[0].content).toContain('<strong>bold</strong>');
  });
  
  test('processes math notation correctly', () => {
    const content = {
      content_json: {
        sections: [{
          title: 'Math Test',
          content: 'The formula is \\(x = y + z\\) and \\[E = mc^2\\]'
        }]
      }
    };
    const slides = generateSlidesFromLesson(content, 'Test Lesson');
    expect(slides[0].content).toContain('math-inline');
    expect(slides[0].content).toContain('math-block');
  });
  
  test('assigns appropriate visuals', () => {
    const content = {
      content_json: {
        sections: [
          { title: 'Probability Basics', content: 'Probability concepts...' },
          { title: 'Statistics', content: 'Statistical analysis...' },
          { title: 'Formula', content: 'Mathematical formula...' }
        ]
      }
    };
    const slides = generateSlidesFromLesson(content, 'Test Lesson');
    expect(slides[0].visual).toBe('🎲'); // probability
    expect(slides[1].visual).toBe('📊'); // statistics
    expect(slides[2].visual).toBe('🧮'); // formula
  });
  
  test('extracts highlights from content', () => {
    const content = {
      content_json: {
        sections: [{
          title: 'Important Concept',
          content: 'This is important: **Remember this key point** for the exam.'
        }]
      }
    };
    const slides = generateSlidesFromLesson(content, 'Test Lesson');
    expect(slides[0].highlight).toContain('Remember this key point');
  });
  
  test('handles multiple sections correctly', () => {
    const content = {
      content_json: {
        sections: [
          { title: 'Section 1', content: 'Content 1' },
          { title: 'Section 2', content: 'Content 2' },
          { title: 'Section 3', content: 'Content 3' }
        ]
      }
    };
    const slides = generateSlidesFromLesson(content, 'Test Lesson');
    expect(slides.length).toBe(4); // 3 sections + completion slide
    expect(slides[slides.length - 1].title).toBe('Great Job!');
  });
  
  test('skips empty sections', () => {
    const content = {
      content_json: {
        sections: [
          { title: 'Valid Section', content: 'Valid content' },
          { title: 'Empty Section', content: '' },
          { title: 'Another Valid Section', content: 'More content' }
        ]
      }
    };
    const slides = generateSlidesFromLesson(content, 'Test Lesson');
    expect(slides.length).toBe(3); // 2 valid sections + completion slide
  });
});
