import type { ApiErrorResponse } from "./types";
export class HttpError<ErrorMetadata> extends Error {
  readonly response: ApiErrorResponse<ErrorMetadata>;
  constructor(response: ApiErrorResponse<ErrorMetadata>) {
    super(response.error.message);
    this.name = "HttpError";
    this.response = response;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}