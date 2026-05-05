type AnyFn<T> = () => Promise<T>;

function isPerfEnabled(): boolean {
  return process.env.PERF_LOGS === "1";
}

export async function withPerfLog<T>(label: string, fn: AnyFn<T>): Promise<T> {
  if (!isPerfEnabled()) return fn();
  const started = Date.now();
  try {
    const result = await fn();
    const ms = Date.now() - started;
    console.info(`[perf] ${label} ok ${ms}ms`);
    return result;
  } catch (error) {
    const ms = Date.now() - started;
    console.error(`[perf] ${label} fail ${ms}ms`, error);
    throw error;
  }
}
