import winston from 'winston';
const {colorize, timestamp, errors, json, combine, printf, prettyPrint} = winston.format;

// Custom format for console output
var isDev = process.env.NODE_ENV === 'development';
const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Custom format for file output
const fileFormat = combine(
  prettyPrint(),
  timestamp(),
  errors({ stack: true }),
  json()
);

export const errorLogger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: fileFormat,
  defaultMeta: { service: 'workstackhub-api' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, 
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Add console transport for development
if (isDev) {
  errorLogger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

