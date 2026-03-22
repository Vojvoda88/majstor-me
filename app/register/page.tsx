import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";
import { Button } from "@/components/ui/button";
import { SiteHeaderSimple } from "@/components/layout/site-header-simple";
import { RegisterMajstorSignOutCta } from "@/components/auth/register-majstor-sign-out-cta";

export const metadata: Metadata = {
  title: "Registracija",
  description: "Registrujte se kao korisnik ili majstor na BrziMajstor.ME",
};

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const wantsHandyman = String(type ?? "")
    .toLowerCase()
    .trim() === "majstor";

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

  const defaultRole = wantsHandyman ? "HANDYMAN" : "USER";

  return (
    <div className="min-h-screen bg-brand-page">
      <SiteHeaderSimple />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-10 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="font-display text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
              Kreirajte nalog
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Jedan nalog — birate da li tražite majstora ili nudite usluge
            </p>
          </div>
          <RegisterForm defaultRole={defaultRole} />
          <p className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Nazad na početnu
              </Button>
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-slate-400">
            Besplatna registracija • Bez skrivenih troškova
          </p>
        </div>
      </div>
    </div>
  );
}
