
const express = require('express');

const router = express.Router();

// These are the explicit api routes that can be accesses without prior authorisation
// 
// auth routes are allowed - you don't need authorisation to log in!
const validRoutes = [
  /api\/v[0-9]+\/auth\/.*/,
];

router.all(validRoutes, (_req, res, _next) => {
  res.send('No auth needed');
});

module.exports = router;
