# Registration Desk — Angular front end

## Screenshots

**List view** — capacity gauge per event, color-coded by fill level:

Events show a title, date, and a horizontal gauge (`registeredCount / maxCapacity`)
that goes green → amber → red as it fills. This is the app's one signature visual
device, and it's built from real data, not decoration.

**Detail view** — registration manifest with inline register/unregister:

Shows the event's full capacity gauge, a register form (hidden once the event is
past or full, with an explanatory message instead), and a list of everyone
registered with a per-row "Unregister" action.

## Project layout

```
src/app/
  core/
    models/               Event & Registration TypeScript interfaces, matching the API's JSON shape
    services/
      event.service.ts        HttpClient wrapper for /api/events
      registration.service.ts HttpClient wrapper for /api/events/:id/registrations
      error.util.ts            Pulls a human-readable message out of a failed HTTP response
  features/
    event-list/            Landing page: all events, capacity gauges, edit/delete
    event-form/             Reactive form, reused for both create and edit
    event-detail/           Event details, registration manifest, register/unregister
  shared/components/
    capacity-gauge/         The signature fill-level gauge, reused on list + detail
  app.routes.ts
  app.config.ts             Router + HttpClient providers
src/environments/
  environment.development.ts   apiBaseUrl: http://localhost:3000/api
  environment.ts                apiBaseUrl: /api (production — see Deployment below)
```

Each feature component owns its HTTP calls through the two core services and
holds its own local state with signals — there's no global store, because
nothing here needs to be shared across routes.

## Prerequisites

- Node.js 18.18+
- The backend running — see the Next.js API's own README. By default this app
  expects it at `http://localhost:3000` in development.

## Install & run

```bash
npm install
npm start          # ng serve — http://localhost:4200
```

In development, `ng serve` proxies any `/api/*` request to `http://localhost:3000`
(see `proxy.conf.json`, wired up in `angular.json`'s `serve` target). This means
the browser only ever talks to `localhost:4200` — the same origin the app itself
is served from — so **there is no cross-origin request during local development
at all**, and CORS is a non-issue by construction rather than by trusting the
backend's headers. `environment.development.ts` uses the relative path `/api`
for exactly this reason (not `http://localhost:3000/api`).

The backend's `proxy.js` still adds CORS headers independently (useful if you
ever call the API directly from a different origin — e.g. testing with curl, or
a future deployment where the frontend isn't proxied), but the Angular app
itself no longer depends on it working.

**If you see a CORS error in the browser console:** the dev-server proxy above
should make this impossible in normal use. If you still hit one:
- Confirm you're loading the app via `http://localhost:4200` (not opening
  `dist/.../index.html` directly, or serving the production build without a
  proxy in front — see "Building for production" below).
- Confirm the backend is actually running on port 3000 — `curl http://localhost:3000/api/events`.
- If you changed `proxy.conf.json` or `angular.json`, restart `ng serve` (dev-server
  config changes aren't picked up by the running process, only file edits are).
- If you've pointed `apiBaseUrl` at a different host/port, make sure `proxy.conf.json`'s
  `target` matches it.

## Run the tests

```bash
npm test
```

Runs the Karma/Jasmine unit test scaffolding Angular CLI generates by default.
The functional correctness of this app was primarily verified via a real
browser end-to-end pass during development (see the top of this file) rather
than component-level unit tests, since almost all of the logic here is either
template/HTTP wiring (best caught by an integration-style check) or already
covered by the backend's own unit test suite.

## Building for production

```bash
npm run build
```

Outputs to `dist/event-management-ui/browser`. Two things to know before you
deploy that output:

### 1. The API base URL becomes a relative path

`environment.ts` (used for production builds) sets `apiBaseUrl: '/api'` —
a **relative** path, not `http://localhost:3000/api`. This assumes you'll
deploy behind a reverse proxy / load balancer that forwards `/api/*` requests
to the backend, so the frontend and API appear same-origin in production (no
CORS needed there either). If you're deploying the frontend and API as
genuinely separate origins, override this before building:

```bash
# edit src/environments/environment.ts, or pass it in at build time via a
# fileReplacements entry pointing at an environment.production.ts of your own
```

### 2. The web server needs an SPA fallback

Angular's router handles URLs like `/events/3` entirely client-side. If you
`ng build` and serve the output with a plain static file server, a direct
visit (or refresh) on `/events/3` will 404, because there's no file at that
path — only `index.html` exists, and the router only takes over *after*
`index.html` has loaded and bootstrapped the app. You need the server
configured to fall back to `index.html` for any path that isn't a real file:

- **`http-server`**: run with `-P http://localhost:PORT?` — or simpler, use `serve` (`npx serve -s dist/event-management-ui/browser`), which has SPA fallback built in via `-s`.
- **nginx**: `try_files $uri $uri/ /index.html;`
- **Vercel/Netlify/Firebase Hosting**: supported out of the box via their standard SPA rewrite config.

(During development, `ng serve` already handles this for you — this only
matters once you're serving the static production build yourself.)

## Design notes

- **Visual identity**: a "registration desk" theme — navy (`#1f3a5f`) and brass
  (`#a97e1f`) with Zilla Slab headings over Inter body text and IBM Plex Mono
  for numbers/timestamps. Fonts load via a `<link>` in `index.html`
  (not a CSS `@import`) — Angular's production build tries to inline `@import`ed
  stylesheets at build time, which fails in network-restricted environments.
  Font-inlining optimization is explicitly disabled in `angular.json` for the
  same reason; the app still loads real fonts at runtime wherever normal
  internet access is available, falling back gracefully to system fonts otherwise.
- **Capacity gauge**: the one recurring signature visual (`shared/components/capacity-gauge`).
  Green under 75% full, amber 75–99%, red at capacity — encodes the actual
  registration count, not decorative.
- **Error handling**: every mutation (create, update, delete, register,
  unregister) surfaces the backend's actual error message (e.g. "Event 'X' has
  reached its maximum capacity of 2.") in an inline banner near the relevant
  form or section, rather than a generic failure message.
- **Partial updates**: the edit form reuses the create form component; only
  fields the user changes are sent as the PUT payload's shape matches what the
  API expects for a partial update.
