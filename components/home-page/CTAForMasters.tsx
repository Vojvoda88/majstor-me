import Link from "next/link";

export function CTAForMasters() {
  return (
    <section className="py-10 lg:py-12">
      <div className="overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-10 text-white shadow-[0_16px_50px_rgba(37,99,235,0.25)] sm:px-10 lg:px-14 lg:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            Da li ste majstor?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Napravite profil i počnite primati upite iz vašeg grada.
          </p>
          <Link
            href="/register?type=majstor"
            className="mt-6 inline-flex h-14 items-center justify-center rounded-2xl bg-white px-8 text-base font-bold text-blue-700 shadow-xl transition hover:bg-blue-50"
          >
            Registruj se kao majstor
          </Link>
        </div>
      </div>
    </section>
  );
}
