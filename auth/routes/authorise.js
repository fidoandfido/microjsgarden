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
const publickey = process.env.JWT_EXTERNAL_PUBLIC_KEY || (!useJWT && 'dummy value for test');

// Key to sign with (note: This is a different key!)
const privatekey = process.env.JWT_INTERNAL_PRIVATE_KEY;
const internalkey = process.env.JWT_INTERNAL_PUBLIC_KEY;

// Internal requests get waived through, since they already have the correct token.
router.all('*', (req, res, next) => {

  console.log('---------all-----------')

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

router.all('*', ejwt({
  secret: publickey,
  algorithms: ['RS256']
}), (req, res, next) => {

  console.log('---------all-----------2222222')


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

      console.log('-------------------------')
      console.log(user)
      const uid = sub;
      const {
        id,
      } = user;
      // Create the scope
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
      // The user doesn't exist, so deny. We keep the same error
      // object and just append the status for express. We may wish to
      // change this behaviour in the future.
      logger.error(err);
      const newError = err;
      newError.status = 401;
      return next(newError);
    });
});

module.exports = router;
