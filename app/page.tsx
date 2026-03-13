import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SmartSearch } from "@/components/home/smart-search";
import { CategoryCards } from "@/components/home/category-cards";
import { TrustSection } from "@/components/home/trust-section";
import { FeaturedMajstori } from "@/components/home/featured-majstori";
import { CheckCircle2, Star, MapPin, FileText, Mail, UserCheck } from "lucide-react";

const FEATURED_CITIES = ["Podgorica", "Nikšić", "Budva", "Bar", "Kotor", "Herceg Novi", "Tivat"];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SiteHeader />

      <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#1E293B]">
          <div className="relative px-6 py-16 sm:px-12 sm:py-24 lg:px-16 lg:py-28">
            <div className="mx-auto max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Vaš majstor za svaki posao u Crnoj Gori
              </h1>
              <p className="mt-4 text-lg text-slate-300 sm:text-xl">
                Pronađite provjerene majstore brzo i jednostavno.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/request/create">
                  <Button size="lg" className="h-12 px-6 text-base">Objavi zahtjev</Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="h-12 border-2 border-white/50 bg-white/5 px-6 text-base text-white hover:bg-white/10">
                    Registruj se besplatno
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-white/90"><CheckCircle2 className="h-5 w-5 text-[#60A5FA]" /><span className="text-sm font-medium">Verifikovani majstori</span></div>
                <div className="flex items-center gap-2 text-white/90"><Star className="h-5 w-5 text-[#60A5FA]" /><span className="text-sm font-medium">Ocjene korisnika</span></div>
                <div className="flex items-center gap-2 text-white/90"><MapPin className="h-5 w-5 text-[#60A5FA]" /><span className="text-sm font-medium">Lokalno za Crnu Goru</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Search */}
        <div className="mt-8">
          <SmartSearch />
        </div>

        {/* Kategorije */}
        <section className="mt-16 sm:mt-20">
          <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">Popularne kategorije</h2>
          <p className="mt-2 text-[#64748B]">Brzi pristup najtraženijim vrstama poslova</p>
          <div className="mt-8">
            <CategoryCards />
          </div>
        </section>

        {/* Kako radi */}
        <section className="mt-16 sm:mt-20">
          <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">Kako funkcioniše?</h2>
          <p className="mt-2 text-[#64748B]">3 jednostavna koraka do majstora</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-card">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]"><FileText className="h-7 w-7" /></div>
              <h3 className="text-lg font-semibold text-[#0F172A]">Objavite zahtjev</h3>
              <p className="mt-2 text-[#64748B]">Opišite svoj problem i pošaljite zahtjev.</p>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-card">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]"><Mail className="h-7 w-7" /></div>
              <h3 className="text-lg font-semibold text-[#0F172A]">Dobijte ponude</h3>
              <p className="mt-2 text-[#64748B]">Primite ponude odmah od majstora.</p>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-card">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]"><UserCheck className="h-7 w-7" /></div>
              <h3 className="text-lg font-semibold text-[#0F172A]">Izaberite majstora</h3>
              <p className="mt-2 text-[#64748B]">Odaberite i angažujte najboljeg.</p>
            </div>
          </div>
        </section>

        {/* Gradovi */}
        <section className="mt-16 sm:mt-20">
          <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">Gradovi u Crnoj Gori</h2>
          <p className="mt-2 text-[#64748B]">Platforma pokriva cijelu zemlju</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_CITIES.map((city) => (
              <Link key={city} href="/register" className="group flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card transition-all hover:border-[#2563EB]/30 hover:shadow-card-hover">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#64748B] group-hover:bg-[#2563EB]/10 group-hover:text-[#2563EB]">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="font-medium text-[#1E293B] group-hover:text-[#2563EB]">{city}</span>
                <span className="ml-auto text-[#94A3B8] opacity-0 group-hover:opacity-100">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="mt-16 sm:mt-20">
          <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">Zašto odabrati Majstor.me?</h2>
          <div className="mt-8">
            <TrustSection />
          </div>
        </section>

        {/* Featured majstori */}
        <section className="mt-16 sm:mt-20">
          <h2 className="text-2xl font-semibold text-[#0F172A] sm:text-3xl">Najbolje ocijenjeni majstori</h2>
          <div className="mt-8">
            <FeaturedMajstori />
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-16 sm:mt-20 rounded-2xl bg-[#1E293B] px-8 py-16 text-center">
          <h2 className="text-2xl font-semibold text-white">Spremni za prvi zahtjev?</h2>
          <p className="mt-2 text-[#94A3B8]">Registrujte se besplatno i počnite odmah</p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link href="/request/create">
              <Button size="lg" className="bg-white text-[#1E293B] hover:bg-[#F1F5F9]">Objavi zahtjev</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">Registracija kao majstor</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
