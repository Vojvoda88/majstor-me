import { NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";
import { generateEmailVerificationSecret } from "@/lib/email-verification-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { getRequestClientIp } from "@/lib/request-ip";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email(),
});

const UNIFORM_JSON = { success: true as const };

/**
 * Reset lozinke: uvijek isti JSON odgovor (ne otkriva postojanje naloga).
 * Rate limit po IP i po emailu.
 */
export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: zodErrorToString(parsed.error) }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const ip = getRequestClientIp(request);
    const keyIp = `forgot-pwd:ip:${ip}`;
    const keyEmail = `forgot-pwd:email:${email}`;
    if (isRateLimited(keyIp, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Previše zahtjeva. Pokušajte kasnije." },
        { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(keyIp)) } }
      );
    }
    if (isRateLimited(keyEmail, 5, 60 * 60 * 1000)) {
      return NextResponse.json(UNIFORM_JSON, { status: 200 });
    }

    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, email: true, name: true, passwordHash: true },
    });

    if (!user || !user.passwordHash || user.passwordHash.length < 10) {
      return NextResponse.json(UNIFORM_JSON, { status: 200 });
    }

    const secret = generateEmailVerificationSecret();
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: secret.hash,
        passwordResetExpiresAt: expires,
      },
    });
    void sendPasswordResetEmail(user.email, user.name ?? "", secret.plain);

    return NextResponse.json(UNIFORM_JSON, { status: 200 });
  } catch (error) {
    logError("forgot-password", error);
    return NextResponse.json(UNIFORM_JSON, { status: 200 });
  }
}
