/**
 * In-memory store for events, keyed by numeric id.
 *
 * Node.js runs JavaScript on a single thread, so — unlike a multi-threaded backend —
 * a synchronous read-modify-write sequence against this Map can never be interrupted
 * partway through by another request. That property is what lets RegistrationRepository
 * enforce "no double booking / no over capacity" without any explicit locking.
 */
export class EventRepository {
  constructor() {
    this._events = new Map();
    this._nextId = 0;
  }

  add(eventData) {
    const id = ++this._nextId;
    const event = { id, ...eventData };
    this._events.set(id, event);
    return event;
  }

  getById(id) {
    return this._events.get(id) ?? null;
  }

  getAll() {
    return Array.from(this._events.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  update(event) {
    this._events.set(event.id, event);
    return event;
  }

  delete(id) {
    return this._events.delete(id);
  }

  exists(id) {
    return this._events.has(id);
  }
}
