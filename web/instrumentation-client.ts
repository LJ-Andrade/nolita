import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

function getTracesSampleRate(): number {
  const rawValue = process.env.SENTRY_TRACES_SAMPLE_RATE;

  if (!rawValue) {
    return 0;
  }

  const sampleRate = Number(rawValue);

  if (!Number.isFinite(sampleRate)) {
    return 0;
  }

  return Math.min(Math.max(sampleRate, 0), 1);
}

if (dsn) {
  const tracesSampleRate = getTracesSampleRate();

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate,
    integrations: [],
  });
}

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  Object.assign(window, {
    __testSentryWeb: () => {
      if (!dsn) {
        console.warn("NEXT_PUBLIC_SENTRY_DSN is not configured.");
        return null;
      }

      return Sentry.captureException(new Error("Sentry storefront client test error"));
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
