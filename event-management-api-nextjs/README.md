# Event Management API — Node.js / Next.js

A REST API for managing events and attendee registrations, using in-memory storage. Authentication/authorization is intentionally out of scope.

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
