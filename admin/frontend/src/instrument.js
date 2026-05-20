import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;

function getTracesSampleRate() {
	const rawValue = import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE;

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
		environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
		release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
		sendDefaultPii: false,
		tracesSampleRate,
		integrations: tracesSampleRate > 0 ? [Sentry.browserTracingIntegration()] : [],
	});
}

if (import.meta.env.DEV && typeof window !== "undefined") {
	window.__testSentryAdmin = () => {
		if (!dsn) {
			console.warn("VITE_SENTRY_DSN is not configured.");
			return null;
		}

		return Sentry.captureException(new Error("Sentry admin test error"));
	};
}

export { Sentry };
