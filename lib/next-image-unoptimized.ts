/**
 * Use next/image `unoptimized` only when the URL cannot go through the built-in
 * optimizer (must match `images.remotePatterns` in next.config.js).
 */
const OPTIMIZER_HOST_SUFFIXES = [".supabase.co"] as const;

const OPTIMIZER_HOSTS = new Set([
  "images.unsplash.com",
  "images.pexels.com",
  "lh3.googleusercontent.com",
]);

export function shouldUnoptimizeNextImage(src: string | null | undefined): boolean {
  if (src == null || src === "") return false;
  if (src.startsWith("data:") || src.startsWith("blob:")) return true;
  if (!/^https?:\/\//i.test(src)) return false;

  let hostname: string;
  try {
    hostname = new URL(src).hostname.toLowerCase();
  } catch {
    return true;
  }

  if (OPTIMIZER_HOSTS.has(hostname)) return false;
  for (const suffix of OPTIMIZER_HOST_SUFFIXES) {
    if (hostname.endsWith(suffix)) return false;
  }
  return true;
}
