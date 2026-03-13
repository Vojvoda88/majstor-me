import Link from "next/link";
import { MapPin } from "lucide-react";
import { CITIES } from "@/lib/constants";

const CITY_GRADIENTS = [
  "from-[#2563EB]/80 to-[#1d4ed8]/80",
  "from-[#059669]/80 to-[#047857]/80",
  "from-[#7c3aed]/80 to-[#6d28d9]/80",
  "from-[#dc2626]/80 to-[#b91c1c]/80",
];

export function CitiesSection() {
  const featuredCities = CITIES.slice(0, 8);

  return (
    <section id="gradovi" className="py-12 lg:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-center text-[#0F172A] mb-8">
          Gradovi u Crnoj Gori
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredCities.map((city, i) => (
            <Link
              key={city}
              href={`/request/create?city=${encodeURIComponent(city)}`}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${CITY_GRADIENTS[i % CITY_GRADIENTS.length]}`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white/90" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-white font-semibold text-lg drop-shadow-sm">{city}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
