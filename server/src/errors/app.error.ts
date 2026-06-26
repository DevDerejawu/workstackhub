import { ERROR_CODES, HTTP_STATUS} from './constants/error.constants.js';
export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  data: any;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly data: any;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public path?: string;
  public method?: string;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER,
    code: string = ERROR_CODES.UNKNOWN,
    data: any = null,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.data = data;
    this.isOperational = isOperational;
    this.timestamp = new Date();

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  public setContext(path: string, method: string): this {
    this.path = path;
    this.method = method;
    return this;
  }
  public toJSON(): ErrorResponse {
    return {
      success: false,
      message: this.message,
      code: this.code,
      data: this.data,
    };

  }

  public toLog() {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      path: this.path,
      method: this.method,
      stack: this.stack,
      data: this.data,
    };
  }
}

// Convenience factory methods
export class ErrorFactory {
  static badRequest(message: string, data?: any): AppError {
    return new AppError(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, data);
  }

  static unauthorized(message: string = 'Unauthorized', data?: any): AppError {
    return new AppError(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, data);
  }

  static forbidden(message: string = 'Forbidden', data?: any): AppError {
    return new AppError(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, data);
  }

  static notFound(message: string = 'Resource not found', data?: any): AppError {
    return new AppError(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, data);
  }

  static conflict(message: string, data?: any): AppError {
    return new AppError(message, HTTP_STATUS.CONFLICT, ERROR_CODES.DUPLICATE_ENTRY, data);
  }

}