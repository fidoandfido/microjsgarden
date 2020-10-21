const express = require('express');
const ejwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const {
  internalDuration,
  useJWT,
} = require('config');

const router = express.Router();
const {
  User,
} = require('../models');
const logger = require('../logger');

// Key to check auth with
const publickey = process.env.JWT_EXTERNAL_PUBLIC_KEY;

// Key to sign with (note: This is a different key!)
const privatekey = process.env.JWT_INTERNAL_PRIVATE_KEY;
const internalkey = process.env.JWT_INTERNAL_PUBLIC_KEY;

// Internal requests are authorised here.
router.all('*', (req, res, next) => {
  if (req.header('X-Gardens') && req.header('Authorization')) {
    try {
      const token = req.header('Authorization').split(' ')[1];
      jwt.verify(token, internalkey, { algorithm: 'RS256' });
      res.set('Authorization', req.header('Authorization'));
      return res.send('Authed');
    } catch (err) {
      logger.info('invalid internal request');
      logger.error(err);
      // If any error occured, just pass it along in case they
      // accidentally set the internal header
      return next();
    }
  }
  return next();
});

// Check the json web token
// If it checks out, then we can replace token with an 'internal' token for this request.
// This internal token will have a shorter expiry, reducing the possibility of replay attacks
// on specific services.
router.all('*', ejwt({
  secret: publickey,
  algorithms: ['RS256']
}), (req, res, next) => {
  const {
    sub,
  } = req.user;
  console.log(sub)
  // Translate UUID -> SQL Primary Key and Org ID
  User.findOne({
    attributes: ['unique_id'],
    where: [{
      unique_id: sub,
    }],
  }).then((user) => {
      const uid = sub;
      const {
        id,
      } = user;
      const scope = 'user';
      const newToken = jwt.sign({
        sub: id,
        scope,
        uid,
      }, privatekey, {
        expiresIn: internalDuration,
        issuer: 'garden',
        algorithm: 'RS256',
      });
      res.set('Authorization', `Bearer ${newToken}`);
      res.send('Authed');
    })
    .catch((err) => {
      // There was as issue retrieiving the user (most likely doesnt exist!) so
      // return a 401. 
      logger.error(err);
      const newError = err;
      newError.status = 401;
      return next(newError);
    });
});

module.exports = router;
