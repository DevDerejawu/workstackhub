import { AppError } from '../app.error.js';
import { constraintMaps } from '../constraint.map.js';
import { ERROR_CODES, HTTP_STATUS, PG_ERROR_CODES } from '../constants/error.constants.js';

export function handleDatabaseError(err: any): AppError | null {
  // Check if it's a PostgreSQL error
  const isPostgresError = /^[0-9A-Z]{5}$/.test(err?.code);
  if (err?.code && typeof err.code === 'string' && isPostgresError) {
    const constraintMessage = constraintMaps[err.constraint] || null;

    switch (err.code) {
      case PG_ERROR_CODES.UNIQUE_VIOLATION:
        return new AppError(
          constraintMessage || `Duplicate entry for ${err.constraint || 'resource'}`,
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.DUPLICATE_ENTRY,
          { 
            constraint: err.constraint, 
            table: err.table,
            detail: err.detail,
            column: err.column,
          }
        );

      case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION:
        return new AppError(
          constraintMessage || 'Referenced record not found or invalid',
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.INVALID_REFERENCE,
          { 
            constraint: err.constraint, 
            table: err.table,
            detail: err.detail,
          }
        );

      case PG_ERROR_CODES.NOT_NULL_VIOLATION:
        return new AppError(
          `${err.column || 'Field'} cannot be null or empty`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.REQUIRED_FIELD_MISSING,
          { 
            column: err.column, 
            table: err.table,
            detail: err.detail,
          }
        );

      case PG_ERROR_CODES.CHECK_VIOLATION:
        return new AppError(
          constraintMessage || 'Data validation failed in database',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR,
          { 
            constraint: err.constraint, 
            table: err.table,
            detail: err.detail,
          }
        );

      case PG_ERROR_CODES.INVALID_TEXT_REPRESENTATION:
        return new AppError(
          'Invalid data format provided for one or more fields',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_FORMAT,
          { 
            column: err.column, 
            table: err.table,
            detail: err.detail,
          }
        );

      case PG_ERROR_CODES.CONNECTION_EXCEPTION:
        return new AppError(
          'Database connection failed. Please try again later',
          HTTP_STATUS.SERVICE_UNAVAILABLE,
          ERROR_CODES.DATABASE_CONNECTION_ERROR,
          { 
            code: err.code,
            severity: err.severity,
          }
        );

      case PG_ERROR_CODES.DEADLOCK_DETECTED:
        return new AppError(
          'Database deadlock detected. Please retry your request',
          HTTP_STATUS.CONFLICT,
          'DEADLOCK_DETECTED',
          { 
            detail: err.detail,
          }
        );

      case PG_ERROR_CODES.UNDEFINED_TABLE:
        return new AppError(
          'Database schema error',
          HTTP_STATUS.INTERNAL_SERVER,
          ERROR_CODES.DATABASE_ERROR,
          { 
            table: err.table,
            detail: err.detail,
          }
        );

      default:
        return new AppError(
          'Database operation failed',
          HTTP_STATUS.SERVICE_UNAVAILABLE,
          ERROR_CODES.DATABASE_ERROR,
          { 
            code: err.code,
            detail: err.detail,
          }
        );
    }
  }
  
  return null;
}