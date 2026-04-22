import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { SiteHeaderSimple } from "@/components/layout/site-header-simple";
import { RegisterMajstorSignOutCta } from "@/components/auth/register-majstor-sign-out-cta";

export const metadata: Metadata = {
  title: "Registracija",
  description:
    "Novi nalog: korisnik (besplatna objava zahtjeva) ili majstor (bez pretplate; krediti za otključavanje kontakta).",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; invite?: string }>;
}) {
  const { type, invite } = await searchParams;
  const wantsHandyman = String(type ?? "")
    .toLowerCase()
    .trim() === "majstor";
  const inviteToken = typeof invite === "string" && invite.length > 0 ? invite : undefined;
  const googleRole = wantsHandyman || inviteToken ? "HANDYMAN" : "USER";
  const googleCallbackUrl = `/auth/complete-google?role=${googleRole}${
    inviteToken ? `&invite=${encodeURIComponent(inviteToken)}` : ""
  }`;

  const session = await auth();
  if (session) {
    const role = (session.user as { role?: string }).role;
    if (role === "HANDYMAN") redirect("/dashboard/handyman");
    if (role === "ADMIN") redirect("/admin");
    if (role === "USER") {
      /** Traži majstora ali već je korisnik — ne redirect na panel; objasni + odjava */
      if (wantsHandyman) {
        return (
          <div className="min-h-screen bg-brand-page">
            <SiteHeaderSimple />
            <RegisterMajstorSignOutCta />
          </div>
        );
      }
      redirect("/dashboard/user");
    }
    /** Sesija postoji ali uloga nije prepoznata (npr. pokvareni JWT) — ne šalji na "/" jer to izgleda kao "ništa se ne dešava" */
    redirect("/login?callbackUrl=/register");
  }

  const defaultRole = wantsHandyman || inviteToken ? "HANDYMAN" : "USER";

  return (
    <div className="min-h-screen bg-brand-page">
      <SiteHeaderSimple />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-marketplace sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-bold text-brand-navy sm:text-3xl">Kreirajte nalog</h1>
            {inviteToken ? (
              <p className="mt-3 text-slate-600">Pozvani ste da se registrujete kao majstor.</p>
            ) : (
              <p className="mt-3 text-slate-600">
                Korisnik ili majstor — izaberite kako želite da koristite platformu
              </p>
            )}
          </div>
          {(
            <>
              <GoogleSignInButton
                callbackUrl={googleCallbackUrl}
                className="mb-4 w-full"
                label={
                  wantsHandyman || inviteToken
                    ? "Nastavi sa Google (dopunite profil poslije)"
                    : "Nastavi sa Google"
                }
              />
              <div className="relative mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">ili registruj se s emailom</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </>
          )}
          <RegisterForm defaultRole={defaultRole} inviteToken={inviteToken} />
          <p className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost" size="sm">← Nazad na početnu</Button>
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-[#94A3B8]">
            Besplatna registracija • Bez skrivenih troškova
          </p>
        </div>
      </div>
    </div>
  );
}
