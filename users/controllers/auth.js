const Promise = require('bluebird');
const passport = require('passport');
const logger = require('../logger');
const AuthError = require('../errors/AuthError');
const APIError = require('../errors/APIError');
const User = require('../models/User');

function refreshCookieConfig(hostname) {
  return {
    domain: hostname,
    httpOnly: true,
    path: process.env.NODE_ENV === 'test' ? '/auth/refresh' : '/api/v1/auth/refresh',
    secure: !['development', 'test'].includes(process.env.NODE_ENV),
  };
}

exports.login = function login(req, res, next) {
    passport.authenticate('basic', (err, user, _info) => {
        if (err || !user) {
            return next(new AuthError());
        }
        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;
        return res
            .cookie('refresh_token', user.refreshToken(), refreshCookieConfig(req.hostname))
            .json({
                success: true,
                payload: user.token(),
            });
   })(req, res, next);
};

exports.logout = function logout(req, res) {
    return res.clearCookie('refresh_token', refreshCookieConfig(req.hostname)).json({ success: true });
};

exports.refreshToken = function refreshToken(req, res, next) {
    passport.authenticate('cookie', { session: false }, (err, user, _info) => {
        if (err || !user) {
            return next(new AuthError());
        }
        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;
        return res
            .cookie('refresh_token', user.refreshToken(), refreshCookieConfig(req.hostname))
            .json({
                success: true,
                payload: user.token([], false),
            });
    })(req, res, next);
};

exports.createAccount = function createAccount(req, res, next) {
    // Immediatly return failure if the password is not there.
    if (!req.body.password) {
        const error = new APIError('Password is required');
        return next(error);
    }
    // Immediatly return failure if the password is not there.
    if (!req.body.name) {
        const error = new APIError('Name is required');
        return next(error);
    }
    if (!req.body.email) {
        const error = new APIError('Email is required');
        return next(error);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
        const error = new APIError('Not an email');
        return next(error);
    }
    // Create userFromRequest object so we drop any other fields a malicious user has sent us.
    const userFromRequest = {
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
    };
    // Init user and add missing fields.
    console.log(User);
    const user = new User(userFromRequest);
    return user.save()
        .then((savedUser) => {
            console.log({
                action: 'Created',
                resource: 'User',
                id: savedUser.id,
            });
            res.json({
                success: true,
            });
        })
        .catch((err) => {
            logger.error(err)
            next(err);
        })
};
