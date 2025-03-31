import { NodeSDK } from '@opentelemetry/sdk-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';

// Not functionally required but gives some insight what happens behind the scenes
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const serviceName = process.env.SERVICE_NAME || 'unknown-service-wtf';

export const setupInstrumentation = () => {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: '0.0.1',
      'deployment.environment': 'development',
    }),
    traceExporter: new OTLPTraceExporter({
      // send traces to Grafana Alloy Collector running locally, url not set as Alloy runs on default https://opentelemetry.io/docs/specs/otel/protocol/exporter/#configuration-options
      //url: 'http://localhost:4317',
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        // send traces to Grafana Alloy Collector running locally, url not set as Alloy runs on default endpoint https://opentelemetry.io/docs/specs/otel/protocol/exporter/#configuration-options
        //url: 'http://localhost:4317'
      }),
    }),
    // with Auto instrumentation the distributed tracing between service1 and service2 does not work for some reason
    // even though it should result into the same instrumentations as manually listed
    // instrumentations: [getNodeAutoInstrumentations()],
    instrumentations: [
      // Express instrumentation expects HTTP layer to be instrumented
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      // since @opentelemetry/winston-transport got installed there are no native traces from express (middleware traces), but logs are sent
      new WinstonInstrumentation(),
    ],
  });

  sdk.start();
};
