import { AppError } from "../app.error.js";
export function handleCustomError(err: any): AppError | null {
  if (err instanceof AppError) {
    return err;
  }
  return null;
}