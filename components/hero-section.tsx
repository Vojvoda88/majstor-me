import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, MapPin } from "lucide-react";
import { HeroSearch } from "./hero-search";

// Majstor/električar radi posao - dizajn
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=900&q=85";

const HERO_IMAGE_MOBILE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80";

export function HeroSection() {
  return (
    <>
      {/* Mobile hero - light theme with image */}
      <section className="relative overflow-hidden lg:hidden pt-24 pb-12 bg-gradient-to-b from-[#F8FAFC] to-white">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE_MOBILE}
            alt="Majstor"
            fill
            className="object-cover object-right opacity-30"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] font-display">
              Pronađite majstora u blizini za nekoliko minuta
            </h1>
            <p className="mt-3 text-base text-[#64748B]">
              Platforma #1 za provjerene majstore i brze ponude u Crnoj Gori.
            </p>
            <Link href="/request/create" className="mt-6 block">
              <Button size="lg" className="h-12 w-full sm:w-auto px-8 text-base">
                Objavi zahtjev
              </Button>
            </Link>
            <div className="mt-6">
              <HeroSearch />
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[#475569]">
                <CheckCircle2 className="h-5 w-5 text-[#2563EB]" />
                <span className="text-sm font-medium">Verifikovani majstori</span>
              </div>
              <div className="flex items-center gap-2 text-[#475569]">
                <Star className="h-5 w-5 text-[#2563EB]" />
                <span className="text-sm font-medium">4.8 od korisnika</span>
              </div>
              <div className="flex items-center gap-2 text-[#475569]">
                <MapPin className="h-5 w-5 text-[#2563EB]" />
                <span className="text-sm font-medium">Lokalno za Crnu Goru</span>
              </div>
            </div>
          </div>
          {/* Mobile hero image - visible on right/bottom */}
          <div className="mt-8 relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-lg">
            <Image
              src={HERO_IMAGE_MOBILE}
              alt="Majstor radi posao"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        </div>
      </section>

      {/* Desktop hero - dark gradient with image */}
      <section className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#1E293B] pt-32 pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="mx-auto max-w-2xl text-center lg:text-left lg:mx-0">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl xl:text-5xl font-display">
                Vaš majstor za svaki posao u Crnoj Gori
              </h1>
              <p className="mt-4 text-lg text-slate-300 sm:text-xl">
                Pronađite provjerene majstore brzo i jednostavno.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link href="/request/create">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 text-base bg-white text-[#1E293B] border-2 border-[#475569] hover:bg-slate-50 hover:border-[#334155]"
                  >
                    Objavi zahtjev
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-12 px-6 text-base bg-[#334155] text-white border-2 border-white hover:bg-[#1E293B]"
                  >
                    Registruj se besplatno
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 className="h-5 w-5 text-[#60A5FA]" />
                  <span className="text-sm font-medium">Verifikovani majstori</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Star className="h-5 w-5 text-[#60A5FA]" />
                  <span className="text-sm font-medium">4.3 (stotine 5/5)</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="h-5 w-5 text-[#60A5FA]" />
                  <span className="text-sm font-medium">Lokalno za Crnu Goru</span>
                </div>
              </div>
            </div>
            <div className="relative w-full max-w-lg xl:max-w-xl flex-shrink-0">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={HERO_IMAGE}
                  alt="Majstor radi posao"
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="(max-width: 1024px) 0vw, 560px"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
