import { SeqTransport } from '@datalust/winston-seq';
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    /* This is required to get errors to log with stack traces. See https://github.com/winstonjs/winston/issues/1498 */
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {
    application: 'otel-experiment',
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new SeqTransport({
      serverUrl: 'http://localhost:5341',
      // apiKey: 'your-api-key',
      onError: (e) => {
        console.error('seq error', e);
      },
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

export default logger;
