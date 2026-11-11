import { HttpError } from "./http.error.thrower";
import type { ApiErrorResponse, ApiSuccessResponse } from "./types";
const BASE_URL = "http://localhost:4000";

async function request<SuccessDataType, ErrorMetadataType>(
  path: string,
  options: RequestInit = {}
):Promise<ApiSuccessResponse<SuccessDataType>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload: 
    | ApiSuccessResponse<SuccessDataType>
    | ApiErrorResponse<ErrorMetadataType> =
      await response.json();

  if (!response.ok || !payload.success) {
    throw new HttpError<ErrorMetadataType>(payload as ApiErrorResponse<ErrorMetadataType>);
  }
  return payload;
}

export const http = {
  get: <SuccessDataType, ErrorMetadataType>(path: string, options?: RequestInit) =>
    request<SuccessDataType, ErrorMetadataType>(path, {
      method: "GET",
      ...options,
    }),

  post: <SuccessDataType, ErrorMetadataType>(path: string, body: unknown, options?: RequestInit) =>
    request<SuccessDataType, ErrorMetadataType>(path, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),

  put: <SuccessDataType, ErrorMetadataType>(path: string, body: unknown, options?: RequestInit) =>
    request<SuccessDataType, ErrorMetadataType>(path, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),

  patch: <SuccessDataType, ErrorMetadataType>(path: string, body: unknown, options?: RequestInit) =>
    request<SuccessDataType, ErrorMetadataType>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <SuccessDataType, ErrorMetadataType>(path: string, options?: RequestInit) =>
    request<SuccessDataType, ErrorMetadataType>(path, {
      method: "DELETE",
      ...options,
    }),
};