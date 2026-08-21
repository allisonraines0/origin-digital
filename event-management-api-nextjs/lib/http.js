import { NextResponse } from 'next/server';
import {
  NotFoundError,
  ValidationError,
  PastEventError,
  EventFullError,
  DuplicateRegistrationError,
} from './errors/domainErrors';

/**
 * Central place that converts a thrown error into a JSON error response with the
 * right HTTP status code, so individual route handlers don't each need to know
 * which business-rule violation maps to which status.
 */
export function errorToResponse(err) {
  const mapping = [
    [NotFoundError, 404, 'NotFound'],
    [ValidationError, 400, 'ValidationError'],
    [PastEventError, 400, 'PastEvent'],
    [EventFullError, 409, 'EventFull'],
    [DuplicateRegistrationError, 409, 'DuplicateRegistration'],
  ];

  for (const [ErrorType, status, errorName] of mapping) {
    if (err instanceof ErrorType) {
      return NextResponse.json({ error: errorName, message: err.message, statusCode: status }, { status });
    }
  }

  // Malformed JSON bodies throw a SyntaxError from request.json().
  if (err instanceof SyntaxError) {
    return NextResponse.json(
      { error: 'ValidationError', message: 'Request body must be valid JSON.', statusCode: 400 },
      { status: 400 }
    );
  }

  console.error(err);
  return NextResponse.json(
    { error: 'InternalServerError', message: 'An unexpected error occurred.', statusCode: 500 },
    { status: 500 }
  );
}

/** Parses a route param into a positive integer id, throwing ValidationError if malformed. */
export function parseIntParam(value, paramName = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(`${paramName} must be a positive integer.`);
  }
  return id;
}
