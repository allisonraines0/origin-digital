# Event Management API — Node.js / Next.js

A REST API for managing events and attendee registrations, built with **Next.js (App Router Route Handlers)** running on Node.js, using in-memory storage. Authentication/authorization is intentionally out of scope. This was verified end-to-end in development: all unit tests pass, `next build` compiles cleanly, and every endpoint was exercised with real HTTP requests against a running dev server.

## Project layout

```
event-management-api-nextjs/
  app/
    layout.js                                  # Root layout (required by App Router)
    page.js                                     # Landing page listing the API endpoints
    api/
      events/
        route.js                                # GET (list), POST (create)
        [id]/
          route.js                              # GET, PUT, DELETE by id
          registrations/
            route.js                            # GET (list), POST (register)
            [userId]/
              route.js                           # DELETE (unregister)
  lib/
    errors/domainErrors.js                       # Domain exceptions (map to HTTP status codes)
    repositories/eventRepository.js               # In-memory event store
    repositories/registrationRepository.js         # In-memory registration store
    services/eventService.js                      # Event business logic
    services/registrationService.js                # Registration business rules
    store.js                                       # Singleton wiring (HMR-safe, see below)
    serializers.js                                 # Internal model -> API response shape
    http.js                                        # Error -> HTTP response mapping, param parsing
  tests/
    eventService.test.js
    registrationService.test.js
  jest.config.js
  jsconfig.json                                    # "@/..." import alias
  next.config.js
  package.json
```

Same separation of concerns as a typical layered backend: **route handlers** in `app/api/**/route.js` only translate HTTP <-> JSON, **services** in `lib/services` own every business rule and are framework-agnostic (no Next.js imports at all, so they're trivially unit-testable), and **repositories** are swappable storage.

## Prerequisites

- Node.js 18.18+ (Next.js 16 requirement)

## Install & run

```bash
npm install
npm run dev      # starts on http://localhost:3000
```

Visit `http://localhost:3000` for a summary of the endpoints, or hit `/api/events` directly.

```bash
npm run build && npm start   # production build + run
```

## Run the tests

```bash
npm test
# or, to re-run on save:
npm run test:watch
```

33 Jest tests cover the service layer (business rules), using `next/jest` so the same SWC compilation Next.js uses for the app applies to the tests.

## Business rules implemented

All enforced in `lib/services/registrationService.js`, each with its own error class so `lib/http.js` can map it to the right HTTP status centrally:

| Rule | Error | HTTP Status |
|---|---|---|
| Cannot register for a past event | `PastEventError` | 400 |
| Cannot exceed event capacity | `EventFullError` | 409 |
| Cannot double-register the same user for the same event | `DuplicateRegistrationError` | 409 |
| Referenced event/registration doesn't exist | `NotFoundError` | 404 |
| Invalid input (blank title, non-positive capacity, etc.) | `ValidationError` | 400 |

### A note on concurrency (why there's no locking here, unlike the C# version)

The earlier ASP.NET Core version of this API used an explicit per-event lock around the "check capacity/duplicate, then insert" sequence, because a multi-threaded runtime can genuinely interleave two requests partway through that sequence. **Node.js doesn't have that problem** — it executes JavaScript on a single thread, and every operation in `register()` is synchronous (no `await` between the checks and the write), so the whole sequence runs as one uninterruptible unit for a given request. That's why the same guarantee falls out for free here; the equivalent test in `tests/registrationService.test.js` (`interleaved synchronous registrations never exceed capacity`) verifies it. (If registration ever needed to `await` something — e.g., a real database call — that atomicity would need to be re-established explicitly, e.g. via a DB transaction or an application-level mutex.)

## API Reference

### Events

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/events` | List all events |
| `GET` | `/api/events/:id` | Get a single event |
| `POST` | `/api/events` | Create an event |
| `PUT` | `/api/events/:id` | Update an event (partial — only supplied fields change) |
| `DELETE` | `/api/events/:id` | Delete an event |

**Create/Update body:**
```json
{
  "title": "Annual Tech Conference",
  "description": "A conference about tech.",
  "date": "2026-11-05T09:00:00Z",
  "maxCapacity": 200
}
```

**Event response:**
```json
{
  "id": 1,
  "title": "Annual Tech Conference",
  "description": "A conference about tech.",
  "date": "2026-11-05T09:00:00.000Z",
  "maxCapacity": 200,
  "registeredCount": 3,
  "availableSpots": 197,
  "isPastEvent": false,
  "createdAt": "2026-08-19T12:00:00.000Z",
  "updatedAt": null
}
```

### Registrations

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/events/:id/registrations` | List registrations for an event |
| `POST` | `/api/events/:id/registrations` | Register a user (`{ "userId": "user-123" }`) |
| `DELETE` | `/api/events/:id/registrations/:userId` | Unregister a user |

## Example requests (curl)

```bash
# Create an event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Tech Meetup","description":"Monthly meetup","date":"2026-12-01T18:00:00Z","maxCapacity":2}'

# Register a user
curl -X POST http://localhost:3000/api/events/1/registrations \
  -H "Content-Type: application/json" \
  -d '{"userId":"alice"}'

# Try to double-register (returns 409)
curl -X POST http://localhost:3000/api/events/1/registrations \
  -H "Content-Type: application/json" \
  -d '{"userId":"alice"}'

# Unregister
curl -X DELETE http://localhost:3000/api/events/1/registrations/alice
```

## Design notes / assumptions

- **Storage**: plain in-memory `Map`s inside repository classes, wired up once in `lib/store.js` and stashed on `globalThis` so the data survives Next.js's dev-mode hot-module-reloading (without that, every file save during `next dev` would silently reset your data — a Next.js-specific gotcha this project accounts for). Data still resets on process restart, per the "in-memory" requirement.
- **User identity**: since auth is out of scope, `userId` is a free-text string supplied in the registration request body rather than derived from a session/token.
- **Partial updates**: `PUT /api/events/:id` accepts any subset of fields; only fields present in the body are applied.
- **Shrinking capacity**: an update that would reduce `maxCapacity` below the current registration count is rejected (400) rather than silently orphaning existing registrations.
- **Route params are awaited**: Next.js 15+ made dynamic route `params` an async value; every handler does `const { id } = await params;` to stay correct on current and future Next.js versions.
- **Deleting events**: included for parity with "standard CRUD" even though the original spec only listed create/read/update; trivial to remove if not wanted.
