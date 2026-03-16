import { ShieldCheck, Star, Zap, HandHeart } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Provjereni majstori",
    desc: "Ručno provjeravamo profile i podatke majstora prije nego što počnu da primaju zahtjeve.",
  },
  {
    icon: Star,
    title: "Ocjene i recenzije",
    desc: "Vidite iskustva drugih korisnika iz Crne Gore prije nego što pozovete majstora.",
  },
  {
    icon: Zap,
    title: "Brze ponude",
    desc: "Objavite zahtjev za par minuta i dobijte ponude od više majstora umjesto da ih zovete redom.",
  },
  {
    icon: HandHeart,
    title: "Bez obaveze za korisnike",
    desc: "Objava zahtjeva je besplatna. Sami birate kome ćete se javiti i kada ćete prihvatiti ponudu.",
  },
];

export function TrustSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-0">
        <h2 className="mb-3 text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
          Zašto korisnici vjeruju Majstor.me
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-sm text-slate-500 sm:text-base">
          Sve je prilagođeno realnim poslovima u Crnoj Gori – od provjere majstora do načina na koji dobijate ponude.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm transition hover:border-slate-200 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {item.desc}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
