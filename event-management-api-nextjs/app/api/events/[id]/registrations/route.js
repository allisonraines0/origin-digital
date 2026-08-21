import { NextResponse } from 'next/server';
import { registrationService } from '@/lib/store';
import { toRegistrationResponse } from '@/lib/serializers';
import { errorToResponse, parseIntParam } from '@/lib/http';

/** GET /api/events/:id/registrations — list registrations for an event. */
export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params;
    const eventId = parseIntParam(rawId, 'Event id');
    const registrations = registrationService.getRegistrationsForEvent(eventId);
    return NextResponse.json(registrations.map(toRegistrationResponse));
  } catch (err) {
    return errorToResponse(err);
  }
}

/**
 * POST /api/events/:id/registrations — register a user for an event. Body: { userId }.
 * Enforces: no past events, no exceeding capacity, no double-registration.
 */
export async function POST(request, { params }) {
  try {
    const { id: rawId } = await params;
    const eventId = parseIntParam(rawId, 'Event id');
    const body = await request.json();
    const registration = registrationService.register(eventId, body.userId);
    return NextResponse.json(toRegistrationResponse(registration), { status: 201 });
  } catch (err) {
    return errorToResponse(err);
  }
}
