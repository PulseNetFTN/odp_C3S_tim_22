import { VALIDATION } from '../constants/validation';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCommentContent(content: string): ValidationError | null {
  const trimmed = content.trim();
  
  if (trimmed.length === 0) {
    return { field: 'content', message: 'Comment cannot be empty' };
  }
  
  if (trimmed.length < VALIDATION.COMMENT_CONTENT_MIN) {
    return { field: 'content', message: `Comment must be at least ${VALIDATION.COMMENT_CONTENT_MIN} character` };
  }
  
  if (trimmed.length > VALIDATION.COMMENT_CONTENT_MAX) {
    return { field: 'content', message: `Comment must not exceed ${VALIDATION.COMMENT_CONTENT_MAX} characters` };
  }
  
  return null;
}

export function validateCommentReply(content: string): ValidationError | null {
  return validateCommentContent(content);
}
