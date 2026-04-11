import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";
import { HANDYMAN_START_BONUS_CREDITS } from "@/lib/credit-packages";
import { getRegisterRateLimitKey, getRequestClientIp } from "@/lib/request-ip";
import { generateEmailVerificationSecret } from "@/lib/email-verification-token";
import { sendEmailVerificationEmail } from "@/lib/email";
import { CITIES, MAX_HANDYMAN_CATEGORIES } from "@/lib/constants";
import { HANDYMAN_SELECTABLE_INTERNAL_NAMES } from "@/lib/categories";

export const dynamic = "force-dynamic";

const HANDYMAN_CATEGORY_SET = new Set<string>(HANDYMAN_SELECTABLE_INTERNAL_NAMES as unknown as string[]);
const CITY_CANON = new Map(CITIES.map((c) => [c.toLowerCase(), c]));

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x !== "string") continue;
    const t = x.trim();
    if (t) out.push(t);
  }
  return out;
}

/** Ako majstor ne izabere gradove — rad u svim gradovima iz konstante. */
function resolveHandymanWorkCities(selectedNormalized: string[]): string[] {
  const canon: string[] = [];
  for (const t of selectedNormalized) {
    const c = CITY_CANON.get(t.toLowerCase());
    if (c) canon.push(c);
  }
  const unique = Array.from(new Set(canon));
  if (unique.length === 0) return [...CITIES];
  return unique;
}

