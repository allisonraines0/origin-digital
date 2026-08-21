export const metadata = {
  title: 'Event Management API',
  description: 'REST API for managing events and attendee registrations (in-memory storage).',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>{children}</body>
    </html>
  );
}
