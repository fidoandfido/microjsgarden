var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var authorise = require('./routes/authorise');
var noAuthReq = require('./routes/noAuthReq');
var defaultRoutes = require('./routes/defaultRoutes');

var app = express();

// Routes - these will drop through to the defaultRoutes
app.use('/', noAuthReq);
app.use('/api', authorise);
app.use('/', defaultRoutes);

// error handler
app.use((err, req, res, _next) => {
  const errorStatus = err.status || 500;
  res.status(errorStatus).json({
    message: 'Unauthorized',
    type: 'Authentication/Authorization',
    errors: ['Unauthorized'],
  });
});
module.exports = app;
