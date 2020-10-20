/**
 * @file The logger for a Penteract service
 * @author Robert 'Probie' Offner
 * @copyright Fifth Domain 2018
 */
const config = require('config');
const winston = require('winston');

/**
 * The logger object. Only log to the console.
 */
const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [new winston.transports.Console({ level: config.loggingLevel })],
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
  ),
});

module.exports = logger;
