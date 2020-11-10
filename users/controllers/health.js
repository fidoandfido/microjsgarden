const controller = {};

controller.alive = function ready(_req, res, _next) {
  res.json({ version: process.env.npm_package_version, success: true });
};

controller.ready = function ready(_req, res, _next) {
  res.json({
    success: true,
    payload: {
      success: true,
      ready: true,
    },
  });
};

module.exports = controller;
