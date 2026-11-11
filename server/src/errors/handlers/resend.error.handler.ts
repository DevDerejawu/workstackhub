import { AppError } from "../app.error.js";

export function resendErrorHandler(error:any){  
      // 400 - ValidPPation Errors
      if (error.name === "validation_error") {
        return new AppError(
          error.message || "Validation error with one or more fields.",
          400,
          "VALIDATION_ERROR",
        );
      }

      // 401 - API Key Errors
      if (error.name === "missing_api_key") {
        return new AppError(
          "Missing API key in the authorization header.",
          401,
          "MISSING_API_KEY",
        );
      }

      // 403 - Forbidden Errors
      if (error.name === "invalid_api_key") {
        return new AppError(
          "API key is invalid. Please check your configuration.",
          403,
          "INVALID_API_KEY",
        );
      }
      if (error.name === "invalid_from_address") {
        return new AppError(
          "Invalid from address. Please use a verified domain.",
          403,
          "INVALID_FROM_ADDRESS",
        );
      }

      // 422 - Request Errors
      if (error.name === "missing_required_field") {
        return new AppError(
          "Missing required field for email.",
          422,
          "MISSING_REQUIRED_FIELD",
        );
      }

      // 429 - Rate Limiting
      if (error.name === "rate_limit_exceeded") {
        return new AppError(
          "Too many requests. Please try again later.",
          429,
          "RATE_LIMIT_EXCEEDED",
        );
      }
      if (error.name === "daily_quota_exceeded") {
        return new AppError(
          "Daily sending quota exceeded. Please try again tomorrow.",
          429,
          "DAILY_QUOTA_EXCEEDED",
        );
      }

      // 500 - Server Errors
      if (
        error.name === "application_error" ||
        error.name === "internal_server_error"
      ) {
        return new AppError(
          "An unexpected error occurred. Please try again later.",
          500,
          "SERVER_ERROR",
        );
      }
      return new AppError("Failed to send email.", 500, "EMAIL_SEND_FAILED");
}