require('./config/passport');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const jwt = require('express-jwt');

const healthRouter = require('./routes/health');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const jwtPublicKey = process.env.JWT_INTERNAL_PUBLIC_KEY
  || (process.env.NODE_ENV === 'test' && 'dummy value for test');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  jwt({ secret: jwtPublicKey, algorithms: ['RS256'] }).unless({
    path: [/^\/auth\/.*/, /^\/health\/.*/],
  }),
);

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, _req, res) => {
  const error = err;
  if (err.userSafe) {
    delete error.userSafe;
    return res.status(error.status || 500).json({
      success: false,
      error: err instanceof Error ? err.toString() : err,
    });
  }
  return res.status(err.status || 500).json({ success: false });
});

module.exports = app;
