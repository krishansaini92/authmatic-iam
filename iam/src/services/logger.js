const path = require('path');
const fs = require('fs');
const winston = require('winston');
const config = require('config').get('logging');

// injects daily-rotate-file transport to Winston transports
require('winston-daily-rotate-file'); // eslint-disable-line  import/no-unassigned-import

const transports = [];

/**
 * Pretty format logs for logging to console during development.
 */
const alignedWithColorsAndTimeFormater = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const {
      timestamp, level, message, ...args
    } = info;

    const ts = timestamp.slice(0, 19).replace('T', ' ');

    return `${ts} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  })
);

if (config.get('console.isEnabled')) {
  transports.push(new winston.transports.Console({
    level: config.get('level'),
    format: alignedWithColorsAndTimeFormater
  }));
}

if (config.get('fs.isEnabled')) {
  const logDir = config.get('fs.logDir');

  const fileRotationTransport = new winston.transports.DailyRotateFile({
    level: config.get('level'),
    filename: path.join(logDir, '%DATE%.log'),
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d',
    handleExceptions: false,
    timestamp: true,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json())
  });

  transports.push(fileRotationTransport);
}

// we want to ignore all logs, e.g when running tests
if (!transports.length) {
  transports.push(new winston.transports.Stream({
    stream: fs.createWriteStream('/dev/null')
  }));
}

const logger = winston.createLogger({
  transports,
  exitOnError: false
});

module.exports = logger.child({ service: 'iam' });
