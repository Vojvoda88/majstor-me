import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HANDYMAN_START_BONUS_CREDITS } from "@/lib/credit-packages";
import { CITIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

function normalizeRole(raw?: string): "USER" | "HANDYMAN" {
  const v = String(raw ?? "").toUpperCase().trim();
  return v === "HANDYMAN" ? "HANDYMAN" : "USER";
}

export default async function CompleteGooglePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; invite?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const desiredRole = normalizeRole(params.role);
  const inviteToken = typeof params.invite === "string" && params.invite.trim().length > 0 ? params.invite.trim() : null;

  if (!session?.user?.id) {
    const cb = `/auth/complete-google?role=${desiredRole}${inviteToken ? `&invite=${encodeURIComponent(inviteToken)}` : ""}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(cb)}`);
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  if (desiredRole === "HANDYMAN") {
    const { prisma } = await import("@/lib/db");
    const finalized = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          role: true,
          handymanProfile: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!user) return null;

      if (user.role !== "HANDYMAN" && user.role !== "ADMIN") {
        await tx.user.update({
          where: { id: user.id },
          data: { role: "HANDYMAN" },
        });
      }

      let createdProfile = false;
      if (!user.handymanProfile) {
        const bonus = HANDYMAN_START_BONUS_CREDITS;
        await tx.handymanProfile.create({
          data: {
            userId: user.id,
            cities: [...CITIES],
            galleryImages: [],
            creditsBalance: bonus,
            starterBonusGrantedAt: new Date(),
          },
        });
        await tx.creditTransaction.create({
          data: {
            handymanId: user.id,
            amount: bonus,
            type: "PROMO_BONUS",
            referenceId: `starter_bonus_${user.id}`,
            balanceBefore: 0,
            balanceAfter: bonus,
            reason: `${HANDYMAN_START_BONUS_CREDITS} kredita za početak — Google registracija`,
          },
        });
        createdProfile = true;
      }

      return {
        id: user.id,
        name: user.name ?? "",
        createdProfile,
      };
    });

    if (!finalized) {
      redirect("/login");
    }

    if (inviteToken) {
      try {
        await prisma.handymanInvite.updateMany({
          where: { token: inviteToken, status: "PENDING" },
          data: { status: "ACCEPTED" },
        });
      } catch {
        // invite nije kritičan za prijavu
      }
    }

    if (finalized.createdProfile) {
      const { notifyAdminsNewPendingHandyman } = await import("@/lib/admin-signals");
      await notifyAdminsNewPendingHandyman({
        handymanUserId: finalized.id,
        displayName: finalized.name,
      });
    }

    redirect("/dashboard/handyman/profile?onboarding=google");
  }

  redirect("/dashboard/user");
}
