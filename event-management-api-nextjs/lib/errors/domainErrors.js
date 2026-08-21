/**
 * Base class for all predictable domain/business-rule errors. Route handlers catch
 * these centrally (see lib/http.js) and map them to the appropriate HTTP status code,
 * instead of scattering status-code knowledge throughout the business logic.
 */
export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** The requested event or registration does not exist. Maps to 404. */
export class NotFoundError extends DomainError {}

/** Input failed validation (missing/invalid fields). Maps to 400. */
export class ValidationError extends DomainError {}

/** Attempted to register for an event whose date has already passed. Maps to 400. */
export class PastEventError extends DomainError {}

/** Attempted to register for an event that is already at max capacity. Maps to 409. */
export class EventFullError extends DomainError {}

/** A user tried to register for an event they are already registered for. Maps to 409. */
export class DuplicateRegistrationError extends DomainError {}
