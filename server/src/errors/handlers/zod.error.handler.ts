import { ZodError } from 'zod';
import { AppError } from '../app.error.js';
import { ERROR_CODES, HTTP_STATUS } from '../constants/error.constants.js';
export function handleZodError(error: any): AppError | null {
  if (error instanceof ZodError) {
    // Format validation errors for better readability
    const errors = error.issues.map(issue => {
      const path = issue.path.join('.');
      return {
        field: path || 'root',
        message: issue.message,
      };
    });

    return new AppError(
      `Validation failed, Please fix these ${errors.length} erros bellow`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      {
        errors, 
        count: errors.length,
      }
    );
  }
  
  return null;
}