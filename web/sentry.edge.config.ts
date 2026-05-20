import * as Sentry from "@sentry/nextjs";
import { getSentryTracesSampleRate } from "./sentry.shared";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    defaultIntegrations: false,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    integrations: [],
    release: process.env.SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate: getSentryTracesSampleRate(),
  });
}
