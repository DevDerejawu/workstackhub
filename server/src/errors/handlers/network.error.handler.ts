import { AppError } from '../app.error.js';
import { ERROR_CODES, HTTP_STATUS } from '../constants/error.constants.js';


export function handleNetworkError(err: any): AppError | null {
  // 1. Timeout errors
  if (err.code === 'ETIMEDOUT' || err.name === 'TimeoutError') {
    return new AppError(
      'Request timeout. The server took too long to respond.',
      HTTP_STATUS.GATEWAY_TIMEOUT,
      ERROR_CODES.REQUEST_TIMEOUT
    );
  }

  // 2. Connection refused
  if (err.code === 'ECONNREFUSED') {
    return new AppError(
      'Service temporarily unavailable. We\'re working to restore it.',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      ERROR_CODES.CONNECTION_REFUSED,
      {
        suggestion: 'Please try again in a few minutes.',
        originalCode: err.code,
        originalMessage: err.message,
        address: err.address,
        port: err.port,
      },
      false, 
    );
  }

  // 3. Connection reset
  if (err.code === 'ECONNRESET') {
    return new AppError(
      'Connection interrupted. Your request may not have completed.',
      HTTP_STATUS.INTERNAL_SERVER,
      ERROR_CODES.CONNECTION_RESET,
      {
        suggestion: 'Please check your network connection and try again.',
        originalCode: err.code,
        originalMessage: err.message,
      },
      false, 
    );
  }


  // 4. Host not found (DNS resolution failed)
  if (err.code === 'ENOTFOUND') {
    return new AppError(
      'Unable to resolve the service address.',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      ERROR_CODES.NETWORK_ERROR,
      {
        suggestion: 'Please check your DNS settings or try again later.',
        originalCode: err.code,
        originalMessage: err.message,
        hostname: err.hostname,
      },
      false,  
    );
  }
  // 5. Other network errors
  const networkErrors = ['ENETUNREACH', 'EHOSTUNREACH', 'EPIPE', 'EAI_AGAIN'];
  if (networkErrors.includes(err.code)) {
    return new AppError(
      'Network error. Unable to reach the service.',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      ERROR_CODES.NETWORK_ERROR,  
    );
  }
  return null;
}