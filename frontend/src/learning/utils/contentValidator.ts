/**
 * Content Validator
 * 
 * Validates lesson content structure and provides helpful error messages
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateLessonContent(content: any): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Check basic structure
  if (!content) {
    result.errors.push('Content is null or undefined');
    result.isValid = false;
    return result;
  }
  
  if (!content.sections || !Array.isArray(content.sections)) {
    result.errors.push('Missing or invalid sections array');
    result.isValid = false;
  }
  
  // Check sections
  if (content.sections) {
    content.sections.forEach((section: any, index: number) => {
      if (!section.title) {
        result.warnings.push(`Section ${index} missing title`);
      }
      
      if (!section.content && !section.body) {
        result.warnings.push(`Section ${index} missing content`);
      }
      
      // Check for extremely long content
      const contentLength = (section.content || section.body || '').length;
      if (contentLength > 5000) {
        result.warnings.push(`Section ${index} is very long (${contentLength} chars)`);
      }
      
      // Check for empty content
      if (contentLength === 0) {
        result.warnings.push(`Section ${index} has empty content`);
      }
    });
  }
  
  // Set invalid if there are critical errors
  if (result.errors.length > 0) {
    result.isValid = false;
  }
  
  return result;
}
