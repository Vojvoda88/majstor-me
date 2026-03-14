"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const FALLBACK_TESTIMONIALS = [
  { name: "Marko M.", city: "Podgorica", text: "Brzo sam našao vodoinstalatera u Nikšiću.", rating: 5 },
  { name: "Ana K.", city: "Budva", text: "Električar je došao isti dan.", rating: 5 },
  { name: "Stefan P.", city: "Bar", text: "Odlična platforma za pronalazak majstora.", rating: 5 },
];

type Testimonial = {
  name: string;
  city: string;
  text: string;
  rating: number;
};

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials?.length > 0) {
          setTestimonials(data.testimonials);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-10 lg:py-12">
      <h2 className="mb-6 text-center text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
        Recenzije korisnika
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <article
            key={t.name}
            className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
          >
            <div className="mb-4 flex gap-1">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-slate-700">&quot;{t.text}&quot;</p>
            <p className="mt-3 text-sm font-semibold text-slate-900">{t.name}</p>
            <p className="text-sm text-slate-500">{t.city}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
