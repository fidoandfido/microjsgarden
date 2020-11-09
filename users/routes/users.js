var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.user.scopes.has('users:get')) {
    res.send('respond with a resource');
  }
  return res.status(403).json({ success: false });
});

module.exports = router;
