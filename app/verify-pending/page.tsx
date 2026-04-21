import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SiteHeaderSimple } from "@/components/layout/site-header-simple";
import { VerifyEmailBanner } from "@/components/account/verify-email-banner";
import { SignOutButton } from "@/components/account/sign-out-button";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Potvrdite email | BrziMajstor.ME",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VerifyPendingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      emailVerified: true,
      email: true,
      role: true,
      handymanProfile: { select: { verifiedStatus: true } },
    },
  });

  // Ako je već verifikovan — vrati na dashboard
  const isEmailVerified = !!user?.emailVerified;
  const isAdminApprovedHandyman =
    user?.role === "HANDYMAN" && user?.handymanProfile?.verifiedStatus === "VERIFIED";

  if (isEmailVerified || isAdminApprovedHandyman) {
    if (user?.role === "HANDYMAN") redirect("/dashboard/handyman");
    if (user?.role === "USER") redirect("/dashboard/user");
    if (session.user.role === "ADMIN") redirect("/admin");
    redirect("/");
  }

  const isHandyman = user?.role === "HANDYMAN";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SiteHeaderSimple />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Mail className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm text-center">
            <h1 className="font-display text-xl font-bold text-slate-900">
              Potvrdite email adresu
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Nalog je kreiran, ali morate potvrditi email adresu{" "}
              <strong className="text-slate-800">{user?.email}</strong> prije
              nego što možete koristiti platformu.
            </p>

            {isHandyman && (
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Alternativno, admin može ručno odobriti vaš nalog — u tom
                slučaju pristup će biti omogućen bez verifikacije emaila.
              </p>
            )}

            <div className="mt-6">
              <VerifyEmailBanner />
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400">
                Pogrešan nalog?{" "}
              </p>
              <div className="mt-2 flex justify-center">
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
