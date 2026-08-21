import { EventRepository } from '@/lib/repositories/eventRepository';
import { RegistrationRepository } from '@/lib/repositories/registrationRepository';
import { EventService } from '@/lib/services/eventService';
import { RegistrationService } from '@/lib/services/registrationService';
import {
  NotFoundError,
  ValidationError,
  PastEventError,
  EventFullError,
  DuplicateRegistrationError,
} from '@/lib/errors/domainErrors';

describe('RegistrationService', () => {
  let eventRepository;
  let registrationRepository;
  let eventService;
  let sut; // system under test

  beforeEach(() => {
    eventRepository = new EventRepository();
    registrationRepository = new RegistrationRepository();
    eventService = new EventService(eventRepository, registrationRepository);
    sut = new RegistrationService(eventRepository, registrationRepository);
  });

  function createEvent({ maxCapacity = 10, date } = {}) {
    return eventService.create({
      title: 'Test Event',
      description: 'Description',
      date: (date ?? new Date(Date.now() + 7 * 86400000)).toISOString(),
      maxCapacity,
    });
  }

  test('register with a valid request creates a registration', () => {
    const event = createEvent();

    const registration = sut.register(event.id, 'user-1');

    expect(registration.id).toBeGreaterThan(0);
    expect(registration.eventId).toBe(event.id);
    expect(registration.userId).toBe('user-1');
  });

  test('register for a non-existent event throws NotFoundError', () => {
    expect(() => sut.register(9999, 'user-1')).toThrow(NotFoundError);
  });

  test('register with an empty userId throws ValidationError', () => {
    const event = createEvent();

    expect(() => sut.register(event.id, '   ')).toThrow(ValidationError);
  });

  test('register for a past event throws PastEventError', () => {
    const event = createEvent({ date: new Date(Date.now() - 86400000) });

    expect(() => sut.register(event.id, 'user-1')).toThrow(PastEventError);
  });

  test('register beyond max capacity throws EventFullError', () => {
    const event = createEvent({ maxCapacity: 2 });
    sut.register(event.id, 'user-1');
    sut.register(event.id, 'user-2');

    expect(() => sut.register(event.id, 'user-3')).toThrow(EventFullError);
  });

  test('registering up to exact capacity all succeed', () => {
    const event = createEvent({ maxCapacity: 3 });

    sut.register(event.id, 'user-1');
    sut.register(event.id, 'user-2');
    sut.register(event.id, 'user-3');

    expect(sut.getRegistrationsForEvent(event.id)).toHaveLength(3);
  });

  test('registering the same user twice throws DuplicateRegistrationError', () => {
    const event = createEvent();
    sut.register(event.id, 'user-1');

    expect(() => sut.register(event.id, 'user-1')).toThrow(DuplicateRegistrationError);
  });

  test('duplicate detection is case-insensitive', () => {
    const event = createEvent();
    sut.register(event.id, 'User-1');

    expect(() => sut.register(event.id, 'user-1')).toThrow(DuplicateRegistrationError);
  });

  test('unregister removes an existing registration', () => {
    const event = createEvent();
    sut.register(event.id, 'user-1');

    sut.unregister(event.id, 'user-1');

    expect(sut.getRegistrationsForEvent(event.id)).toHaveLength(0);
  });

  test('unregister a non-existent registration throws NotFoundError', () => {
    const event = createEvent();

    expect(() => sut.unregister(event.id, 'user-1')).toThrow(NotFoundError);
  });

  test('unregister from a non-existent event throws NotFoundError', () => {
    expect(() => sut.unregister(9999, 'user-1')).toThrow(NotFoundError);
  });

  test('unregistering frees up a capacity slot for a new user', () => {
    const event = createEvent({ maxCapacity: 1 });
    sut.register(event.id, 'user-1');
    sut.unregister(event.id, 'user-1');

    expect(() => sut.register(event.id, 'user-2')).not.toThrow();
    expect(sut.getRegistrationsForEvent(event.id).map((r) => r.userId)).toEqual(['user-2']);
  });

  test('a user can re-register after unregistering', () => {
    const event = createEvent();
    sut.register(event.id, 'user-1');
    sut.unregister(event.id, 'user-1');

    expect(() => sut.register(event.id, 'user-1')).not.toThrow();
  });

  test('getRegistrationsForEvent returns all registered users', () => {
    const event = createEvent({ maxCapacity: 5 });
    sut.register(event.id, 'user-1');
    sut.register(event.id, 'user-2');

    const result = sut.getRegistrationsForEvent(event.id);

    expect(result.map((r) => r.userId).sort()).toEqual(['user-1', 'user-2']);
  });

  test('getRegistrationsForEvent on a non-existent event throws NotFoundError', () => {
    expect(() => sut.getRegistrationsForEvent(9999)).toThrow(NotFoundError);
  });

  test('interleaved synchronous registrations never exceed capacity', () => {
    // Simulates many "concurrent" callers by issuing all registration calls
    // back-to-back with no awaits in between — this is the realistic worst case
    // in Node's single-threaded model, since nothing can preempt a synchronous
    // call stack. All 20 attempts resolve deterministically against 5 spots.
    const event = createEvent({ maxCapacity: 5 });
    let successCount = 0;
    let fullCount = 0;

    for (let i = 0; i < 20; i++) {
      try {
        sut.register(event.id, `user-${i}`);
        successCount++;
      } catch (err) {
        if (err instanceof EventFullError) {
          fullCount++;
        } else {
          throw err;
        }
      }
    }

    expect(successCount).toBe(5);
    expect(fullCount).toBe(15);
    expect(sut.getRegistrationsForEvent(event.id)).toHaveLength(5);
  });
});
