// Frontend API endpoint configuration.
// Local development fallback when frontend is served on localhost.
window.API_URL = window.API_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api');

// For a single-service deployment on Render, the backend is served from the same origin.
