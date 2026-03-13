import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Star,
  MapPin,
  Wrench,
  Zap,
  Wind,
  Paintbrush,
  Sofa,
  Sparkles,
  Truck,
  ClipboardList,
  BadgeCheck,
} from "lucide-react";
import { HomeHeader } from "@/components/home-page/home-header";
import { HeroSearch } from "@/components/home-page/hero-search";

const categories = [
  { title: "Vodoinstalater", icon: Wrench, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80", rating: "4.9", reviews: "32" },
  { title: "Električar", icon: Zap, image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80", rating: "4.8", reviews: "27" },
  { title: "Klima servis", icon: Wind, image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80", rating: "4.9", reviews: "31" },
  { title: "Moler / sitne kućne popravke", icon: Paintbrush, image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80", rating: "4.7", reviews: "19" },
  { title: "Montaža namještaja", icon: Sofa, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80", rating: "4.8", reviews: "24" },
  { title: "Čišćenje", icon: Sparkles, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80", rating: "4.9", reviews: "28" },
  { title: "Selidbe", icon: Truck, image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=900&q=80", rating: "4.7", reviews: "16" },
];

const featuredHandymen = [
  { name: "Marko Petrović", category: "Električar", city: "Podgorica", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80", rating: "4.9", reviews: "62" },
  { name: "Zoran Radović", category: "Vodoinstalater", city: "Nikšić", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80", rating: "4.8", reviews: "41" },
  { name: "Nenad Knežević", category: "Klima servis", city: "Budva", image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80", rating: "4.9", reviews: "37" },
];

const cities = [
  { name: "Podgorica", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" },
  { name: "Nikšić", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80" },
  { name: "Budva", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80" },
  { name: "Bar", image: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=80" },
];

const steps = [
  { title: "Objavi zahtjev", desc: "Opiši problem i pošalji zahtjev za nekoliko minuta.", icon: ClipboardList },
  { title: "Dobij ponude", desc: "Provjereni majstori ti šalju ponude i prijedloge termina.", icon: ClipboardList },
  { title: "Izaberi majstora", desc: "Pregledaj profil, ocjene i izaberi najboljeg za posao.", icon: BadgeCheck },
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1621905252472-e8fdc8b0d2d7?auto=format&fit=crop&w=1400&q=80";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <HomeHeader />

        {/* Integrated premium hero - text left, image right, one block */}
        <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-[0_20px_80px_rgba(15,23,42,0.12)]">
          <div className="grid min-h-[720px] items-stretch lg:grid-cols-[1.05fr_1fr]">
            <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                Provjereni majstori širom Crne Gore
              </div>

              <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Pronađite
                <span className="block text-slate-900">majstora u blizini</span>
                <span className="block text-blue-600">za nekoliko minuta</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                Platforma za provjerene majstore, brze ponude i jednostavno pronalaženje usluga za dom u cijeloj Crnoj Gori.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/request/create" className="inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-7 text-lg font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-700">
                  Objavi zahtjev
                </Link>
                <Link href="/register" className="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-slate-300 bg-white px-7 text-lg font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50">
                  Registruj se besplatno
                </Link>
              </div>

              <HeroSearch />

              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm sm:text-base">
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

            <div className="relative min-h-[420px] lg:min-h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-white/10 to-transparent lg:hidden" />
              <div className="absolute inset-y-0 left-0 z-10 hidden w-40 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent lg:block" />
              <Image
                src={HERO_IMAGE}
                alt="Majstor u kombinezonu radi u modernom domu"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        <section id="kategorije" className="py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Popularne usluge</p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Pronađi pravu uslugu za svoj dom</h2>
            </div>
            <Link href="/register" className="hidden font-semibold text-blue-600 md:block">Prikaži sve</Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={`/request/create?category=${encodeURIComponent(item.title)}`}>
                  <article className="group overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_70px_rgba(15,23,42,0.14)]">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="400px" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
                      <div className="absolute left-4 top-4 inline-flex rounded-2xl bg-white/90 p-2 backdrop-blur">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-700">{item.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{item.reviews} recenzije</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="pb-20">
          <div className="mb-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Izdvojeni profili</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Najbolje ocijenjeni majstori</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredHandymen.map((person) => (
              <article key={person.name} className="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
                <div className="relative h-60">
                  <Image src={person.image} alt={person.name} fill className="object-cover" sizes="400px" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 backdrop-blur">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    Verifikovan
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-slate-900">{person.name}</h3>
                  <p className="mt-1 text-slate-500">{person.category} • {person.city}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-800">{person.rating}</span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{person.reviews} recenzija</span>
                  </div>
                  <Link href="/register" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 px-5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                    Pregledaj majstore
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="kako-radi" className="pb-20">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Jednostavno i brzo</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Kako funkcioniše?</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-[28px] border border-white/80 bg-white p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{step.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="gradovi" className="pb-20">
          <div className="mb-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Cijela Crna Gora</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Gradovi u kojima rastemo</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cities.map((city) => (
              <Link key={city.name} href={`/request/create?city=${encodeURIComponent(city.name)}`}>
                <article className="group relative h-72 overflow-hidden rounded-[28px] shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
                  <Image src={city.image} alt={city.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="400px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <h3 className="text-3xl font-black text-white">{city.name}</h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <section className="pb-24">
          <div className="overflow-hidden rounded-[36px] border border-white/80 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-12 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:px-10 lg:px-16 lg:py-16">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-300">Spremni da krenete?</p>
                <h2 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl">Objavi zahtjev i pronađi pravog majstora bez gubljenja vremena</h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Brže do ponuda, više povjerenja i bolji pregled majstora na jednom mjestu.</p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
                <Link href="/request/create" className="inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-7 text-lg font-semibold text-white transition hover:bg-blue-700">
                  Objavi zahtjev
                </Link>
                <Link href="/register" className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-7 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/15">
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
