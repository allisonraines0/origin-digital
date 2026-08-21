# Registration Desk — Angular front end

## Screenshots

**List view** — capacity gauge per event, color-coded by fill level:

Events show a title, date, and a horizontal gauge (`registeredCount / maxCapacity`)
that goes green → amber → red as it fills. 
<img width="1440" height="768" alt="Screen Shot 2026-08-20 at 9 26 12 PM" src="https://github.com/user-attachments/assets/d6ddc948-8ad2-4c02-a4bd-c4e608c4f995" />


**Detail view** — registration manifest with inline register/unregister:

Shows the event's full capacity gauge, a register form (hidden once the event is
past or full, with an explanatory message instead), and a list of everyone
registered with a per-row "Unregister" action.
<img width="1440" height="768" alt="Screen Shot 2026-08-20 at 9 25 50 PM" src="https://github.com/user-attachments/assets/6d68743b-23f6-4980-a0f9-ee91298604e1" />
<img width="1440" height="768" alt="Screen Shot 2026-08-20 at 9 25 27 PM" src="https://github.com/user-attachments/assets/d64c2652-674e-48cf-a1d3-cd51c4920dd5" />
<img width="1440" height="768" alt="Screen Shot 2026-08-20 at 9 25 16 PM" src="https://github.com/user-attachments/assets/7d408033-1233-4796-b489-1277257c5f19" />


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
- The backend running — see the event-management-api-nextjs's own README. By default this app
  expects it at `http://localhost:3000` in development.

## Install & run

```bash
npm install
npm start          # ng serve — http://localhost:4200
```

## Run the tests

```bash
npm test
```

Runs the Karma/Jasmine unit test scaffolding Angular CLI generates by default.
