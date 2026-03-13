import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, MapPin } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#1E293B] pt-24 pb-20 lg:pt-32 lg:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl font-display">
            Vaš majstor za svaki posao u Crnoj Gori
          </h1>
          <p className="mt-4 text-lg text-slate-300 sm:text-xl">
            Pronađite provjerene majstore brzo i jednostavno.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
            <Link href="/request/create">
              <Button size="lg" className="h-12 px-6 text-base bg-white text-[#1E293B] hover:bg-slate-100">
                Objavi zahtjev
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-2 border-white/50 bg-white/5 px-6 text-base text-white hover:bg-white/10"
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
              <span className="text-sm font-medium">Ocjene korisnika</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="h-5 w-5 text-[#60A5FA]" />
              <span className="text-sm font-medium">Lokalno za Crnu Goru</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
