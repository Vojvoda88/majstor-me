/**
 * Storage upload abstraction – spreman za Supabase Storage ili Cloudflare R2.
 *
 * Env varijable za Supabase Storage:
 * - SUPABASE_URL: https://<project>.supabase.co
 * - SUPABASE_SERVICE_ROLE_KEY: service role key (za server upload)
 * - STORAGE_BUCKET: naziv bucketa (default: majstor-me)
 */

const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export type StorageConfig = {
  available: boolean;
  provider: "supabase" | "r2" | null;
};

export function isStorageConfigured(): boolean {
  return !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getStorageConfig(): StorageConfig {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { available: true, provider: "supabase" };
  }
  return { available: false, provider: null };
}

export function validateImageFile(
  file: { type: string; size: number },
  maxSizeBytes: number
): string | null {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return "Tip fajla nije dozvoljen. Dozvoljeni: JPEG, PNG, WebP.";
  }
  if (file.size > maxSizeBytes) {
    const mb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return `Fajl prevelik. Maksimum ${mb}MB.`;
  }
  return null;
}

/**
 * Upload slike u storage. Koristi Supabase Storage ako je konfigurisan.
 */
export async function uploadImage(
  buffer: Buffer,
  mimeType: string,
  path: string
): Promise<UploadResult> {
  if (!isStorageConfigured()) {
    return { ok: false, error: "Storage nije konfigurisan. Koristite URL unos." };
  }

  const url = process.env.SUPABASE_URL!.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const bucket = process.env.STORAGE_BUCKET || "majstor-me";

  const uploadUrl = `${url}/storage/v1/object/${bucket}/${path}`;

  try {
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": mimeType,
      },
      body: new Uint8Array(buffer),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: err || `Upload failed: ${res.status}` };
    }

    const publicUrl = `${url}/storage/v1/object/public/${bucket}/${path}`;
    return { ok: true, url: publicUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload error";
    return { ok: false, error: msg };
  }
}
