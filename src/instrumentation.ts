import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';

const serviceName = process.env.SERVICE_NAME || 'unknown-service-wtf';

export const setupInstrumentationAuto = () => {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: '0.0.1',
    }),
    traceExporter: new OTLPTraceExporter({
      // optional - default url is http://localhost:4318/v1/traces
      url: 'http://localhost:5341/ingest/otlp/v1/traces', // send traces to Seq
      // optional - collection of custom headers to be sent with each request, empty by default
      headers: {},
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(), //Seq does not seem to be able to consuem metrics or do anything with them, so we put them in console
      //   exporter: new OTLPMetricExporter({
      //     url: '<your-otlp-endpoint>/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      //     headers: {}, // an optional object containing custom headers to be sent with each request
      //   }),
    }),

    // with Auto instrumentation the distributed tracing between service1 and service2 does not work for some reason
    // even though it should result into the same instrumentations as manually listed
    //instrumentations: [getNodeAutoInstrumentations()],
    instrumentations: [
      // Express instrumentation expects HTTP layer to be instrumented
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new WinstonInstrumentation({
        // Optional hook to insert additional context to log metadata.
        // Called after trace context is injected to metadata.
        logHook: (span, record) => {
          record['resource.service.name'] = serviceName;
        },
      }),
    ],
  });

  sdk.start();
};

// Not functionally required but gives some insight what happens behind the scenes
// import { trace, diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
