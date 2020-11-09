var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const jwt = require('express-jwt');

var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');

const jwtPublicKey = process.env.JWT_INTERNAL_PUBLIC_KEY
  || (process.env.NODE_ENV === 'test' && 'dummy value for test');


require('./config/passport');
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  jwt({ secret: jwtPublicKey, algorithms: ['RS256']}).unless({
    path: [/^\/auth\/.*/]
  }),
);

app.use('/auth', authRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, _req, res, _next) => {
  if (err.userSafe) {
    delete err.userSafe;
    return res.status(err.status || 500).json({
      success: false,
      error: err instanceof Error ? err.toString() : err,
    });
  }
  return res.status(err.status || 500).json({ success: false });
});

module.exports = app;
