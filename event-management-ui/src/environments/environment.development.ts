export const environment = {
  production: false,
  // Relative path: ng serve's dev-server proxy (see proxy.conf.json) forwards this
  // to http://localhost:3000, so the browser never makes a cross-origin request at
  // all during local development — no CORS involved.
  apiBaseUrl: '/api',
};
