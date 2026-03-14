import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

const registerSchema = z.object({
  name: z.string().min(2, "Ime mora imati najmanje 2 karaktera"),
  email: z.string().email("Neispravan email"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 karaktera"),
  phone: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(["USER", "HANDYMAN"]).default("USER"),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(`register:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Previše pokušaja registracije. Pokušajte ponovo kasnije." },
        { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(`register:${ip}`)) } }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: zodErrorToString(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, password, phone, city, role } = parsed.data;

    const { prisma } = await import("@/lib/db");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Korisnik sa ovim email-om već postoji" },
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
          phone: phone || null,
          city: city || null,
          role,
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
        await tx.handymanProfile.create({
          data: {
            userId: u.id,
            categories: [],
            cities: [],
          },
        });
      }

      return u;
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Register error:", error);
    logError("Register error", error);

    const err = error as { code?: string; meta?: { target?: string[] } };
    let userMessage = "Greška pri registraciji. Pokušajte ponovo.";

    if (err?.code === "P2002" && err?.meta?.target?.includes("email")) {
      userMessage = "Korisnik sa ovim email-om već postoji";
    } else if (process.env.NODE_ENV === "development" && error instanceof Error) {
      userMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: userMessage },
      { status: 500 }
    );
  }
}
