import Link from "next/link";

export function CTAForMasters() {
  return (
    <section className="mt-12 md:mt-16">
      <div>
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#0F172A]">Nudite usluge?</h3>
          <p className="mt-2 text-sm text-[#475569]">
            Prijavite svoj profil i počnite primati zahtjeve od klijenata u vašoj oblasti.
          </p>
          <Link
            href="/register"
            className="mt-4 flex h-12 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[15px] font-medium text-[#0F172A] transition hover:bg-[#F9FAFB]"
          >
            Prijavite profil
          </Link>
        </div>
      </div>
    </section>
  );
}
