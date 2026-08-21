import {
  NotFoundError,
  ValidationError,
  PastEventError,
  EventFullError,
  DuplicateRegistrationError,
} from '../errors/domainErrors';

export class RegistrationService {
  constructor(eventRepository, registrationRepository) {
    this.eventRepository = eventRepository;
    this.registrationRepository = registrationRepository;
  }

  register(eventId, userId) {
    if (!userId || !String(userId).trim()) {
      throw new ValidationError('userId is required.');
    }

    const event = this.eventRepository.getById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with id ${eventId} was not found.`);
    }

    // Business rule: cannot register for past events.
    if (new Date(event.date).getTime() < Date.now()) {
      throw new PastEventError(`Cannot register for event '${event.title}' because it has already occurred.`);
    }

    // Everything below is synchronous, so — because Node executes JS on a single thread —
    // this check-then-act sequence can't be interleaved by another request. That gives us
    // the same "no double booking / no overbooking" guarantee a lock would provide in a
    // multi-threaded runtime, without needing one here.

    // Business rule: cannot double-register the same user for the same event.
    const existingRegistration = this.registrationRepository.get(eventId, userId);
    if (existingRegistration) {
      throw new DuplicateRegistrationError(`User '${userId}' is already registered for event '${event.title}'.`);
    }

    // Business rule: cannot exceed event capacity.
    const currentCount = this.registrationRepository.countForEvent(eventId);
    if (currentCount >= event.maxCapacity) {
      throw new EventFullError(`Event '${event.title}' has reached its maximum capacity of ${event.maxCapacity}.`);
    }

    return this.registrationRepository.add({
      eventId,
      userId: String(userId).trim(),
      registeredAt: new Date().toISOString(),
    });
  }

  unregister(eventId, userId) {
    if (!userId || !String(userId).trim()) {
      throw new ValidationError('userId is required.');
    }

    if (!this.eventRepository.exists(eventId)) {
      throw new NotFoundError(`Event with id ${eventId} was not found.`);
    }

    const removed = this.registrationRepository.remove(eventId, userId);
    if (!removed) {
      throw new NotFoundError(`User '${userId}' is not registered for event ${eventId}.`);
    }
  }

  getRegistrationsForEvent(eventId) {
    if (!this.eventRepository.exists(eventId)) {
      throw new NotFoundError(`Event with id ${eventId} was not found.`);
    }
    return this.registrationRepository.getByEvent(eventId);
  }
}
