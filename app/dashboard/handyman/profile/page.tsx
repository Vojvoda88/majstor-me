import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HandymanProfileForm } from "./handyman-profile-form";
import { calcProfileCompletion } from "@/lib/handyman-onboarding";
import { OnboardingBanner } from "@/components/handyman/onboarding-banner";
import { DeleteMyAccount } from "@/components/account/delete-my-account";
import { mapHandymanProfileForClient } from "@/lib/handyman-profile-for-client";
import { isHandymanAiSuggestConfigured } from "@/lib/ai-handyman-suggest";

export const dynamic = "force-dynamic";

export default async function HandymanProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "HANDYMAN") redirect("/");

  const { prisma } = await import("@/lib/db");
  const [profileRaw, user] = await Promise.all([
    prisma.handymanProfile.findUnique({
      where: { userId: session.user.id },
      include: { workerCategories: { include: { category: true } } },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    }),
  ]);
  const profileData = mapHandymanProfileForClient(profileRaw, user?.phone);

  const onboarding = calcProfileCompletion(profileData, user);
  const aiSuggestEnabled = isHandymanAiSuggestConfigured();

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="page-title">Profil majstora</h1>
      <p className="page-description">
        Popunite profil onim redom kako bi ga klijent najlakše razumio: osnovni podaci, detalji usluge, galerija i opis.
      </p>
      {onboarding.percent < 100 && (
        <OnboardingBanner percent={onboarding.percent} steps={onboarding.steps} className="mb-6" />
      )}
      <HandymanProfileForm
        profile={profileData}
        userName={session.user.name}
        aiSuggestEnabled={aiSuggestEnabled}
      />
      <div className="mt-10">
        <DeleteMyAccount />
      </div>
    </div>
  );
}
