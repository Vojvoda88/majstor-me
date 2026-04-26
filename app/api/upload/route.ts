import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  isStorageConfigured,
  validateImageMagicBytes,
  uploadImage,
  detectImageMimeFromBuffer,
} from "@/lib/storage";
import { MAX_IMAGE_SIZE_BYTES, MAX_GALLERY_IMAGES } from "@/lib/constants";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";
import { getRequestClientIp } from "@/lib/request-ip";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function normalizeClientMimeType(raw: string): string {
  const t = (raw || "").toLowerCase().trim();
  if (t === "image/jpg" || t === "image/pjpeg") return "image/jpeg";
  return t;
}

export async function POST(request: Request) {
  try {
    const ip = getRequestClientIp(request);
    const rlKey = `upload:ip:${ip}`;
    if (isRateLimited(rlKey, 40, 60 * 60 * 1000)) {
      return NextResponse.json(
        { ok: false, error: "Previše uploada. Pokušajte kasnije." },
        { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(rlKey)) } }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    if (!isStorageConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          uploadAvailable: false,
          error: "Upload nije konfigurisan. Koristite URL unos slike.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string; // "avatar" | "gallery"

    if (!file || !type) {
      return NextResponse.json(
        { ok: false, error: "Nedostaje file ili type" },
        { status: 400 }
      );
    }

    if (!["avatar", "gallery", "request"].includes(type)) {
      return NextResponse.json(
        { ok: false, error: "Neispravan type" },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: `Fajl prevelik. Maksimum ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const declared = normalizeClientMimeType(file.type);
    let effectiveMime: (typeof VALID_TYPES)[number] | null = null;
    if ((VALID_TYPES as readonly string[]).includes(declared) && validateImageMagicBytes(buffer, declared)) {
      effectiveMime = declared as (typeof VALID_TYPES)[number];
    } else {
      const detected = detectImageMimeFromBuffer(buffer);
      if (detected && validateImageMagicBytes(buffer, detected)) {
        effectiveMime = detected;
      }
    }
    if (!effectiveMime) {
      return NextResponse.json(
        { ok: false, error: "Fajl nije valjana slika (JPEG, PNG ili WebP)." },
        { status: 400 }
      );
    }

    const ext = effectiveMime === "image/jpeg" ? "jpg" : effectiveMime === "image/png" ? "png" : "webp";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const path =
      type === "avatar"
        ? `avatars/${session.user.id}/${filename}`
        : type === "request"
          ? `requests/${session.user.id}/${filename}`
          : `gallery/${session.user.id}/${filename}`;

    const result = await uploadImage(buffer, effectiveMime, path);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, url: result.url });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { ok: false, error: "Greška pri uploadu" },
      { status: 500 }
    );
  }
}

/** Provera da li je upload dostupan */
export async function GET() {
  return NextResponse.json({
    uploadAvailable: isStorageConfigured(),
    maxSizeBytes: MAX_IMAGE_SIZE_BYTES,
    maxGalleryImages: MAX_GALLERY_IMAGES,
  });
}
