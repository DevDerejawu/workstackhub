import { AppError } from '../app.error.js';
import { ERROR_CODES, HTTP_STATUS } from '../constants/error.constants.js';

export function handleJwtError(err: any): AppError | null {
  // Check if it's a jwt error
  if (err.name === 'JsonWebTokenError') {
    let message = 'Authentication failed. Invalid token.';
    let code = ERROR_CODES.INVALID_TOKEN;
    
    // More specific error messages based on the error
    if (err.message === 'jwt malformed') {
      message = 'Invalid token format. Please provide a valid token.';
    } else if (err.message === 'invalid signature') {
      message = 'Invalid token signature. Token may have been tampered with.';
    } else if (err.message === 'invalid algorithm') {
      message = 'Invalid signing algorithm.';
    }
    
    return new AppError(
      message,
      HTTP_STATUS.UNAUTHORIZED,
      code,
    );
  }
  
  if (err.name === 'TokenExpiredError') {
    return new AppError(
      'Session expired. Please log in again.',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.TOKEN_EXPIRED,
    );
  }

  if (err.name === 'NotBeforeError') {
    return new AppError(
      'Token is not active yet. Please check your system time.',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.TOKEN_NOT_ACTIVE,
    );
  }

  // Handle missing token
  if (err.name === 'JsonWebTokenError' && err.message === 'jwt must be provided') {
    return new AppError(
      'Authentication required. Please provide a valid token.',
      HTTP_STATUS.UNAUTHORIZED,
      'MISSING_TOKEN'
    );
  }
  
  return null;
}