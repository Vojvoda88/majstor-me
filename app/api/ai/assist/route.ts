import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getRequestClientIp } from "@/lib/request-ip";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";
import { containsContactBypass } from "@/lib/contact-sanitization";
import {
  generateHandymanBio,
  generateRequestDraft,
  isAiAssistConfigured,
} from "@/lib/ai-assist-gemini";

export const dynamic = "force-dynamic";
/** Vercel Hobby: max 10s; Pro može podići. */
export const maxDuration = 10;

const bodySchema = z.object({
  kind: z.enum(["request_draft", "handyman_bio"]),
  draft: z.string().max(2500),
  category: z.string().max(120).optional(),
  city: z.string().max(80).optional(),
  currentTitle: z.string().max(200).optional(),
});

const WINDOW_MS = 60 * 60 * 1000;
const LIMIT_AUTH = 20;
const LIMIT_GUEST = 10;

export async function POST(request: Request) {
  if (!isAiAssistConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Pomoć AI trenutno nije podešena. Administrator treba da doda GOOGLE_GENERATIVE_AI_API_KEY (Google AI Studio — besplatni tier).",
        code: "AI_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  const session = await auth();
  const ip = getRequestClientIp(request);
  const rateKey = session?.user?.id
    ? `ai-assist:user:${session.user.id}`
    : `ai-assist:ip:${ip}`;
  const limit = session?.user?.id ? LIMIT_AUTH : LIMIT_GUEST;

  if (isRateLimited(rateKey, limit, WINDOW_MS)) {
    return NextResponse.json(
      { success: false, error: "Previše zahtjeva. Pokušajte kasnije." },
      { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(rateKey)) } }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Neispravan JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Neispravan zahtjev" }, { status: 400 });
  }

  const { kind, draft, category, city, currentTitle } = parsed.data;

  if (kind === "handyman_bio") {
    if (session?.user?.role !== "HANDYMAN") {
      return NextResponse.json({ success: false, error: "Samo za prijavljene majstore." }, { status: 403 });
    }
    if (!draft.trim()) {
      return NextResponse.json({ success: false, error: "Unesite bar kratke bilješke o sebi." }, { status: 400 });
    }
    try {
      const { bio } = await generateHandymanBio({ draft });
      const bypass = containsContactBypass(bio);
      if (!bypass.ok) {
        return NextResponse.json(
          {
            success: false,
            error: "Predlog sadrži kontakt podatke u tekstu. Skratite bilješke i pokušajte ponovo.",
            code: "AI_CONTACT_IN_OUTPUT",
          },
          { status: 422 }
        );
      }
      return NextResponse.json({ success: true, data: { bio } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "AI_ASSIST_NO_KEY") {
        return NextResponse.json({ success: false, error: "AI nije konfigurisan." }, { status: 503 });
      }
      console.error("[ai/assist] handyman_bio", msg);
      return NextResponse.json(
        { success: false, error: "Generisanje nije uspjelo. Pokušajte ponovo za nekoliko sekundi." },
        { status: 502 }
      );
    }
  }

  // request_draft — gost ili prijavljeni
  if (!draft.trim() && !currentTitle?.trim()) {
    return NextResponse.json(
      { success: false, error: "Unesite naslov ili opis (bar kratke bilješke)." },
      { status: 400 }
    );
  }

  try {
    const { title, description } = await generateRequestDraft({
      draft: draft.trim(),
      category: category || undefined,
      city: city || undefined,
      currentTitle: currentTitle?.trim(),
    });

    const tBypass = containsContactBypass(title);
    const dBypass = containsContactBypass(description);
    if (!tBypass.ok || !dBypass.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Predlog sadrži telefon, email ili druge kontakte u tekstu. Pokušajte ponovo sa kraćim bilješkama bez brojeva.",
          code: "AI_CONTACT_IN_OUTPUT",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, data: { title, description } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "AI_ASSIST_NO_KEY") {
      return NextResponse.json({ success: false, error: "AI nije konfigurisan." }, { status: 503 });
    }
    console.error("[ai/assist] request_draft", msg);
    return NextResponse.json(
      { success: false, error: "Generisanje nije uspjelo. Pokušajte ponovo za nekoliko sekundi." },
      { status: 502 }
    );
  }
}
