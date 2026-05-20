export function getSentryTracesSampleRate(): number {
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
