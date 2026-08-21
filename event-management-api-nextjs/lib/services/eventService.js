import { NotFoundError, ValidationError } from '../errors/domainErrors';

export class EventService {
  constructor(eventRepository, registrationRepository) {
    this.eventRepository = eventRepository;
    this.registrationRepository = registrationRepository;
  }

  create({ title, description = '', date, maxCapacity } = {}) {
    if (!title || !String(title).trim()) {
      throw new ValidationError('Title is required.');
    }

    const parsedDate = new Date(date);
    if (!date || Number.isNaN(parsedDate.getTime())) {
      throw new ValidationError('A valid date is required.');
    }

    if (!Number.isInteger(maxCapacity) || maxCapacity <= 0) {
      throw new ValidationError('maxCapacity must be a positive integer.');
    }

    const now = new Date().toISOString();
    return this.eventRepository.add({
      title: String(title).trim(),
      description: String(description ?? '').trim(),
      date: parsedDate.toISOString(),
      maxCapacity,
      createdAt: now,
      updatedAt: null,
    });
  }

  getById(id) {
    const event = this.eventRepository.getById(id);
    if (!event) {
      throw new NotFoundError(`Event with id ${id} was not found.`);
    }
    return event;
  }

  getAll() {
    debugger;
    return this.eventRepository.getAll();
  }

  /**
   * Partial update — only fields present (and not undefined) in `updates` are applied,
   * so callers don't need to resend the whole event.
   */
  update(id, updates = {}) {
    const existing = this.getById(id);

    if (updates.title !== undefined) {
      if (!updates.title || !String(updates.title).trim()) {
        throw new ValidationError('Title cannot be empty.');
      }
      existing.title = String(updates.title).trim();
    }

    if (updates.description !== undefined) {
      existing.description = String(updates.description ?? '').trim();
    }

    if (updates.date !== undefined) {
      const parsedDate = new Date(updates.date);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new ValidationError('date is invalid.');
      }
      existing.date = parsedDate.toISOString();
    }

    if (updates.maxCapacity !== undefined) {
      if (!Number.isInteger(updates.maxCapacity) || updates.maxCapacity <= 0) {
        throw new ValidationError('maxCapacity must be a positive integer.');
      }
      const currentCount = this.registrationRepository.countForEvent(id);
      if (updates.maxCapacity < currentCount) {
        throw new ValidationError(
          `maxCapacity cannot be set below the current registration count (${currentCount}).`
        );
      }
      existing.maxCapacity = updates.maxCapacity;
    }

    existing.updatedAt = new Date().toISOString();
    return this.eventRepository.update(existing);
  }

  delete(id) {
    this.getById(id); // throws NotFoundError if missing
    this.eventRepository.delete(id);
  }
}
