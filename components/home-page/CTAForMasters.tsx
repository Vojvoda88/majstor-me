import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTAForMasters() {
  return (
    <section className="py-24">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d4ed8] to-[#1e40af] p-10 md:p-14">
        <div className="max-w-2xl">
          <h3 className="font-display text-2xl font-bold text-white md:text-3xl">
            Nudite usluge?
          </h3>
          <p className="mt-4 text-lg text-white/90">
            Prijavite svoj profil i počnite primati zahtjeve od klijenata u vašoj oblasti.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[15px] font-bold text-[#1d4ed8] transition hover:bg-white/95 hover:gap-3"
          >
            Prijavite profil
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
