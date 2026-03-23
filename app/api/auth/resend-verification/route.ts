import { NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";
import { generateEmailVerificationSecret } from "@/lib/email-verification-token";
import { sendEmailVerificationEmail } from "@/lib/email";
import { getRequestClientIp } from "@/lib/request-ip";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email(),
});

/**
 * Ponovno slanje linka za potvrdu emaila (password nalozi). Rate limit po IP + email.
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
    const key = `resend-verify:${ip}:${email}`;
    if (isRateLimited(key, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Previše pokušaja. Pokušajte kasnije." },
        { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(key)) } }
      );
    }

    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    if (!user.passwordHash || user.passwordHash.length < 10) {
      return NextResponse.json({ success: true });
    }

    const secret = generateEmailVerificationSecret();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationTokenHash: secret.hash,
        emailVerificationExpiresAt: expires,
      },
    });
    void sendEmailVerificationEmail(user.email, user.name, secret.plain);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("resend-verification", error);
    return NextResponse.json({ success: false, error: "Greška pri slanju." }, { status: 500 });
  }
}
