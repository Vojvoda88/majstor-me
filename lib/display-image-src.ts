/**
 * Display-sized image URLs without Vercel Image Optimization.
 * Supabase public objects are resized via the render/image API on Supabase CDN.
 */

const SUPABASE_OBJECT = "/storage/v1/object/public/";
const SUPABASE_RENDER = "/storage/v1/render/image/public/";

export type DisplayImageOptions = {
  width?: number;
  quality?: number;
};

function isSupabasePublicStorageUrl(src: string): boolean {
  try {
    const url = new URL(src);
    return url.hostname.endsWith(".supabase.co") && url.pathname.includes(SUPABASE_OBJECT);
  } catch {
    return false;
  }
}

function toSupabaseRenderUrl(src: string, opts?: DisplayImageOptions): string {
  const url = new URL(src);
  if (!url.pathname.includes(SUPABASE_OBJECT)) return src;
  url.pathname = url.pathname.replace(SUPABASE_OBJECT, SUPABASE_RENDER);
  url.searchParams.set("width", String(opts?.width ?? 640));
  url.searchParams.set("quality", String(opts?.quality ?? 75));
  return url.toString();
}

/** Pick a CDN-resized URL when possible; local/static paths pass through unchanged. */
export function getDisplayImageSrc(
  src: string | null | undefined,
  opts?: DisplayImageOptions
): string {
  if (src == null || src === "") return "";
  if (src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }
  if (!/^https?:\/\//i.test(src)) return src;
  if (isSupabasePublicStorageUrl(src)) {
    return toSupabaseRenderUrl(src, opts);
  }
  return src;
}
