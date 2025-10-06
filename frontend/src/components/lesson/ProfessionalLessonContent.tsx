import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { BookOpen, Lightbulb, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface ProfessionalLessonContentProps {
  content: string;
  title: string;
  estimatedMinutes?: number;
}

export function ProfessionalLessonContent({ content, title, estimatedMinutes }: ProfessionalLessonContentProps) {
  
  // Enhanced markdown parser with proper math and formatting
  interface ContentSection {
    type: string;
    level?: number;
    title: string;
    content: string;
  }

  const parseContent = (text: string): ContentSection[] => {
    if (!text) return [];
    
    const sections: ContentSection[] = [];
    const lines = text.split('\n');
    let currentSection: ContentSection | null = null;
    let currentContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Handle headers
      if (line.startsWith('# ')) {
        if (currentSection) {
          currentSection.content = currentContent.trim();
          sections.push(currentSection);
        }
        currentSection = {
          type: 'header',
          level: 1,
          title: line.substring(2),
          content: ''
        };
        currentContent = '';
      } else if (line.startsWith('## ')) {
        if (currentSection) {
          currentSection.content = currentContent.trim();
          sections.push(currentSection);
        }
        currentSection = {
          type: 'header',
          level: 2,
          title: line.substring(3),
          content: ''
        };
        currentContent = '';
      } else if (line.startsWith('### ')) {
        if (currentSection) {
          currentSection.content = currentContent.trim();
          sections.push(currentSection);
        }
        currentSection = {
          type: 'header',
          level: 3,
          title: line.substring(4),
          content: ''
        };
        currentContent = '';
      } else {
        currentContent += line + '\n';
      }
    }
    
    // Add the last section
    if (currentSection) {
      currentSection.content = currentContent.trim();
      sections.push(currentSection);
    }
    
    return sections;
  };

  // Render math expressions properly
  const renderTextWithMath = (text: string) => {
    if (!text) return null;
    
    const parts = [];
    let lastIndex = 0;
    
    // Handle inline math \(...\)
    const inlineMathRegex = /\\?\\\((.*?)\\?\\\)/g;
    let match;
    
    while ((match = inlineMathRegex.exec(text)) !== null) {
      // Add text before math
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        parts.push(renderFormattedText(beforeText));
      }
      
      // Add math
      try {
        parts.push(<InlineMath key={match.index} math={match[1]} />);
      } catch (e) {
        parts.push(<code key={match.index} className="bg-red-100 text-red-800 px-1 rounded">{match[0]}</code>);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(renderFormattedText(text.substring(lastIndex)));
    }
    
    return parts.length > 0 ? parts : renderFormattedText(text);
  };

  // Render formatted text (bold, italic, etc.)
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    let html = text;
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');
    
    // Code
    html = html.replace(/`([^`]+)`/g, '<code class="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-sm font-mono">$1</code>');
    
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // Parse bullet points
  const renderBulletPoints = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const bulletPoints = lines.filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'));
    
    if (bulletPoints.length === 0) return null;
    
    return (
      <div className="space-y-3">
        {bulletPoints.map((point: string, index: number) => {
          const text = point.replace(/^[•-]\s*/, '').trim();
          return (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {renderTextWithMath(text)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const sections = parseContent(content);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Lesson
          </Badge>
          {estimatedMinutes && (
            <Badge variant="outline" className="text-gray-600">
              {estimatedMinutes} min read
            </Badge>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {title}
        </h1>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {sections.map((section: ContentSection, index: number) => (
          <Card key={index} className="p-8 shadow-lg border-0 bg-white dark:bg-gray-900">
            {section.type === 'header' && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {section.title}
                  </h2>
                </div>

                {/* Section Content */}
                <div className="space-y-6">
                  {section.content.includes('•') || section.content.includes('-') ? (
                    renderBulletPoints(section.content)
                  ) : (
                    <div className="prose prose-lg max-w-none">
                      <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg space-y-4">
                        {section.content.split('\n\n').map((paragraph: string, pIndex: number) => (
                          <p key={pIndex} className="mb-4">
                            {renderTextWithMath(paragraph)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Key Concepts Summary */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
            Key Takeaways
          </h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">Probability Range:</span>
            </div>
            <p className="text-blue-700 dark:text-blue-300 ml-6">
              <InlineMath math="0 \leq P(A) \leq 1" /> for any event A
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">Complement Rule:</span>
            </div>
            <p className="text-blue-700 dark:text-blue-300 ml-6">
              <InlineMath math="P(A^c) = 1 - P(A)" />
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">Classical Probability:</span>
            </div>
            <p className="text-blue-700 dark:text-blue-300 ml-6">
              <InlineMath math="P = \frac{\text{favorable outcomes}}{\text{total outcomes}}" />
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">Law of Large Numbers:</span>
            </div>
            <p className="text-blue-700 dark:text-blue-300 ml-6">
              More trials → observed frequency approaches true probability
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
