/* eslint no-param-reassign:
  ["error", { "props": true, "ignorePropertyModificationsFor": ["user"] }] */
  const generatePassword = require('generate-password');
  const owasp = require('owasp-password-strength-test');
  const crypto = require('crypto');
  
const winston = require('winston');
  const jwt = require('jsonwebtoken');
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
  
  module.exports = function userExports(sequelize, DataTypes) {
    const User = sequelize.define(
      'User', {
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
      }, {
        tableName: 'users',
        timestamps: true,
        paranoid: true,
        underscored: true,
        hooks: {
          beforeSave: (user, _options) => {
            // If they've changed the password, hash and salt it
            if (user.password && user.changed('password')) {
              user.salt = crypto.randomBytes(16).toString('base64');
              user.password = user.hashPassword(user.password);
            }
          },
          beforeValidate: (user, _options) => {
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
            console.log('validating?')
          },
        },
      },
    );
  
  
    User.prototype.getFields = function userFields() {
      return [
        'uniqueId',
        'name',
        'email',
        'salt',
        'password',
      ];
    };
  
    User.prototype.toJSON = function userToJson() {
      const values = Object.assign({}, this.get());
  
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
          .pbkdf2Sync(
            password,
            Buffer.from(this.salt, 'base64'),
            10000,
            64,
            'SHA1',
          )
          .toString('base64');
      }
      return password;
    };
  
    User.prototype.authenticate = function userAuthenticate(password) {
      return this.password === this.hashPassword(password);
    };
  
    // Set refresh token cookie
    User.prototype.refreshToken = function refreshToken() {
      return jwt.sign({
        type: 'refresh',
        sub: this.uniqueId,
      }, privateKey, {
        expiresIn: '30m',
        algorithm: 'RS256',
        issuer: 'JSGardens',
      });
    };
  
    User.prototype.token = function userToken(extraScopes, fresh = true) {
      console.log({
        action: 'Generating Token',
        id: this.id,
        sub: this.uniqueId,
      });
  
      try {
        return jwt.sign({
          type: 'access',
          scope: 'user',
          sub: this.uniqueId,
          fresh,
        },
        privateKey, {
          expiresIn: '10m',
          algorithm: 'RS256',
          issuer: 'JSGarden',
        });
      } catch (err) {
        logger.error('Error signing');
        logger.error(err);
        throw err;
      }
    };
  
    return User;
  };
  