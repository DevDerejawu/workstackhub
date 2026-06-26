import { AppError } from '../app.error.js';
import { ERROR_CODES, HTTP_STATUS } from '../constants/error.constants.js';

export function handleBodyError(err: any): AppError | null {
  
  // 1. Invalid JSON format
  if (err.type === 'entity.parse.failed') {
    return new AppError(
      'Invalid JSON format in request body',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_JSON,
      {
        expected: 'Valid JSON',
        received: err.body ? 'Malformed JSON' : 'Empty body',
        originalError: err.message,
      }
    );
  }

  // 2. JSON too large (payload too large)
  if (err.type === 'entity.too.large' || err.constructor?.name === 'PayloadTooLargeError') {
    return new AppError(
      `Request payload too large. Maximum size is ${err.limit || 'unknown'} bytes`,
      HTTP_STATUS.PAYLOAD_TOO_LARGE,
      ERROR_CODES.JSON_TOO_LARGE,
      {
        limit: err.limit,
        received: err.received,
        originalError: err.message,
      }
    );
  }

  // 3. Too many parameters/form fields
  if (err.type === 'parameters.too.many') {
    return new AppError(
      `Too many form fields. Maximum allowed is ${err.parameterLimit}`,
      HTTP_STATUS.PAYLOAD_TOO_LARGE,
      ERROR_CODES.TOO_MANY_FIELDS,
      {
        limit: err.parameterLimit,
        received: err.received,
        originalError: err.message,
      },
    );
  }

  // 4. Unsupported media type
  if (err.type === 'encoding.unsupported' || err.status === 415) {
    return new AppError(
      'Unsupported media type. Please use application/json',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.UNSUPPORTED_MEDIA_TYPE,
      {
        expected: 'application/json',
        received: err.contentType,
        originalError: err.message,
      } 
    );
  }

  // 5. Malformed JSON (generic)
  if (err.message && err.message.includes('Unexpected token')) {
    return new AppError(
      'Malformed JSON. Please check your syntax',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_JSON,
      {
        position: err.position,
        originalError: err.message,
      },
    );
  }

  return null;
}