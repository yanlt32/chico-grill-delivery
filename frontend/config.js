// Frontend API endpoint configuration.
// Local development fallback when frontend is served on port 5000 and backend runs on port 3000.
const frontendPort = window.location.port;
window.API_URL = window.API_URL || (frontendPort === '5000'
  ? `${window.location.protocol}//${window.location.hostname}:3000/api`
  : '/api');

// For a single-service deployment on Render, the backend is served from the same origin.
