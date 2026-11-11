import { errorLogger } from "@/utils/error.logger.js";
import {
  handleBodyError,
  handleDatabaseError,
  handleJwtError,
  handleNetworkError,
  handleUploadError,
  handleZodError,
  handleFallbackError,
  handleCustomError
} from "@/errors/handlers/index.js";

export const globalErrorHandler = (err: any, req: Req, res: Res, _: Nex) => {
  console.log('error', err)
  var isDev = process.env.NODE_ENV === 'development';
  const handlers = [
    handleCustomError,
    handleBodyError,
    handleDatabaseError,
    handleJwtError,
    handleNetworkError,
    handleUploadError,
    handleZodError,
  ];

  for (const handler of handlers) {
    const response = handler(err);
    if (response) {
      const isOpretional = response.isOperational;
      if (!isOpretional) {
        errorLogger.error(response.setContext(req.path, req.method).toLog());
      }
      if (isDev) {
        errorLogger.info(response.setContext(req.path, req.method).toLog());
      }
      return res.status(response.statusCode).json(response.toJSON());
    }
  }

  const { json, log } = handleFallbackError(err, req);
  errorLogger.error(log);
  return res.status(log.error.status).json(json);
};
