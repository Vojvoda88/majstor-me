/**
 * Use next/image `unoptimized` only when the URL cannot go through the built-in
 * optimizer (must match `images.remotePatterns` in next.config.js).
 *
 * Note: next.config.js sets `images.unoptimized: true` while Vercel image
 * optimization quota is unavailable (402). This helper remains for explicit
 * per-image overrides if that global flag is removed later.
 */
export function shouldUnoptimizeNextImage(_src?: string | null): boolean {
  // Global images.unoptimized in next.config — bypass Vercel optimizer (402 quota).
  return true;
}
