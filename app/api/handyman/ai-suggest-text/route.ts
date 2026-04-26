import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";
import {
  isHandymanAiSuggestConfigured,
  suggestHandymanText,
} from "@/lib/ai-handyman-suggest";
import { displayLabelForRequestCategory } from "@/lib/categories";
import { AVAILABILITY_STATUS_OPTIONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  field: z.enum(["bio", "serviceAreasDescription"]),
  notes: z.string().max(3000).optional().default(""),
  categories: z.array(z.string()).max(10),
  cities: z.array(z.string()).max(30),
  yearsOfExperience: z.number().int().min(0).max(50).nullable().optional(),
  travelRadiusKm: z.number().int().min(0).max(200).nullable().optional(),
  availabilityStatus: z.enum(["AVAILABLE", "BUSY", "EMERGENCY_ONLY"]).optional().nullable(),
});

export async function GET() {
  return NextResponse.json({ available: isHandymanAiSuggestConfigured() });
}

export async function POST(request: Request) {
  try {
    if (!isHandymanAiSuggestConfigured()) {
      return NextResponse.json(
        { ok: false, error: "AI predlozi nijesu konfigurisani." },
        { status: 503 }
      );
    }

    const session = await auth();
    if (!session?.user?.id || session.user.role !== "HANDYMAN") {
      return NextResponse.json({ ok: false, error: "Nemate pristup." }, { status: 403 });
    }

    const rlKey = `ai-suggest-profile:${session.user.id}`;
    if (isRateLimited(rlKey, 20, 60 * 60 * 1000)) {
      return NextResponse.json(
        { ok: false, error: "Previše zahtjeva. Pokušajte kasnije." },
        {
          status: 429,
          headers: { "Retry-After": String(getRetryAfterSeconds(rlKey)) },
        }
      );
    }

    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
    }

    const {
      field,
      notes,
      categories,
      cities,
      yearsOfExperience,
      travelRadiusKm,
      availabilityStatus,
    } = parsed.data;

    const categoryLabels = categories.map((c) => displayLabelForRequestCategory(c));
    const availabilityLabel =
      AVAILABILITY_STATUS_OPTIONS.find((o) => o.value === (availabilityStatus ?? "AVAILABLE"))
        ?.label ?? "Dostupan";

    const text = await suggestHandymanText({
      field,
      notes: notes ?? "",
      categoryLabels,
      cityLabels: cities,
      yearsOfExperience: yearsOfExperience ?? null,
      travelRadiusKm: travelRadiusKm ?? null,
      availabilityLabel,
    });

    return NextResponse.json({ ok: true, text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Greška pri predlogu.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
