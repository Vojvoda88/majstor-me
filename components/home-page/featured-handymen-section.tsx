import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Star, Sparkles } from "lucide-react";

const featuredHandymen = [
  { name: "Marko Petrović", category: "Električar", city: "Podgorica", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", rating: "4.9", reviews: "62", sponsored: true },
  { name: "Zoran Radović", category: "Vodoinstalater", city: "Nikšić", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", rating: "4.8", reviews: "41", sponsored: true },
  { name: "Nenad Knežević", category: "Klima servis", city: "Budva", image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&q=80", rating: "4.9", reviews: "37", sponsored: false },
  { name: "Miloš Đukić", category: "Moler", city: "Bar", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", rating: "4.7", reviews: "28", sponsored: true },
];

export function FeaturedHandymenSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="mb-6 flex items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Izdvojeni profili</p>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Preporučeno</span>
      </div>
      <h2 className="mb-8 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Istaknuti majstori</h2>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
        {featuredHandymen.map((person) => (
          <Link
            key={person.name}
            href="/register"
            className="group flex min-w-[260px] flex-shrink-0 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)] md:min-w-0"
          >
            <div className="relative h-36 overflow-hidden">
              <Image src={person.image} alt={person.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="280px" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
              <div className="absolute left-3 top-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  Verifikovan
                </span>
                {person.sponsored && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    <Sparkles className="h-3 w-3" />
                    Sponzorisano
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-900">{person.name}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{person.category} • {person.city}</p>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-800">{person.rating}</span>
                </div>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{person.reviews} recenzija</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
