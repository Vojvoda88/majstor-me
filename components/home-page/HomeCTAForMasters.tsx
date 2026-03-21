import Link from "next/link";

export function HomeCTAForMasters() {
  return (
    <section className="mt-8 md:mt-12">
      <div className="mx-auto max-w-[430px] px-4 md:max-w-4xl md:px-6">
        <div
          className="rounded-[24px] border border-[#E7EDF5] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          style={{
            background: "linear-gradient(180deg, rgba(219,234,254,0.5) 0%, rgba(255,255,255,0.9) 100%)",
          }}
        >
          <h3 className="text-lg font-semibold text-[#0F172A]">Nudite usluge?</h3>
          <p className="mt-2 text-sm text-[#475569]">
            Prijavite svoj profil i počnite primati zahtjeve od klijenata u vašoj oblasti.
          </p>
          <Link
            href="/register?type=majstor"
            className="mt-4 flex h-[48px] items-center justify-center rounded-[14px] border border-[#D6E2F1] bg-white text-[15px] font-medium text-[#0F172A] transition active:scale-[0.98]"
          >
            Prijavite profil
          </Link>
        </div>
      </div>
    </section>
  );
}
