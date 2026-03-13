/**
 * Production-safe logging - only logs in development
 */
export function logError(message: string, error?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(message, error ?? "");
  }
}
