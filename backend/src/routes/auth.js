const express = require('express');
const router = express.Router();
const querystring = require('querystring');

// Placeholder Google OAuth redirect
router.get('/google', (req, res) => {
  const googleUrl = process.env.GOOGLE_OAUTH_URL;
  if (googleUrl) return res.redirect(googleUrl);
  // If not configured, return instructions
  return res.status(501).json({ success: false, error: 'Google OAuth não configurado. Defina GOOGLE_OAUTH_URL no .env' });
});

module.exports = router;
