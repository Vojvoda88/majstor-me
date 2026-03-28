import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { Button } from "@/components/ui/button";
import { SiteHeaderSimple } from "@/components/layout/site-header-simple";

export const metadata: Metadata = {
  title: "Zaboravljena lozinka",
  description: "Reset lozinke — BrziMajstor.ME",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/");

  return (
    <div className="min-h-screen bg-brand-page">
      <SiteHeaderSimple />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-marketplace md:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-bold text-brand-navy md:text-3xl">Zaboravljena lozinka</h1>
            <p className="mt-3 text-slate-600">Unesite email — šaljemo link za novu lozinku ako nalog postoji.</p>
          </div>
          <ForgotPasswordForm />
          <p className="mt-6 text-center">
            <Link href="/login">
              <Button variant="ghost" size="sm">← Nazad na prijavu</Button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
