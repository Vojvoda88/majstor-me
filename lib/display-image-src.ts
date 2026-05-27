/** Resize Supabase public images on CDN (no Vercel Image Optimization). */

const SUPABASE_OBJECT = "/storage/v1/object/public/";
const SUPABASE_RENDER = "/storage/v1/render/image/public/";

function isSupabasePublicStorageUrl(src: string): boolean {
  try {
    const url = new URL(src);
    return url.hostname.endsWith(".supabase.co") && url.pathname.includes(SUPABASE_OBJECT);
  } catch {
    return false;
  }
}

export function getDisplayImageSrc(
  src: string | null | undefined,
  opts?: { width?: number; quality?: number }
): string {
  if (src == null || src === "") return "";
  if (src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }
  if (!/^https?:\/\//i.test(src)) return src;
  if (!isSupabasePublicStorageUrl(src)) return src;

  const url = new URL(src);
  url.pathname = url.pathname.replace(SUPABASE_OBJECT, SUPABASE_RENDER);
  url.searchParams.set("width", String(opts?.width ?? 640));
  url.searchParams.set("quality", String(opts?.quality ?? 75));
  return url.toString();
}
