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

        {/* Integrated premium hero - one seamless block, image as background layer */}
        <section className="relative overflow-hidden rounded-[32px] border border-white/70 shadow-[0_16px_60px_rgba(15,23,42,0.1)]">
          {/* Full-bleed background image - handyman on right, extends under entire hero */}
          <div className="absolute inset-0">
            <Image
              src={HERO_IMAGE}
              alt="Majstor radi posao u kući"
              fill
              className="object-cover object-[65%_center] lg:object-[70%_center]"
              priority
              sizes="(max-width: 1024px) 100vw, 1440px"
            />
            {/* Single soft gradient overlay - seamless blend, no vertical cut */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-white/65 via-white/8 to-transparent"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent"
              aria-hidden
            />
          </div>

          <div className="relative z-10 grid min-h-[480px] items-stretch lg:min-h-[540px] lg:grid-cols-[1.05fr_1fr]">
            <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Provjereni majstori širom Crne Gore
              </div>

              <h1 className="max-w-xl text-3xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Pronađite
                <span className="block text-slate-900">majstora u blizini</span>
                <span className="block text-blue-600">za nekoliko minuta</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Platforma za provjerene majstore, brze ponude i jednostavno pronalaženje usluga za dom u cijeloj Crnoj Gori.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href="/request/create" className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 text-base font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-700">
                  Objavi zahtjev
                </Link>
                <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-slate-300 bg-white px-6 text-base font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50">
                  Registruj se besplatno
                </Link>
              </div>

              <HeroSearch />

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
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

            {/* Spacer for layout - image is now full-bleed background above */}
            <div className="relative min-h-[280px] lg:min-h-full" aria-hidden />
          </div>
        </section>

        {/* Istaknuti majstori - directly below hero */}
        <FeaturedHandymenSection />

        {/* Kategorije - compact cards */}
        <CategoriesSection />

        {/* Kako funkcioniše */}
        <section id="kako-radi" className="py-10 lg:py-12">
          <div className="mb-6 text-center">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Jednostavno i brzo</p>
            <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Kako funkcioniše?</h2>
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
        <section className="pb-16">
          <div className="overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-10 text-white shadow-[0_16px_50px_rgba(15,23,42,0.18)] sm:px-10 lg:px-14 lg:py-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Spremni da krenete?</p>
                <h2 className="max-w-2xl text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">Objavi zahtjev i pronađi pravog majstora bez gubljenja vremena</h2>
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
