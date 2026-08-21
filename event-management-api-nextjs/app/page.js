const endpoints = [
  { method: 'GET', path: '/api/events', desc: 'List all events' },
  { method: 'GET', path: '/api/events/:id', desc: 'Get a single event' },
  { method: 'POST', path: '/api/events', desc: 'Create an event' },
  { method: 'PUT', path: '/api/events/:id', desc: 'Update an event (partial)' },
  { method: 'DELETE', path: '/api/events/:id', desc: 'Delete an event' },
  { method: 'GET', path: '/api/events/:id/registrations', desc: 'List registrations for an event' },
  { method: 'POST', path: '/api/events/:id/registrations', desc: 'Register a user for an event' },
  { method: 'DELETE', path: '/api/events/:id/registrations/:userId', desc: 'Unregister a user' },
];

export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: '3rem auto', padding: '0 1.5rem', lineHeight: 1.6 }}>
      <h1>Event Management API</h1>
      <p>
        REST API for managing events and attendee registrations, built with Next.js Route
        Handlers and in-memory storage. This page is just a landing page — the API lives
        under <code>/api</code>.
      </p>
      <table cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
            <th>Method</th>
            <th>Path</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((e) => (
            <tr key={`${e.method} ${e.path}`} style={{ borderBottom: '1px solid #eee' }}>
              <td>
                <strong>{e.method}</strong>
              </td>
              <td>
                <code>{e.path}</code>
              </td>
              <td>{e.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
