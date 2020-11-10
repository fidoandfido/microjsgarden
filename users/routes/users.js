const express = require('express');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, _next) => {
  if (req.user.scopes.has('users:get')) {
    res.send('respond with a resource');
  }
  return res.status(403).json({ success: false });
});

module.exports = router;
