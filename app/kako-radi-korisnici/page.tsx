import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Kako radi za korisnike",
  description:
    "Narodno i jasno: kako ide objava zahtjeva, admin pregled i ponude majstora na BrziMajstor.ME.",
  alternates: { canonical: `${baseUrl}/kako-radi-korisnici` },
  openGraph: {
    title: "Kako radi za korisnike | BrziMajstor.ME",
    description:
      "Objava je besplatna, ide kratak admin pregled, pa ponude majstora. Pročitajte korak po korak.",
    url: `${baseUrl}/kako-radi-korisnici`,
    siteName: "BrziMajstor.ME",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kako radi za korisnike | BrziMajstor.ME",
    description:
      "Objava zahtjeva je besplatna, a ponude birate svojim tempom.",
  },
};

const steps = [
  {
    n: "01",
    title: "Objavite šta vam treba",
    body: "Napišete šta želite da se uradi, u kom ste gradu i po potrebi dodate slike. Objava je besplatna.",
  },
  {
    n: "02",
    title: "Admin kratko pregleda zahtjev",
    body: "Zahtjev ide na kratak pregled da sistem ostane čist i da majstori dobijaju smislenije upite.",
  },
  {
    n: "03",
    title: "Zahtjev ide odgovarajućim majstorima",
    body: "Kada je odobren, zahtjev vide majstori kojima je taj posao relevantan po branši i lokaciji.",
  },
  {
    n: "04",
    title: "Majstori šalju ponude",
    body: "Majstori koji žele posao šalju ponude. Vi ne zovete redom više brojeva.",
  },
  {
    n: "05",
    title: "Pregledate i birate",
    body: "Uporedite ponude i odlučite kome ćete odgovoriti. Nema obaveze da prihvatite bilo koga.",
  },
];

const faq = [
  {
    q: "Da li je objava besplatna?",
    a: "Da. Objavljivanje zahtjeva za korisnike je besplatno.",
  },
  {
    q: "Koliko traje admin pregled?",
    a: "Pregled je kratak. Cilj je da zahtjev što prije ide relevantnim majstorima, ali i da sadržaj ostane kvalitetan.",
  },
  {
    q: "Da li moram prihvatiti neku ponudu?",
    a: "Ne. Ponude pregledate u svom ritmu i birate samo ako vam neka odgovara.",
  },
  {
    q: "Kako opet da nađem svoj zahtjev?",
    a: "Ako ste bez naloga, čuvajte link/token sa success stranice. Ako ste sa nalogom, zahtjev vidite kroz svoj pristup.",
  },
  {
    q: "Šta ako sam poslao zahtjev bez naloga?",
    a: "I dalje možete pratiti svoj zahtjev preko linka koji dobijete nakon objave.",
  },
];

export default function KakoRadiKorisniciPage() {
  return (
    <main className="min-h-screen bg-brand-page">
      <PublicHeader />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Kako radi</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Kako radi za korisnike
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Prosto rečeno: objavite posao, sačekate kratak pregled i dobijate ponude. Vi birate kad i kome ćete odgovoriti.
          </p>
          <div className="mt-6">
            <Link
              href="/request/create"
              className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-7 text-sm font-bold text-brand-navy shadow-[0_12px_30px_-14px_rgba(245,158,11,0.5)] transition hover:brightness-105"
            >
              Objavi zahtjev
            </Link>
          </div>
        </section>

        <section className="mt-8 space-y-4 sm:mt-10">
          {steps.map((step) => (
            <article
              key={step.n}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_34px_-24px_rgba(15,23,42,0.35)] sm:p-6"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Korak {step.n}</p>
              <h2 className="mt-2 font-display text-xl font-bold text-slate-900">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{step.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Šta se dešava poslije objave?</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Posle objave vaš zahtjev ne “nestaje”. Ide na kratak pregled, zatim ga vide odgovarajući majstori i mogu slati
            ponude. Vi pratite situaciju i birate šta vam najviše odgovara.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Često postavljana pitanja</h2>
          <div className="mt-5 space-y-5">
            {faq.map((item) => (
              <article key={item.q}>
                <h3 className="font-semibold text-slate-900">{item.q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 text-center">
          <Link
            href="/request/create"
            className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 text-base font-bold text-brand-navy shadow-[0_14px_32px_-14px_rgba(245,158,11,0.5)] transition hover:brightness-105"
          >
            Objavi besplatan zahtjev
          </Link>
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}

