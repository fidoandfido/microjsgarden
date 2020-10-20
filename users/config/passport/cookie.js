const passport = require('passport');
const CookieStrategy = require('passport-cookie');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');

const publicKey = process.env.JWT_EXTERNAL_PUBLIC_KEY;

module.exports = function cookieRefresh() {
  passport.use(
    new CookieStrategy({
      cookieName: 'refresh_token',
    }, (token, done) => {
      let decoded;
      try {
        decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
      } catch (err) {
        return done(err);
      }
      if (decoded.type !== 'refresh') {
        return done('not a refresh token');
      }
      return User.findOne({ where: { externalId: decoded.sub } })
        .then((user) => {
          logger.info({
            action: 'Token Cookie Renewal',
            resource: 'user',
            id: user.id,
          });
          return done(null, user);
        })
        .catch(err => done(err));
    }),
  );
};
