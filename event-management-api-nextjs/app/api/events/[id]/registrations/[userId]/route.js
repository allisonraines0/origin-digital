import { NextResponse } from 'next/server';
import { registrationService } from '@/lib/store';
import { errorToResponse, parseIntParam } from '@/lib/http';

/** DELETE /api/events/:id/registrations/:userId — unregister a user from an event. */
export async function DELETE(request, { params }) {
  try {
    const { id: rawId, userId: rawUserId } = await params;
    const eventId = parseIntParam(rawId, 'Event id');
    const userId = decodeURIComponent(rawUserId);
    registrationService.unregister(eventId, userId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorToResponse(err);
  }
}
