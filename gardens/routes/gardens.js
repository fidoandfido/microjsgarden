var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(_req, res, _next) {
  const gardens = {
    gardens: [
        {
            id: 0,
            name: "Front main",
        },
        {
            id: 1,
            name: "Pool"
        }
    ]
  }
  res.send(JSON.stringify(gardens));
});

module.exports = router;