import { HttpError } from "./http.error.thrower";
import { getFrontendErrorMessage } from "./errorRefactor";
export function getErrorMessage(error:unknown):string {
  return error instanceof HttpError? error.response.error.message: getFrontendErrorMessage(error);
}