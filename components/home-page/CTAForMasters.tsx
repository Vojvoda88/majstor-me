import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTAForMasters() {
  return (
    <section className="py-24">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d4ed8] via-[#1e40af] to-[#1e3a8a] p-12 md:p-16">
        <div className="flex max-w-3xl flex-col md:flex-row md:items-center md:justify-between md:gap-12">
          <div>
            <h3 className="font-display text-2xl font-bold text-white md:text-3xl">
              Vi ste majstor?
            </h3>
            <p className="mt-4 max-w-lg text-lg text-white/90">
              Prijavite profil besplatno. Primajte zahtjeve od klijenata. Bez provizije na objavljivanje.
            </p>
          </div>
          <Link
            href="/register"
            className="mt-8 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-10 py-4 text-[16px] font-bold text-[#1d4ed8] shadow-lg transition hover:bg-white/95 hover:shadow-xl hover:gap-3 md:mt-0"
          >
            Prijavite se kao majstor
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
