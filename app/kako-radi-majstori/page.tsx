import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getSiteUrl } from "@/lib/site-url";
import { buildAlternates, getLocaleFromHeaderValue, LOCALE_HEADER, localizedPath } from "@/lib/i18n/seo";
import { HANDYMAN_START_BONUS_CREDITS } from "@/lib/credit-packages";

const baseUrl = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocaleFromHeaderValue(headers().get(LOCALE_HEADER));
  const localizedUrl = `${baseUrl.replace(/\/$/, "")}${localizedPath("/kako-radi-majstori", locale)}`;
  return {
    title: "Kako radi za majstore",
    description:
      "Osnovno i detaljno objašnjenje za majstore: kako napraviti profil, kako stižu poslovi i kako rade krediti na BrziMajstor.ME.",
    alternates: buildAlternates(baseUrl, "/kako-radi-majstori", locale),
    openGraph: {
      title: "Kako radi za majstore | BrziMajstor.ME",
      description:
        "Napravite profil, dobijajte obavještenja za svoje usluge i birajte kada želite da otključate kontakt klijenta.",
      url: localizedUrl,
      siteName: "BrziMajstor.ME",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Kako radi za majstore | BrziMajstor.ME",
      description:
        "Bez pretplate. Vi birate koje poslove želite i kada otključavate kontakt klijenta.",
    },
  };
}

const steps = [
  {
    n: "01",
    title: "Napravite profil",
    body: "Unesite podatke, usluge koje nudite i gradove u kojima radite.",
  },
  {
    n: "02",
    title: "Stižu vam obavještenja za vaše usluge",
    body: "Kada neko u gradu koji ste izabrali zatraži uslugu koju radite, dobijate obavještenje.",
  },
  {
    n: "03",
    title: "Javljate se samo kad želite",
    body: "Ako vam posao odgovara, otključate kontakt i direktno se dogovarate sa klijentom.",
  },
];

const faq = [
  {
    q: "Da li je registracija besplatna?",
    a: `Da. Registracija i profil su besplatni, bez pretplate. Nakon odobrenja dobijate ${HANDYMAN_START_BONUS_CREDITS.toLocaleString("sr-Latn-ME")} start kredita.`,
  },
  {
    q: "Kada trošim kredite?",
    a: "Samo kad sami odlučite da otključate kontakt klijenta za posao koji želite. Tačan broj kredita vidite prije potvrde.",
  },
  {
    q: "Da li moram otključati svaki posao?",
    a: "Ne. Sami birate koje poslove želite da otključate.",
  },
  {
    q: "Šta ako mi posao ne odgovara?",
    a: "Ako procijenite da posao nije za vas, jednostavno ga preskočite i krediti se ne troše.",
  },
  {
    q: "Kako kupujem kredite?",
    a: "Kredite kupujete kroz pakete u aplikaciji kad vam zatrebaju, bez pretplate i bez mjesečnog nameta.",
  },
  {
    q: "Da li mogu prvo pogledati posao pa odlučiti?",
    a: "Da. Pregled osnovnih informacija o poslu je besplatan; tek onda odlučujete da li otključavate kontakt.",
  },
];

