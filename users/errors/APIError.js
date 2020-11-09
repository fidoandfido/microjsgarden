function APIError(errors, status, message, userSafe) {
    this.name = 'API Error';
  
    if (Array.isArray(errors)) {
      this.message = message || errors[0];
      this.errors = errors;
    } else {
      this.message = errors;
      this.errors = [errors];
    }
    this.status = status || 422;
    this.statusCode = this.status;
    this.userSafe = !!userSafe;
    Error.captureStackTrace(this, APIError);
  }
  APIError.prototype = Object.create(Error.prototype);
  APIError.prototype.constructor = APIError;

  module.exports = APIError;