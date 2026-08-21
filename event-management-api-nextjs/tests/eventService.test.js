import { EventRepository } from '@/lib/repositories/eventRepository';
import { RegistrationRepository } from '@/lib/repositories/registrationRepository';
import { EventService } from '@/lib/services/eventService';
import { RegistrationService } from '@/lib/services/registrationService';
import { NotFoundError, ValidationError } from '@/lib/errors/domainErrors';

function validCreateRequest(overrides = {}) {
  return {
    title: 'Annual Conference',
    description: 'A great conference.',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    maxCapacity: 10,
    ...overrides,
  };
}

describe('EventService', () => {
  let eventRepository;
  let registrationRepository;
  let sut; // system under test

  beforeEach(() => {
    eventRepository = new EventRepository();
    registrationRepository = new RegistrationRepository();
    sut = new EventService(eventRepository, registrationRepository);
  });

  test('create with valid data returns an event with a generated id', () => {
    const result = sut.create(validCreateRequest());

    expect(result.id).toBeGreaterThan(0);
    expect(result.title).toBe('Annual Conference');
    expect(result.maxCapacity).toBe(10);
  });

  test.each(['', '   '])('create with empty title "%s" throws ValidationError', (title) => {
    expect(() => sut.create(validCreateRequest({ title }))).toThrow(ValidationError);
  });

  test.each([0, -5, 1.5])('create with invalid maxCapacity %p throws ValidationError', (maxCapacity) => {
    expect(() => sut.create(validCreateRequest({ maxCapacity }))).toThrow(ValidationError);
  });

  test('create with an invalid date throws ValidationError', () => {
    expect(() => sut.create(validCreateRequest({ date: 'not-a-date' }))).toThrow(ValidationError);
  });

  test('getById returns the matching event', () => {
    const created = sut.create(validCreateRequest());

    const result = sut.getById(created.id);

    expect(result).toEqual(created);
  });

  test('getById with a non-existent id throws NotFoundError', () => {
    expect(() => sut.getById(9999)).toThrow(NotFoundError);
  });

  test('getAll returns all created events', () => {
    sut.create(validCreateRequest());
    sut.create(validCreateRequest());

    expect(sut.getAll()).toHaveLength(2);
  });

  test('getAll orders events by date ascending', () => {
    sut.create(validCreateRequest({ date: new Date(Date.now() + 30 * 86400000).toISOString() }));
    sut.create(validCreateRequest({ date: new Date(Date.now() + 5 * 86400000).toISOString() }));
    sut.create(validCreateRequest({ date: new Date(Date.now() + 15 * 86400000).toISOString() }));

    const result = sut.getAll();

    const dates = result.map((e) => new Date(e.date).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  test('update with a partial payload changes only the specified fields', () => {
    const created = sut.create(validCreateRequest());

    const updated = sut.update(created.id, { title: 'Updated Title' });

    expect(updated.title).toBe('Updated Title');
    expect(updated.description).toBe(created.description);
    expect(updated.date).toBe(created.date);
    expect(updated.updatedAt).not.toBeNull();
  });

  test('update on a non-existent event throws NotFoundError', () => {
    expect(() => sut.update(9999, { title: 'X' })).toThrow(NotFoundError);
  });

  test('update with an empty title throws ValidationError', () => {
    const created = sut.create(validCreateRequest());

    expect(() => sut.update(created.id, { title: '   ' })).toThrow(ValidationError);
  });

  test('update rejects maxCapacity below the current registration count', () => {
    const created = sut.create(validCreateRequest({ maxCapacity: 2 }));
    const registrationService = new RegistrationService(eventRepository, registrationRepository);
    registrationService.register(created.id, 'user1');
    registrationService.register(created.id, 'user2');

    expect(() => sut.update(created.id, { maxCapacity: 1 })).toThrow(ValidationError);
  });

  test('delete removes an existing event', () => {
    const created = sut.create(validCreateRequest());

    sut.delete(created.id);

    expect(() => sut.getById(created.id)).toThrow(NotFoundError);
  });

  test('delete on a non-existent event throws NotFoundError', () => {
    expect(() => sut.delete(9999)).toThrow(NotFoundError);
  });
});
