import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CashActivationForm } from "@/components/credits/cash-activation-form";
import { getSupportEmail, getSupportPhone } from "@/lib/support-contact";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Aktivacija kredita u kešu",
  description: "Zahtjev za aktivaciju kredita nakon uplate u kešu ili preko Pošte Crne Gore",
};

export default async function CashActivationPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "HANDYMAN") redirect("/");

  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true, city: true },
  });

  const defaultFullName = user?.name?.trim() ?? "";
  const defaultPhone = user?.phone?.trim() ?? "";
  const defaultCity = user?.city?.trim() ?? "";
  const supportEmail = getSupportEmail();
  const supportPhone = getSupportPhone();

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/handyman/credits" className="text-sm text-slate-500 hover:text-slate-700">
          ← Krediti
        </Link>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Aktivacija kredita u kešu</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Nemate karticu? Pošaljite zahtjev za aktivaciju kredita i kontaktiraćemo vas oko uplate u kešu ili preko Pošte Crne
        Gore. Krediti se dodaju na nalog nakon dogovora i potvrde uplate.
      </p>
      <p className="mt-2 text-sm text-slate-600">
        Podrška:{" "}
        <a href={`mailto:${supportEmail}`} className="font-medium text-blue-800 underline underline-offset-2">
          {supportEmail}
        </a>
        {supportPhone ? <span className="text-slate-700"> · {supportPhone}</span> : null}
      </p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <CashActivationForm
          defaultFullName={defaultFullName}
          defaultPhone={defaultPhone}
          defaultCity={defaultCity}
          supportEmail={supportEmail}
          supportPhone={supportPhone}
        />
      </div>
    </div>
  );
}
