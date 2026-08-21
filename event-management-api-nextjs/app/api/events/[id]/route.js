import { NextResponse } from 'next/server';
import { eventService, registrationRepository } from '@/lib/store';
import { toEventResponse } from '@/lib/serializers';
import { errorToResponse, parseIntParam } from '@/lib/http';

/** GET /api/events/:id — get a single event. */
export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseIntParam(rawId, 'Event id');
    const event = eventService.getById(id);
    return NextResponse.json(toEventResponse(event, registrationRepository.countForEvent(id)));
  } catch (err) {
    return errorToResponse(err);
  }
}

/** PUT /api/events/:id — partially update an event. Only supplied fields are changed. */
export async function PUT(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseIntParam(rawId, 'Event id');
    const body = await request.json();
    const updated = eventService.update(id, body);
    return NextResponse.json(toEventResponse(updated, registrationRepository.countForEvent(id)));
  } catch (err) {
    return errorToResponse(err);
  }
}

/** DELETE /api/events/:id — delete an event. */
export async function DELETE(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseIntParam(rawId, 'Event id');
    eventService.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorToResponse(err);
  }
}
