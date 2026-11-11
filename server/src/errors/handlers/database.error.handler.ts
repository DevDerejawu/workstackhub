import { AppError } from "../app.error.js";
import {DatabaseError} from 'pg'
import { constraintMaps } from "../constraint.map.js";
import {
  ERROR_CODES,
  HTTP_STATUS,
  PG_ERROR_CODES,
} from "../constants/error.constants.js";

export function handleDatabaseError(err: unknown): AppError | null {

  // 1. ✅ Get the PostgresSql database error from drizzle on err.cause.
  const targetError = err instanceof Error && 'cause' in err ? err.cause : err;
  if(!(targetError instanceof DatabaseError)) return null
  // 2. Read the error code from the unwrapped target error object
  const dbCode = targetError.code;
    // 3. Extract properties from targetError instead of the raw top-level err
    const constraint = targetError.constraint;
    const table = targetError.table;
    const column = targetError.column;
    const severity = targetError.severity;

    const constraintMessage = constraint && constraint in constraintMaps 
  ? constraintMaps[constraint] 
  : null;

    // 4. Switch on dbCode(error codes of the postgresql)
    switch (dbCode) {
      case PG_ERROR_CODES.UNIQUE_VIOLATION:
        return new AppError(
          constraintMessage || `Duplicate entry for ${constraint || "resource"}`,
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.DUPLICATE_ENTRY,
          { constraint, table, column },
        );

      case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION: 
        return new AppError(
          constraintMessage || "Referenced record not found or invalid",
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.INVALID_REFERENCE,
          { constraint, table},
        );

      case PG_ERROR_CODES.NOT_NULL_VIOLATION:
        return new AppError(
          `${column || "Field"} cannot be null or empty`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.REQUIRED_FIELD_MISSING,
          { column, table },
        );

      case PG_ERROR_CODES.CHECK_VIOLATION: 
        return new AppError(
          constraintMessage || "Data validation failed in database",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR,
          { constraint, table },
        );

      case PG_ERROR_CODES.INVALID_TEXT_REPRESENTATION: 
        return new AppError(
          "Invalid data format provided for one or more fields",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_FORMAT,
          { column, table },
        );

      case PG_ERROR_CODES.CONNECTION_EXCEPTION: 
        return new AppError(
          "Database connection failed. Please try again later",
          HTTP_STATUS.SERVICE_UNAVAILABLE,
          ERROR_CODES.DATABASE_CONNECTION_ERROR,
          { code: dbCode, severity },
        );

      case PG_ERROR_CODES.DEADLOCK_DETECTED: 
        return new AppError(
          "Database deadlock detected. Please retry your request",
          HTTP_STATUS.CONFLICT,
          "DEADLOCK_DETECTED",
        );

      case PG_ERROR_CODES.UNDEFINED_TABLE: 
        return new AppError(
          "Database schema error or missing table structure",
          HTTP_STATUS.INTERNAL_SERVER,
          ERROR_CODES.DATABASE_ERROR,
          { table },
        );

      default:
        return new AppError(
          "Database operation failed",
          HTTP_STATUS.SERVICE_UNAVAILABLE,
          ERROR_CODES.DATABASE_ERROR,
          { code: dbCode,  },
        );
    }
  
}

