
const express = require('express');

const router = express.Router();

router.all('*', (req, res, _next) => {
  res.send('No auth needed');
});

module.exports = router;
