import { NextResponse } from 'next/server';
import { eventService, registrationRepository } from '@/lib/store';
import { toEventResponse } from '@/lib/serializers';
import { errorToResponse } from '@/lib/http';

/** GET /api/events — list all events. */
export async function GET() {
  try {
    const events = eventService.getAll();
    const payload = events.map((event) =>
      toEventResponse(event, registrationRepository.countForEvent(event.id))
    );
    return NextResponse.json(payload);
  } catch (err) {
    return errorToResponse(err);
  }
}

/** POST /api/events — create a new event. Body: { title, description, date, maxCapacity }. */
export async function POST(request) {
  try {
    const body = await request.json();
    const created = eventService.create(body);
    const response = toEventResponse(created, 0);
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    return errorToResponse(err);
  }
}
