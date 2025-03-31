import winston from 'winston';

const serviceName = process.env.SERVICE_NAME || 'unknown-service-wtf';

const logger = winston.createLogger({
  format: winston.format.combine(
    /* This is required to get errors to log with stack traces. See https://github.com/winstonjs/winston/issues/1498 */
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {
    application: serviceName,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    // new OpenTelemetryTransportV3() // no need to add explicityl, its added automaticalyy if @opentelemetry/winston-transport is installed
  ],
});

export default logger;
