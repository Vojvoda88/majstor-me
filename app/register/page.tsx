import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";
import { Button } from "@/components/ui/button";
import { SiteHeaderSimple } from "@/components/layout/site-header-simple";

export const metadata: Metadata = {
  title: "Registracija | Majstor.me",
  description: "Registrujte se kao korisnik ili majstor na Majstor.me",
};

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (session) {
    const role = (session.user as { role?: string }).role;
    if (role === "HANDYMAN") redirect("/dashboard/handyman");
    if (role === "ADMIN") redirect("/admin");
    if (role === "USER") redirect("/dashboard/user");
    redirect("/");
  }

  const { type } = await searchParams;
  const defaultRole = type === "majstor" ? "HANDYMAN" : "USER";

  return (
    <div className="min-h-screen bg-brand-page">
      <SiteHeaderSimple />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-marketplace sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-bold text-brand-navy sm:text-3xl">Kreirajte nalog</h1>
            <p className="mt-3 text-slate-600">
              Korisnik ili majstor — izaberite kako želite da koristite platformu
            </p>
          </div>
          <RegisterForm defaultRole={defaultRole} />
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
