import { AppError } from '../app.error.js';
import { UPLOAD_CONFIG } from '../constants/upload.constants.js';
import { ERROR_CODES, HTTP_STATUS } from '../constants/error.constants.js';
import multer from 'multer';

export function handleUploadError(err: any): AppError | null {  
  // 1. Multer errors
  if (err.name === 'MulterError' || err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return new AppError(
          `File is too large. Maximum size is ${UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB.`,
          HTTP_STATUS.PAYLOAD_TOO_LARGE,
          ERROR_CODES.FILE_TOO_LARGE
        );

      case 'LIMIT_FILE_COUNT':
        return new AppError(
          `Too many files. Maximum ${UPLOAD_CONFIG.MAX_FILES} files allowed.`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.TOO_MANY_FILES
        );

      case 'LIMIT_FIELD_COUNT':
        return new AppError(
          `Too many fields. Maximum ${UPLOAD_CONFIG.MAX_FIELDS} fields allowed.`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.TOO_MANY_FIELDS
        );

      case 'LIMIT_PART_COUNT':
        return new AppError(
          `Too many parts in the request. Maximum ${UPLOAD_CONFIG.MAX_PARTS} parts allowed.`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.TOO_MANY_PARTS
        );

      case 'LIMIT_FIELD_KEY':
        return new AppError(
          'Field name is too long.',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.FIELD_NAME_TOO_LONG
        );

      case 'LIMIT_FIELD_VALUE':
        return new AppError(
          'Field value is too long.',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.FIELD_VALUE_TOO_LONG
        );

      case 'LIMIT_UNEXPECTED_FILE':
        return new AppError(
          'Unexpected file field. Please check the field name.',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_FILE_FIELD,
        );

      default:
        return new AppError(
          'File upload failed. Please try again.',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.UPLOAD_ERROR
        );
    }
  }

  // 2. Custom file type validation errors
  if (err.code === 'UNSUPPORTED_FILE_TYPE') {
    return new AppError(
      `Unsupported file type. Allowed types: ${UPLOAD_CONFIG.ALLOWED_MIME_TYPES.join(', ')}`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.UNSUPPORTED_FILE_TYPE
    );
  }

  return null;
}