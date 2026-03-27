import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Kako radi za majstore",
  description:
    "Detaljno i jasno za majstore: onboarding, odobreni poslovi, krediti i kada se troše na BrziMajstor.ME.",
  alternates: { canonical: `${baseUrl}/kako-radi-majstori` },
  openGraph: {
    title: "Kako radi za majstore | BrziMajstor.ME",
    description:
      "Registracija je besplatna, poslovi su relevantni i odobreni, a krediti se troše samo kada vi odlučite da otključate kontakt.",
    url: `${baseUrl}/kako-radi-majstori`,
    siteName: "BrziMajstor.ME",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kako radi za majstore | BrziMajstor.ME",
    description:
      "Bez pretplate. Birate poslove i kredite trošite samo kad vam posao odgovara.",
  },
};

const steps = [
  {
    n: "01",
    title: "Registrujete se besplatno",
    body: "Otvorite profil bez pretplate i bez mjesečne obaveze.",
  },
  {
    n: "02",
    title: "Profil ide na admin pregled",
    body: "Prije pune aktivacije profil ide na kratak pregled, da sistem ostane kvalitetan i fer za sve.",
  },
  {
    n: "03",
    title: "Dobijate relevantne i odobrene poslove",
    body: "Kada ste aktivni, vidite poslove koji su odobreni i koji su relevantni za vašu branšu/lokaciju.",
  },
  {
    n: "04",
    title: "Pregled posla je besplatan",
    body: "Prvo pročitate opis i procijenite da li se posao isplati za vas.",
  },
  {
    n: "05",
    title: "Kontakt otključavate samo kad želite",
    body: "Ako vam posao odgovara, tada kreditima otključavate kontakt i tek onda idete dalje ka ponudi.",
  },
  {
    n: "06",
    title: "Vi birate gdje se uključujete",
    body: "Ne morate otključati svaki posao. Birate samo one koji vam imaju smisla.",
  },
];

const faq = [
  {
    q: "Da li je registracija besplatna?",
    a: "Da. Registracija i kreiranje profila su besplatni.",
  },
  {
    q: "Kada trošim kredite?",
    a: "Krediti se troše kada vi odlučite da otključate kontakt za konkretan posao.",
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
    a: "Kredite kupujete kroz postojeće pakete na platformi kad vam zatrebaju, bez pretplate.",
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
            Jasno, bez pretplate i bez skrivenih troškova
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-100/95 sm:text-base">
            Ukratko: registrujete se besplatno, profil prođe pregled, vidite relevantne i odobrene poslove, pa sami birate
            kada ćete kontakt otključati kreditima.
          </p>
          <div className="mt-6">
            <Link
              href="/register?type=majstor"
              className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-7 text-sm font-bold text-brand-navy shadow-[0_12px_28px_-12px_rgba(245,158,11,0.55)] transition hover:brightness-105"
            >
              Registruj se kao majstor
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Korak po korak</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {steps.map((step) => (
              <article key={step.n} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Korak {step.n}</p>
                <h3 className="mt-2 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Šta su krediti?</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Krediti nijesu pretplata. Ne plaćate mjesečno samo da biste “bili tu”. Kupujete kredite unaprijed i trošite ih
            samo kada vi odlučite da otključate kontakt za konkretan posao.
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            <li>- Pregled platforme i osnovnog posla ne troši kredite.</li>
            <li>- Krediti se troše tek kad procijenite da posao ima smisla za vas.</li>
            <li>- Sami birate gdje želite da se uključite.</li>
          </ul>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Koliko to košta?</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Trošak zavisi od tipa i kvaliteta posla. Manji ili standardni poslovi su obično povoljniji od jačih leadova.
            U praksi, uključivanje u posao vas često izađe svega nekoliko eura, ali tačan iznos zavisi od konkretnog posla.
          </p>
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

