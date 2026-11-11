import { ZodError } from 'zod';
import { AppError } from '../app.error.js';
import { ERROR_CODES, HTTP_STATUS } from '../constants/error.constants.js';
export function handleZodError(error: any): AppError | null {
 if (error instanceof ZodError) {
  // Group errors by field
  const fieldErrors: Record<string, string[]> = {};
  error.issues.forEach((issue) => {
    const field = issue.path.join('.') || 'root';
    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    fieldErrors[field].push(issue.message);
  });

  const errorEntries = Object.entries(fieldErrors);
  return new AppError(
    `Validation failed, Please fix these ${errorEntries.length} errors below`,
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.VALIDATION_ERROR,
    {
      errors: fieldErrors, 
      count: errorEntries.length,
    }
  );
}
  return null;
}