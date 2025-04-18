import { trace, SpanStatusCode } from '@opentelemetry/api';
import logger from './logger';

const serviceName = process.env.SERVICE_NAME || 'unknown-service-wtf';

// default headers for JSON
const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=UTF-8',
};

export const makeAPICall = async (options: { method: string; url: string; payload: object }) => {
  const tracer = trace.getTracer(serviceName);
  return tracer.startActiveSpan('API call span', async (span) => {
    try {
      const requestUrl = `${process.env.SERVICE2_ENDPOINT}${options.url}`;
      const requestOptions = {
        method: options.method,
        headers: {
          ...defaultHeaders,
        },
        body: JSON.stringify(options.payload),
      };

      logger.info(`API Call invoke: ${options.method} ${options.url}, spanId=${span.spanContext().spanId}`);
      const response: Response = await fetch(requestUrl, requestOptions);
      // fetch does not error on HTTP 400 > 600, hence explicitly break
      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();
      span.setStatus({ code: SpanStatusCode.OK });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'API invocation error: cause unknown';
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: errorMessage,
      });
      logger.error(`API Call error: ${options.method} ${options.url}`, error);
      // throw error;
    } finally {
      span.end();
    }
  });
};
