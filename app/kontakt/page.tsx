import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import { getSupportEmail, getSupportMailtoHref, getSupportPhone } from "@/lib/support-contact";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kontakt i podrška",
  description: "Pitanja za tim BrziMajstor.ME — korisnici, majstori, tehnička podrška.",
};

export default function KontaktPage() {
  const email = getSupportEmail();
  const phone = getSupportPhone();
  const mailto = getSupportMailtoHref();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#1d4ed8]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Nazad na početnu
        </Link>

        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Kontakt i podrška</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Ako ste korisnik ili majstor i imate bilo kakva dodatna pitanja (nalog, oglas, krediti, tehnički problem),
          pišite nam na email ispod. Odgovaramo što prije možemo.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1d4ed8]/10 text-[#1d4ed8]">
              <Mail className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Email</p>
              <a href={`mailto:${email}`} className="mt-0.5 block break-all text-[15px] text-[#1d4ed8] hover:underline">
                {email}
              </a>
              <Button asChild className="mt-3 w-full sm:w-auto">
                <a href={mailto}>Pošalji poruku (otvara email)</a>
              </Button>
            </div>
          </div>

          {phone && (
            <div className="flex gap-3 border-t border-slate-100 pt-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                <Phone className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Telefon</p>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-0.5 block text-[15px] text-[#1d4ed8] hover:underline">
                  {phone}
                </a>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-slate-500">
          Za hitne sigurnosne prijave koristite isti email i jasno navedite „sigurnost“ u naslovu. Ako ste izgubili link za
          guest oglas, u poruci navedite grad i kratak opis zahtjeva — možemo vam poslati novi pristupni link nakon
          provjere.
        </p>
      </div>
    </div>
  );
}
