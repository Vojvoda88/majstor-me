/**
 * Jednostavan in-memory rate limiter.
 * Za produkciju s više instanci koristiti Redis (npr. @upstash/ratelimit).
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

const WINDOW_MS = 60 * 1000; // 1 minuta
const CLEANUP_INTERVAL = 5 * 60 * 1000; // čišćenje svakih 5 min

function cleanup() {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, entry]) => {
    if (entry.resetAt < now) store.delete(key);
  });
}

if (typeof setInterval !== "undefined") {
  setInterval(cleanup, CLEANUP_INTERVAL);
}

/**
 * Provjerava da li je limit prekoračen. Vraća true ako JE prekoračen (treba odbiti).
 */
export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number = WINDOW_MS
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > limit;
}

/**
 * Vraća preostale sekunde do reset-a (za Retry-After header).
 * Koristi resetAt iz store-a (postavljen pri isRateLimited).
 */
export function getRetryAfterSeconds(key: string): number {
  const entry = store.get(key);
  if (!entry) return 60;
  const sec = Math.ceil((entry.resetAt - Date.now()) / 1000);
  return Math.max(1, Math.min(sec, 3600));
}
