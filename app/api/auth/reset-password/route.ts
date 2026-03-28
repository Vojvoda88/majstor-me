import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";
import { hashEmailVerificationToken } from "@/lib/email-verification-token";
import { getRequestClientIp } from "@/lib/request-ip";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  token: z.string().min(32, "Nevažeći link"),
  password: z.string().min(8, "Lozinka mora imati najmanje 8 karaktera"),
});

/**
 * Jednokratni token (hash u bazi). Nakon uspjeha briše hash i datum isteka.
 */
export async function POST(request: Request) {
  try {
    const ip = getRequestClientIp(request);
    const key = `reset-pwd-submit:ip:${ip}`;
    if (isRateLimited(key, 15, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Previše pokušaja. Pokušajte kasnije." },
        { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(key)) } }
      );
    }

    const raw = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: zodErrorToString(parsed.error) }, { status: 400 });
    }

    const { token, password } = parsed.data;
    const tokenHash = hashEmailVerificationToken(token.trim());

    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { passwordResetTokenHash: tokenHash },
      select: { id: true, passwordResetExpiresAt: true },
    });

    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Link je nevažeći ili je istekao. Zatražite novi reset." },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("reset-password", error);
    return NextResponse.json({ success: false, error: "Greška pri promjeni lozinke." }, { status: 500 });
  }
}
