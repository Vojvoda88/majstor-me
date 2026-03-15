import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CATEGORY_CONFIG } from "@/lib/categories";

const CATEGORY_IMAGES: Record<string, string> = {
  Vodoinstalater: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop",
  Električar: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop",
  Keramičar: "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=600&auto=format&fit=crop",
  "Klima servis": "https://images.unsplash.com/photo-1595467793069-45069736f88d?w=600&auto=format&fit=crop",
  Stolar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop",
  Čišćenje: "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=600&auto=format&fit=crop",
};

const TOP_6 = CATEGORY_CONFIG.filter((c) =>
  ["Vodoinstalater", "Električar", "Keramičar", "Klima servis", "Stolar", "Čišćenje"].includes(c.displayName)
);

export function CategoriesGrid() {
  return (
    <section id="kategorije" className="py-24">
      <h2 className="font-display mb-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        Popularni poslovi
      </h2>
      <p className="mb-12 max-w-xl text-slate-500">
        Od vodoinstalatera do keramičara — pronađite provjerene majstore za svaki posao
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOP_6.map((cat) => {
          const imgSrc = CATEGORY_IMAGES[cat.displayName] ?? CATEGORY_IMAGES.Vodoinstalater;
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative h-56 overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:shadow-premium md:h-64"
            >
              <Image
                src={imgSrc}
                alt={cat.displayName}
                fill
                className="object-cover transition duration-500 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent transition duration-300 group-hover:from-slate-900/90" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-xl font-bold text-white drop-shadow-lg">{cat.displayName}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-white/90 opacity-0 transition group-hover:opacity-100">
                  Pogledaj majstore
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <Link
        href="/categories"
        className="mt-10 inline-flex items-center gap-2 text-[15px] font-semibold text-[#1d4ed8] transition hover:text-[#1e40af] hover:gap-3"
      >
        Vidi sve kategorije (16)
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
