const config = require('config');
const winston = require('winston');

const enumerateErrorFormat = winston.format((inputInfo) => {
  const info = inputInfo; // Lazy fix of warning
  if (info.message instanceof Error) {
    info.message = {
      message: info.message.message,
      stack: info.message.stack,
      ...info.message,
    };
  }
  if (info instanceof Error) {
    return {
      message: info.message,
      stack: info.stack,
      ...info,
    };
  }
  return info;
});

/**
 * The logger object. Only log to the console.
 * This will be handled either by PM2 in dev or docker (kubernetes) in deployment
 */
const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [new winston.transports.Console({ level: config.loggingLevel })],
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
  ),
});
module.exports = logger;
