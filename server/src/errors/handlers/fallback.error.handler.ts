import { ERROR_CODES } from '../constants/error.constants.js';
import { HTTP_STATUS } from '../constants/error.constants.js';

export function handleFallbackError(err: any, req: Req): any {  
  const isDev = process.env.NODE_ENV === 'development';
  const message = isDev
    ? err.message || 'Unknown error'
    : 'An unexpected error occurred. Please try again later.';
  
  // Data to send to client
  const json = {
    success: false,
    message,
    code: ERROR_CODES.INTERNAL_ERROR,
    data: null,
  };

  // For logging data
  const log = {
    message: err.message || 'Unknown error',
    code: ERROR_CODES.INTERNAL_ERROR,
    statusCode: HTTP_STATUS.INTERNAL_SERVER,
    timestamp: new Date().toISOString(),
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous'
  };
  
  return { log, json };
}