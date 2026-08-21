/** In-memory store for event registrations, keyed by numeric id. */
export class RegistrationRepository {
  constructor() {
    this._registrations = new Map();
    this._nextId = 0;
  }

  add(registrationData) {
    const id = ++this._nextId;
    const registration = { id, ...registrationData };
    this._registrations.set(id, registration);
    return registration;
  }

  get(eventId, userId) {
    const normalizedUserId = userId.toLowerCase();
    for (const registration of this._registrations.values()) {
      if (registration.eventId === eventId && registration.userId.toLowerCase() === normalizedUserId) {
        return registration;
      }
    }
    return null;
  }

  remove(eventId, userId) {
    const existing = this.get(eventId, userId);
    if (!existing) return false;
    return this._registrations.delete(existing.id);
  }

  getByEvent(eventId) {
    return Array.from(this._registrations.values())
      .filter((r) => r.eventId === eventId)
      .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
  }

  countForEvent(eventId) {
    let count = 0;
    for (const registration of this._registrations.values()) {
      if (registration.eventId === eventId) count++;
    }
    return count;
  }
}
