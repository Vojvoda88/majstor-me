import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Star,
  MapPin,
  ClipboardList,
  BadgeCheck,
} from "lucide-react";
import { HomeHeader } from "@/components/home-page/home-header";
import { HeroSearch } from "@/components/home-page/hero-search";
import { CategoriesSection } from "@/components/home-page/categories-section";
import { CitiesSection } from "@/components/home-page/cities-section";
import { FeaturedHandymenSection } from "@/components/home-page/featured-handymen-section";
import { HERO_IMAGE } from "@/lib/homepage-data";

const steps = [
  { title: "Objavi zahtjev", desc: "Opiši problem i pošalji zahtjev za nekoliko minuta.", icon: ClipboardList },
  { title: "Dobij ponude", desc: "Provjereni majstori ti šalju ponude i prijedloge termina.", icon: ClipboardList },
  { title: "Izaberi majstora", desc: "Pregledaj profil, ocjene i izaberi najboljeg za posao.", icon: BadgeCheck },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <HomeHeader />

        {/* Integrated premium hero */}
        <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-[0_20px_80px_rgba(15,23,42,0.12)]">
          <div className="grid min-h-[600px] items-stretch lg:min-h-[680px] lg:grid-cols-[1.05fr_1fr]">
            <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                Provjereni majstori širom Crne Gore
              </div>

              <h1 className="max-w-xl text-4xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl">
                Pronađite
                <span className="block text-slate-900">majstora u blizini</span>
                <span className="block text-blue-600">za nekoliko minuta</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                Platforma za provjerene majstore, brze ponude i jednostavno pronalaženje usluga za dom u cijeloj Crnoj Gori.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/request/create" className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 text-base font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-700">
                  Objavi zahtjev
                </Link>
                <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-slate-300 bg-white px-6 text-base font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50">
                  Registruj se besplatno
                </Link>
              </div>

              <HeroSearch />

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm sm:text-base">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  Verifikovani majstori
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <Star className="h-5 w-5 text-amber-500" />
                  4.8 od korisnika
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Lokalno za Crnu Goru
                </div>
              </div>
            </div>

            <div className="relative min-h-[320px] lg:min-h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-white/20 to-transparent lg:hidden" />
              <div className="absolute inset-y-0 left-0 z-10 hidden w-32 bg-gradient-to-r from-slate-50/95 via-slate-50/50 to-transparent lg:block" />
              <Image
                src={HERO_IMAGE}
                alt="Majstor radi posao u kući"
                fill
                className="object-cover object-right"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/15 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        {/* Istaknuti majstori - directly below hero */}
        <FeaturedHandymenSection />

        {/* Kategorije - compact cards */}
        <CategoriesSection />

        {/* Kako funkcioniše */}
        <section id="kako-radi" className="py-12 lg:py-16">
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Jednostavno i brzo</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Kako funkcioniše?</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-2xl border border-white/80 bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                    <Icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{step.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Gradovi */}
        <CitiesSection />

        {/* CTA */}
        <section className="pb-20">
          <div className="overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:px-10 lg:px-16 lg:py-14">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Spremni da krenete?</p>
                <h2 className="max-w-2xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">Objavi zahtjev i pronađi pravog majstora bez gubljenja vremena</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">Brže do ponuda, više povjerenja i bolji pregled majstora na jednom mjestu.</p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
                <Link href="/request/create" className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 text-base font-semibold text-white transition hover:bg-blue-700">
                  Objavi zahtjev
                </Link>
                <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur transition hover:bg-white/15">
                  Registruj se besplatno
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
