# origin-digital
n event management system: an Angular front end and a Next.js API, developed together as a
monorepo. Users can browse events, view capacity/availability, register or unregister for an
event, and organizers can create, edit, and delete events.

## Repository layout

```
origin-digital/
  event-management-api-nextjs/   Next.js (App Router) REST API — business logic + in-memory storage
  event-management-ui/           Angular 19 single-page app — consumes the API
```

Each project is independent (own `package.json`, own dependency tree, own test runner) but the UI
is built to talk to the API, so the typical workflow runs both together.

| | API | UI |
|---|---|---|
| Framework | Next.js 16 (App Router Route Handlers) | Angular 19 |
| Language | JavaScript | TypeScript |
| Runtime | Node.js | Browser (served via `ng serve` / static build) |
| Storage | In-memory (`Map`, process lifetime only) | — (calls the API) |
| Tests | Jest (`next/jest`) | Karma + Jasmine (none currently written) |

See each project's own README for full details:
- [`event-management-api-nextjs/README.md`](./event-management-api-nextjs/README.md)
- `event-management-ui/README.md` (Angular CLI default, if present)

## Prerequisites

- Node.js 18.18+ (required by Next.js 16)
- npm

## Getting started

Run the API and UI in two terminals — the Angular dev server proxies `/api/*` requests to the API
(see `event-management-ui/proxy.conf.json`), so the browser never makes a cross-origin request in
development.

**1. Start the API** (http://localhost:3000):

```bash
cd event-management-api-nextjs
npm install
npm run dev
```

**2. Start the UI** (http://localhost:4200):

```bash
cd event-management-ui
npm install
npm start
```

Open http://localhost:4200 to use the app. The API alone can also be exercised directly — visit
http://localhost:3000 for a summary of endpoints, or see the API README for `curl` examples.

## Running tests

```bash
# API — 33 Jest tests covering the service (business rule) layer
cd event-management-api-nextjs && npm test

# UI — Karma/Jasmine runner is wired up, but no spec files exist yet
cd event-management-ui && npm test
