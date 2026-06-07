import { ValidationResult } from "../../Domain/types/ValidationResult";
import { VALIDATION } from '../../constants/validation';

export function validateCommentContent(content: string, parentId: number | null): ValidationResult {
    if (!content || content.trim().length < VALIDATION.COMMENT_CONTENT_MIN || content.trim().length > VALIDATION.COMMENT_CONTENT_MAX) {
        return { valid: false, message: `Content must be between ${VALIDATION.COMMENT_CONTENT_MIN} and ${VALIDATION.COMMENT_CONTENT_MAX} characters` };
    }

    if (parentId !== null && (isNaN(parentId) || parentId <= 0)) {
        return { valid: false, message: 'Invalid parent comment ID' };
    }

    return { valid: true };
}