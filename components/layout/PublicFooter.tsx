import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Početna" },
  { href: "/categories", label: "Kategorije" },
  { href: "/request/create", label: "Objavi zahtjev" },
  { href: "/#kako-radi", label: "Kako funkcioniše" },
  { href: "/register?type=majstor", label: "Za majstore" },
  { href: "/#faq", label: "Česta pitanja" },
  { href: "/instaliraj", label: "Instaliraj aplikaciju" },
] as const;

/**
 * Javno podnožje — brend, korisni linkovi (samo postojeće rute), copyright.
 */
export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200/90 bg-gradient-to-b from-[#FAFBFC] to-slate-100/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-11">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
          <div className="max-w-md">
            <p className="font-display text-lg font-bold tracking-tight text-brand-navy">BrziMajstor.ME</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Platforma za lakše povezivanje korisnika i majstora u Crnoj Gori — objavite zahtjev i dobijte ponude.
            </p>
          </div>
          <nav aria-label="Linkovi u podnožju" className="flex flex-wrap gap-x-5 gap-y-2.5 text-sm md:max-w-md md:justify-end">
            {FOOTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-slate-600 underline-offset-4 transition hover:text-brand-navy hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-9 border-t border-slate-200/80 pt-6">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} BrziMajstor.ME
          </p>
        </div>
      </div>
    </footer>
  );
}
