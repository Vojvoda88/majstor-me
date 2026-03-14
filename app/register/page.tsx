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
  if (session) redirect("/");

  const { type } = await searchParams;
  const defaultRole = type === "majstor" ? "HANDYMAN" : "USER";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SiteHeaderSimple />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">Kreirajte nalog</h1>
            <p className="mt-2 text-[#64748B]">Korisnik ili majstor — izaberite kako želite da koristite platformu</p>
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
