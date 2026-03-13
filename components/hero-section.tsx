import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, MapPin } from "lucide-react";
import { HeroSearch } from "./hero-search";

// Electrician/handyman working indoors - ladder, wiring, home interior
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1741388222137-c0d3007ec173?w=1200&q=90";

export function HeroSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8 lg:pb-12">
      {/* Single integrated hero container */}
      <section className="relative overflow-hidden rounded-3xl shadow-xl min-h-[480px] lg:min-h-[520px]">
        {/* Soft premium background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

        {/* Right visual layer - handyman image, extends inward, blends */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[58%] min-h-[320px] lg:min-h-0">
          <Image
            src={HERO_IMAGE}
            alt="Majstor radi posao u kući"
            fill
            className="object-cover object-right-bottom lg:object-right"
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
          {/* Subtle blend: light gradient left (text area) + dark gradient right (image stays visible, reduced brightness) */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-black/25" />
        </div>

        {/* Left content layer - z-10, sits in front */}
        <div className="relative z-10 flex flex-col justify-center min-h-[480px] lg:min-h-[520px] py-12 lg:py-16">
          <div className="max-w-xl px-6 lg:px-12 xl:px-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-[#0F172A] font-display">
              Vaš majstor za svaki posao u Crnoj Gori
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#64748B]">
              Pronađite provjerene majstore brzo i jednostavno.
            </p>

            {/* CTA buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/request/create">
                <Button
                  size="lg"
                  className="h-12 px-6 text-base bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                >
                  Objavi zahtjev
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base border-2 border-[#334155] text-[#0F172A] hover:bg-slate-100"
                >
                  Registruj se besplatno
                </Button>
              </Link>
            </div>

            {/* Search bar - integrated into hero */}
            <div className="mt-6 max-w-md">
              <HeroSearch />
            </div>

            {/* Trust row - directly below search */}
            <div className="mt-6 flex flex-wrap gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-[#475569]">
                <CheckCircle2 className="h-5 w-5 text-[#2563EB] shrink-0" />
                <span className="text-sm font-medium">Verifikovani majstori</span>
              </div>
              <div className="flex items-center gap-2 text-[#475569]">
                <Star className="h-5 w-5 text-[#2563EB] shrink-0" />
                <span className="text-sm font-medium">4.3 (stotine 5/5)</span>
              </div>
              <div className="flex items-center gap-2 text-[#475569]">
                <MapPin className="h-5 w-5 text-[#2563EB] shrink-0" />
                <span className="text-sm font-medium">Lokalno za Crnu Goru</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
