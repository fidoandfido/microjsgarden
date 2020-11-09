/**
 * Module dependencies
 */
const passport = require('passport');
const {
  BasicStrategy,
} = require('passport-http');
const User = require('../../models/User');
module.exports = function localPassport() {
  // Use local strategy
  passport.use(
    new BasicStrategy((usernameOrEmail, password, done) => {
      User.findOne({
        where: {
          email: usernameOrEmail.toLowerCase(),
        },
      }).then((user) => {
          if (!user || !user.authenticate(password)) {
            return done(null, false, {
              message: `Invalid username or password (${new Date().toLocaleTimeString()})`,
            });
          }
          return done(null, user);
        })
        .catch(err => done(err));
    }),
  );
};
