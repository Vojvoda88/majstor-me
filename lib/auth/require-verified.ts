import { redirect } from "next/navigation";
import type { Session } from "next-auth";

/**
 * Provjeri da li korisnik može pristupiti platformi.
 *
 * Pravila:
 * - ADMIN: uvijek može
 * - USER: mora imati verifikovan email
 * - HANDYMAN: mora imati verifikovan email ILI admin-odobreni profil (verifiedStatus === "VERIFIED")
 *
 * Ako nije verifikovan — redirect na /verify-pending.
 */
export async function requireVerified(session: Session): Promise<void> {
  if (session.user.role === "ADMIN") return;

  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      emailVerified: true,
      role: true,
      handymanProfile: { select: { verifiedStatus: true } },
    },
  });

  if (!user) redirect("/login");

  const emailOk = !!user.emailVerified;
  const adminApproved =
    user.role === "HANDYMAN" && user.handymanProfile?.verifiedStatus === "VERIFIED";

  if (!emailOk && !adminApproved) {
    redirect("/verify-pending");
  }
}

/**
 * API varijanta — vraća true ako je korisnik verifikovan, false ako nije.
 * Koristi se u API rutama gdje ne možemo raditi redirect.
 */
export async function isVerified(userId: string, role: string): Promise<boolean> {
  if (role === "ADMIN") return true;

  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      handymanProfile: { select: { verifiedStatus: true } },
    },
  });

  if (!user) return false;

  const emailOk = !!user.emailVerified;
  const adminApproved =
    role === "HANDYMAN" && user.handymanProfile?.verifiedStatus === "VERIFIED";

  return emailOk || adminApproved;
}
