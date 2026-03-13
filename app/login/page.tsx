import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { Button } from "@/components/ui/button";
import { SiteHeaderSimple } from "@/components/layout/site-header-simple";

export const metadata: Metadata = {
  title: "Prijava | Majstor.me",
  description: "Prijavite se na Majstor.me nalog",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SiteHeaderSimple />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#0F172A]">Dobrodošli natrag</h1>
            <p className="mt-2 text-[#64748B]">Prijavite se na svoj nalog da nastavite</p>
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
