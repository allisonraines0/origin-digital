import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from '../models/registration.model';

/**
 * The backend returns { error, message, statusCode } on failures (see the API's
 * error-handling middleware). This pulls the human-readable message out of that
 * shape, falling back gracefully if the response doesn't match it (e.g. the API
 * is unreachable, in which case Angular's HttpErrorResponse.error is a raw
 * ProgressEvent rather than parsed JSON).
 */
export function extractErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Could not reach the server. Check that the API is running and try again.';
    }
    const body = err.error as Partial<ApiErrorBody> | null;
    if (body && typeof body.message === 'string') {
      return body.message;
    }
  }
  return fallback;
}
