import Link from "next/link";

const FOOTER_NAV = [
  { href: "/", label: "Početna" },
  { href: "/categories", label: "Kategorije" },
  { href: "/request/create", label: "Objavi zahtjev" },
  { href: "/#kako-radi", label: "Kako funkcioniše" },
  { href: "/register?type=majstor", label: "Za majstore" },
  { href: "/#faq", label: "Česta pitanja" },
  { href: "/instaliraj", label: "Instaliraj aplikaciju" },
  { href: "/kontakt", label: "Kontakt i podrška" },
] as const;

const FOOTER_LEGAL = [
  { href: "/politika-privatnosti", label: "Politika privatnosti" },
  { href: "/uslovi-koriscenja", label: "Uslovi korišćenja" },
] as const;

/**
 * Javno podnožje — brend, navigacija, pravni dokumenti, copyright.
 */
export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200/90 bg-gradient-to-b from-[#FAFBFC] to-slate-100/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_auto_auto] md:gap-12">
          {/* Brend */}
          <div className="max-w-xs">
            <p className="font-display text-lg font-bold tracking-tight text-brand-navy">
              BrziMajstor.ME
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Platforma za lakše povezivanje korisnika i majstora u Crnoj Gori — objavite zahtjev i dobijte ponude.
            </p>
          </div>

          {/* Navigacija */}
          <nav aria-label="Navigacija" className="flex flex-col gap-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Platforma
            </p>
            {FOOTER_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-600 underline-offset-4 transition hover:text-brand-navy hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Pravni dokumenti */}
          <nav aria-label="Pravni dokumenti" className="flex flex-col gap-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Pravno
            </p>
            {FOOTER_LEGAL.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-600 underline-offset-4 transition hover:text-brand-navy hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} BrziMajstor.ME — Sva prava zadržana.
          </p>
          <div className="flex gap-4">
            {FOOTER_LEGAL.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
