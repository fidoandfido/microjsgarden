function AuthError() {
  this.name = 'Auth Error';
  this.message = 'Could Not Authenticate';
  this.status = 401;
  this.statusCode = this.status;
  this.userSafe = true;
  Error.captureStackTrace(this, AuthError);
}
AuthError.prototype = Object.create(Error.prototype);
AuthError.prototype.constructor = AuthError;

module.exports = AuthError;
