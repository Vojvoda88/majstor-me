import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { Button } from "@/components/ui/button";
import { SiteHeaderSimple } from "@/components/layout/site-header-simple";

export const metadata: Metadata = {
  title: "Prijava",
  description: "Prijava na nalog — korisnik ili majstor na BrziMajstor.ME.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/admin");
  if (session?.user?.role === "HANDYMAN") redirect("/dashboard/handyman");
  if (session?.user?.role === "USER") redirect("/dashboard/user");

  const params = await searchParams;
  const emailVerified = params.verified === "1";

  return (
    <div className="min-h-screen bg-brand-page">
      <SiteHeaderSimple />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-marketplace md:p-10">
          {emailVerified && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Email adresa je uspješno verifikovana! Sada se možete prijaviti.
            </div>
          )}
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-bold text-brand-navy md:text-3xl">Dobrodošli nazad</h1>
            <p className="mt-3 text-slate-600">Prijavite se na svoj nalog da nastavite</p>
          </div>
          <LoginForm />
          <p className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost" size="sm">← Nazad na početnu</Button>
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-[#94A3B8]">
            Sigurna prijava • Vaši podaci su zaštićeni
          </p>
        </div>
      </div>
    </div>
  );
}
