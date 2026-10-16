import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/app.log', maxsize: 10485760 }),
    new winston.transports.Console({ silent: process.env.NODE_ENV === 'test' }),
  ],
});