export default function KakoRadiMajstoriPage() {
  return (
    <main className="min-h-screen bg-brand-page">
      <PublicHeader />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
        <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-[0_28px_64px_-36px_rgba(15,23,42,0.7)] sm:p-8 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/90">Kako radi za majstore</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Osnovno, jasno i bez komplikacija
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-100/95 sm:text-base">
            Registracija je besplatna, profil popunjavate jednom, a zatim dobijate obavještenja za poslove koji odgovaraju
            vašim uslugama i gradovima. Ako vam posao odgovara, otključavate kontakt i dogovarate se direktno sa klijentom.
            Nakon odobrenja profila dobijate {HANDYMAN_START_BONUS_CREDITS.toLocaleString("sr-Latn-ME")} start kredita.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register?type=majstor"
              className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-7 text-sm font-bold text-brand-navy shadow-[0_12px_28px_-12px_rgba(245,158,11,0.55)] transition hover:brightness-105"
            >
              Registruj se kao majstor
            </Link>
            <Link
              href="#detaljno"
              className="inline-flex min-h-[50px] items-center justify-center rounded-2xl border border-white/35 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Detaljnije kako radi
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Osnovno: kako radi za majstore</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {steps.map((step) => (
              <article key={step.n} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Korak {step.n}</p>
                <h3 className="mt-2 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-5">
            <Link href="#detaljno" className="text-sm font-semibold text-blue-600 hover:underline">
              Otvori detaljno objašnjenje →
            </Link>
          </div>
        </section>

        <section
          id="detaljno"
          className="scroll-mt-28 mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8"
        >
          <h2 className="font-display text-2xl font-bold text-slate-900">Detaljno kako radi</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
              <h3 className="font-semibold text-slate-900">1) Profil i odobrenje</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Registracija je besplatna. Popunite profil, kategorije i gradove. Nakon kratkog admin pregleda profil ide
                u aktivan status i pojavljujete se korisnicima.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
              <h3 className="font-semibold text-slate-900">2) Relevantni zahtjevi</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Dobijate obavještenja za zahtjeve koji odgovaraju vašoj usluzi i gradu. Vi birate da li želite da se
                uključite u konkretan posao.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
              <h3 className="font-semibold text-slate-900">3) Otključavanje kontakta</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Pregled posla je besplatan. Krediti se troše tek kada potvrdite da želite otključati kontakt klijenta.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
              <h3 className="font-semibold text-slate-900">4) Direktan dogovor</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Nakon otključavanja kontakta dogovarate se direktno sa klijentom oko termina, cijene i detalja posla.
              </p>
            </article>
          </div>
        </section>

        <section
          id="krediti"
          className="scroll-mt-28 mt-8 rounded-3xl border-2 border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="font-display text-2xl font-bold text-slate-900">Kako rade krediti?</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Ukratko, bez šminkanja: krediti nijesu pretplata. Ne plaćate mjesečno da biste “bili tu”. Trošite ih samo kad
            sami odlučite da otključate kontakt za posao koji želite.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
            <li className="flex gap-2">
              <span className="font-bold text-slate-900">•</span>
              <span>Registracija je besplatna.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-slate-900">•</span>
              <span>
                Dobijate {HANDYMAN_START_BONUS_CREDITS.toLocaleString("sr-Latn-ME")} start kredita (jednokratno pri
                odobrenom profilu).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-slate-900">•</span>
              <span>
                Pakete kredita kupujete kada vam trebaju (nema pretplate i nema obavezne mjesečne naplate).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-slate-900">•</span>
              <span>
                Tačan broj kredita za konkretan posao uvijek je prikazan prije nego što potvrdite otključavanje.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-slate-900">•</span>
              <span>Hitniji oglasi i jači leadovi mogu koštati više kredita (u aplikaciji vidite tačan broj prije otključavanja).</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-slate-900">•</span>
              <span>Nema pretplate.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-slate-900">•</span>
              <span>
                Plaćate samo kad želite otključati kontakt klijenta za posao koji birate. Pregled oglasa je besplatan.
              </span>
            </li>
          </ul>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Zašto je ovo dobro za majstore?</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            <li>- Nema pretplate i mjesečnog nameta.</li>
            <li>- Ne plaćate “na slijepo”, nego birate posao koji vam odgovara.</li>
            <li>- Sistem je fokusiran na relevantne i odobrene upite.</li>
            <li>- Plaćate samo kada želite da se stvarno uključite u konkretan posao.</li>
          </ul>
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

        <section className="mt-8 flex flex-col gap-3 text-center sm:flex-row sm:justify-center">
          <Link
            href="/register?type=majstor"
            className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 text-base font-bold text-brand-navy shadow-[0_14px_30px_-12px_rgba(245,158,11,0.5)] transition hover:brightness-105"
          >
            Registruj se kao majstor
          </Link>
          <Link
            href="/categories"
            className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Pogledaj aktivne kategorije
          </Link>
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}

