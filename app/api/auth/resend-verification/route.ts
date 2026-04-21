import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateEmailVerificationSecret } from "@/lib/email-verification-token";
import { sendEmailVerificationEmail } from "@/lib/email";
import { isRateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    // Rate limit: max 3 puta na sat po korisniku
    const rlKey = `resend-verify:${session.user.id}`;
    if (isRateLimited(rlKey, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Previše zahtjeva. Pokušajte ponovo za sat vremena." },
        { status: 429 }
      );
    }

    const { prisma } = await import("@/lib/db");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Korisnik nije pronađen" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: "Email je već verifikovan" },
        { status: 400 }
      );
    }

    const secret = generateEmailVerificationSecret();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailVerificationTokenHash: secret.hash,
        emailVerificationExpiresAt: expiresAt,
      },
    });

    const result = await sendEmailVerificationEmail(
      user.email!,
      user.name ?? "",
      secret.plain
    );

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Link za verifikaciju je poslan na vaš email.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Greška. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}
