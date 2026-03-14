import Link from "next/link";

export function CTAForMasters() {
  return (
    <section className="py-10 sm:py-14 lg:py-16">
      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-4 py-10 text-white shadow-lg sm:px-6 sm:py-12 lg:px-14 lg:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-4xl">
            Da li ste majstor?
          </h2>
          <p className="mt-3 text-sm text-blue-100 sm:mt-4 sm:text-base lg:text-lg">
            Napravite profil i počnite primati upite iz vašeg grada.
          </p>
          <Link
            href="/register?type=majstor"
            className="mt-5 inline-flex h-14 min-h-[48px] w-full items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50 active:scale-[0.98] sm:mt-6 sm:w-auto"
          >
            Registruj se kao majstor
          </Link>
        </div>
      </div>
    </section>
  );
}