/** Jednostavna shema — sve stringove normalizujemo prije safeParse (bez z.preprocess). */
const registerSchema = z
  .object({
    name: z.string().min(2, "Naziv mora imati najmanje 2 karaktera"),
    email: z.string().email("Neispravan email"),
    password: z.string().min(6, "Lozinka mora imati najmanje 6 karaktera"),
    phone: z.string().optional(),
    city: z.string().optional(),
    role: z.enum(["USER", "HANDYMAN"]),
    categories: z.array(z.string()).default([]),
    workCities: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "HANDYMAN") return;
    if (data.categories.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Izaberite najmanje jednu kategoriju koju pokrivate.",
        path: ["categories"],
      });
    }
    if (data.categories.length > MAX_HANDYMAN_CATEGORIES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Možete izabrati najviše ${MAX_HANDYMAN_CATEGORIES} kategorija.`,
        path: ["categories"],
      });
    }
    for (const c of data.categories) {
      if (!HANDYMAN_CATEGORY_SET.has(c)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jedna ili više kategorija nisu dozvoljene.",
          path: ["categories"],
        });
        break;
      }
    }
  });

/**
 * Bilo koji JSON od klijenta → predvidljiv objekat za Zod.
 * (Izbjegava greške tipa kod z.preprocess + optional.)
 */
function normalizeRegisterBody(raw: unknown): z.infer<typeof registerSchema> {
  const b =
    raw !== null && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(b.password ?? "");

  const phoneRaw = b.phone;
  const phone =
    phoneRaw === null || phoneRaw === undefined || phoneRaw === ""
      ? undefined
      : String(phoneRaw).trim() || undefined;

  const cityRaw = b.city;
  const city =
    cityRaw === null || cityRaw === undefined || cityRaw === ""
      ? undefined
      : String(cityRaw).trim() || undefined;

  const roleRaw = String(b.role ?? "USER")
    .trim()
    .toUpperCase();
  const role: "USER" | "HANDYMAN" = roleRaw === "HANDYMAN" ? "HANDYMAN" : "USER";

  const categories = normalizeStringArray(b.categories);
  const workCities = normalizeStringArray(b.workCities);

  return { name, email, password, phone, city, role, categories, workCities };
}

export async function POST(request: Request) {
  try {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Neispravan zahtjev (JSON)." },
        { status: 400 }
      );
    }

    const normalized = normalizeRegisterBody(raw);
    const parsed = registerSchema.safeParse(normalized);

    if (!parsed.success) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[register] validation failed", {
          normalized,
          issues: parsed.error.flatten(),
        });
      }
      return NextResponse.json(
        { success: false, error: zodErrorToString(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, password, phone, city, role, categories, workCities } = parsed.data;

    /**
     * Rate limit NAKON validacije JSON-a — da ne trošimo slot na loš JSON.
     * Ključ: po IP-u kad je IP poznat; kad je "unknown" (npr. bez forwarded headera),
     * limit je po emailu — inače svi dijele jedan globalni `register:unknown` i prvi
     * pet pokušaja bilo koga blokiraju sve ostale.
     */
    const ip = getRequestClientIp(request);
    const rateLimitKey = getRegisterRateLimitKey(ip, email);
    /** U dev-u više pokušaja (testiranje); u produkciji 5/h po ključu */
    const registerLimit = process.env.NODE_ENV === "development" ? 100 : 5;
    if (isRateLimited(rateLimitKey, registerLimit, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Previše pokušaja registracije. Pokušajte ponovo kasnije." },
        { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(rateLimitKey)) } }
      );
    }

    const { prisma } = await import("@/lib/db");

    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Korisnik sa ovim email-om već postoji",
          code: "EMAIL_ALREADY_EXISTS",
        },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          phone: phone ?? null,
          city: city ?? null,
          role,
          emailVerified: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (role === "HANDYMAN") {
        const bonus = HANDYMAN_START_BONUS_CREDITS;
        const citiesResolved = resolveHandymanWorkCities(workCities);
        const prof = await tx.handymanProfile.create({
          data: {
            userId: u.id,
            cities: citiesResolved,
            creditsBalance: bonus,
            starterBonusGrantedAt: new Date(),
          },
        });

        for (const catName of categories) {
          await tx.category.upsert({
            where: { name: catName },
            update: {},
            create: { name: catName },
          });
        }
        const categoryRows = await tx.category.findMany({
          where: { name: { in: categories } },
          select: { id: true },
        });
        if (categoryRows.length > 0) {
          await tx.workerCategory.createMany({
            data: categoryRows.map((row) => ({
              workerId: prof.id,
              categoryId: row.id,
            })),
            skipDuplicates: true,
          });
        }

        await tx.creditTransaction.create({
          data: {
            handymanId: u.id,
            amount: bonus,
            type: "PROMO_BONUS",
            referenceId: `starter_bonus_${u.id}`,
            balanceBefore: 0,
            balanceAfter: bonus,
            reason: `${HANDYMAN_START_BONUS_CREDITS} kredita za početak — novi majstor`,
          },
        });
      }

      return u;
    });

    const verifySecret = generateEmailVerificationSecret();
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationTokenHash: verifySecret.hash,
        emailVerificationExpiresAt: verifyExpires,
      },
    });
    const verificationEmailSent = await sendEmailVerificationEmail(
      user.email,
      user.name ?? "",
      verifySecret.plain
    );

    if (role === "HANDYMAN") {
      const { notifyAdminsNewPendingHandyman } = await import("@/lib/admin-signals");
      void notifyAdminsNewPendingHandyman({
        handymanUserId: user.id,
        displayName: user.name ?? "",
      });
    }

    return NextResponse.json({
      success: true,
      data: { ...user, needsEmailVerification: true as const, verificationEmailSent },
    });
  } catch (error) {
    console.error("Register error:", error);
    logError("Register error", error);

    const err = error as { code?: string; meta?: { target?: string[] }; message?: string };
    let userMessage = "Greška pri registraciji. Pokušajte ponovo.";
    let status: number = 500;

    if (err?.code === "P2002" && err?.meta?.target?.includes("email")) {
      userMessage = "Korisnik sa ovim email-om već postoji";
      status = 400;
    } else if (err?.code === "P2022") {
      /** Kolona/tabela ne postoji u bazi — migracije nisu primijenjene na ovom okruženju. */
      userMessage =
        "Registracija trenutno nije dostupna (ažuriranje sistema). Pokušajte kasnije ili kontaktirajte podršku.";
    } else if (err?.code === "P1001") {
      userMessage = "Ne možemo se povezati na bazu. Pokušajte za nekoliko minuta.";
    } else if (process.env.NODE_ENV === "development" && error instanceof Error) {
      userMessage = error.message;
    }

    return NextResponse.json({ success: false, error: userMessage }, { status });
  }
}
