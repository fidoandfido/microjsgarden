/* eslint no-param-reassign:
  ["error", { "props": true, "ignorePropertyModificationsFor": ["user"] }] */
const owasp = require('owasp-password-strength-test');
const crypto = require('crypto');
const Sequelize = require('sequelize');
const config = require('config');
const DSNParser = require('dsn-parser');
const jwt = require('jsonwebtoken');
const logger = require('../logger');

const privateKey = process.env.JWT_EXTERNAL_PRIVATE_KEY;

if (!privateKey && process.env.NODE_ENV !== 'test') {
  throw new Error('JWT_EXTERNAL_PRIVATE_KEY is required');
}

owasp.config({
  allowPassphrases: true,
  maxLength: 128,
  minLength: 10,
  minPhraseLength: 20,
  minOptionalTestsToPass: 4,
});

const db = {};
const logging = !process.env.SQL_LOGGING || process.env.SQL_LOGGING !== 'false';
// Make a connection pool
const dsn = new DSNParser(process.env.DB_CONNECTION);
const dsnConfig = dsn.getParts();
// Make a connection pool
const sequelize = new Sequelize(dsnConfig.database, dsnConfig.user, dsnConfig.password, {
  host: dsnConfig.host,
  port: dsnConfig.port,
  // log all SQL requests at the "debug" level.
  logging: (mesg) => logger.debug(mesg),
  pool: {
    max: 2,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialect: 'postgres',
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;
// Connect to the database
db.sequelize
  .authenticate()
  .then(() => {
    if (logging) {
      logger.info({ database: 'Connected to Database' });
    }
  })
  .catch((err) => {
    if (!config.useSQL) {
      logger.warning({ database: 'Not connecting to database' });
    } else {
      // If we can't connect at first - fail hard
      logger.error({ database: 'Failed to Connect to Database' });
      logger.error(err);
      process.exit(1);
    }
  });

const { DataTypes } = Sequelize;

const User = sequelize.define(
  'User',
  {
    uniqueId: {
      type: DataTypes.UUID,
      field: 'unique_id',
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'User name must be provided.',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    salt: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
    hooks: {
      beforeSave: (user) => {
        // If they've changed the password, hash and salt it
        if (user.password && user.changed('password')) {
          user.salt = crypto.randomBytes(16).toString('base64');
          user.password = user.hashPassword(user.password);
        }
      },
      beforeValidate: (_user, _options) => {
        // if (user.password && user.changed('password')) {
        //   const result = owasp.test(user.password);
        //   if (result.errors.length) {
        //     console.log({
        //       message: 'Rejected Password',
        //       id: user.id,
        //     });
        //     const error = result.errors.join(' ');
        //     sequelize.Promise.reject(new Error(error));
        //   }
        // }
        logger.debug('validating: ');
        logger.debug(_user);
        logger.debug(_options);
      },
    },
  },
);

User.prototype.getFields = function userFields() {
  return ['uniqueId', 'name', 'email', 'salt', 'password'];
};

User.prototype.toJSON = function userToJson() {
  const values = { ...this.get() };

  values.id = values.uniqueId;
  delete values.uniqueId;
  delete values.password;
  delete values.salt;
  delete values.createdAt;
  delete values.deletedAt;
  delete values.updatedAt;
  return values;
};

User.prototype.hashPassword = function userHashPassword(password) {
  if (this.salt && password) {
    return crypto
      .pbkdf2Sync(password, Buffer.from(this.salt, 'base64'), 10000, 64, 'SHA1')
      .toString('base64');
  }
  return password;
};

User.prototype.authenticate = function userAuthenticate(password) {
  return this.password === this.hashPassword(password);
};

// Set refresh token cookie
User.prototype.refreshToken = function refreshToken() {
  return jwt.sign(
    {
      type: 'refresh',
      sub: this.uniqueId,
    },
    privateKey,
    {
      expiresIn: '30m',
      algorithm: 'RS256',
      issuer: 'JSGardens',
    },
  );
};

User.prototype.token = function userToken(extraScopes, fresh = true) {
  logger.info({
    action: 'Generating Token',
    id: this.id,
    sub: this.uniqueId,
  });
  try {
    const payload = {
      type: 'access',
      scope: 'user',
      sub: this.uniqueId,
      fresh,
    };
    const options = {
      expiresIn: '10m',
      algorithm: 'RS256',
      issuer: 'JSGarden',
    };
    return jwt.sign(payload, privateKey, options);
  } catch (err) {
    logger.error('Error signing');
    logger.error(err);
    throw err;
  }
};

module.exports = User;
