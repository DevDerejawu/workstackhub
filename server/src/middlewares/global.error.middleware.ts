import { errorLogger } from "@/utils/error.logger.js";
import {
  handleBodyError,
  handleDatabaseError,
  handleJwtError,
  handleNetworkError,
  handleUploadError,
  handleZodError,
  handleFallbackError,
} from "@/errors/handlers/index.js";

export const globalErrorHandler = (err: any, req: Req, res: Res, _: Nex) => {
  var isDev = process.env.NODE_ENV === 'development';
  const handlers = [
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
      return res.status(response.statusCode).json(err.toJSON());
    }
  }

  const { json, log } = handleFallbackError(err, req);
  errorLogger.error(log);
  return res.status(500).json(json);
};
