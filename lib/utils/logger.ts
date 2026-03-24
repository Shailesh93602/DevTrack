export const logger = {
  error: (message: string, error?: unknown) => {
    // In a production app, this could integrate with Sentry, Datadog, etc.
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ?? "");
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ?? "");
  },
  info: (message: string, data?: unknown) => {
    console.info(`[INFO] ${new Date().toISOString()} - ${message}`, data ?? "");
  },
};
