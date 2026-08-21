export function toEventResponse(event, registeredCount) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    maxCapacity: event.maxCapacity,
    registeredCount,
    availableSpots: Math.max(0, event.maxCapacity - registeredCount),
    isPastEvent: new Date(event.date).getTime() < Date.now(),
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export function toRegistrationResponse(registration) {
  return {
    id: registration.id,
    eventId: registration.eventId,
    userId: registration.userId,
    registeredAt: registration.registeredAt,
  };
}
