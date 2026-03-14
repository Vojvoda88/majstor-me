import { ShieldCheck, Star, Zap, MapPin } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Verifikovani majstori",
    desc: "Profil majstora prolazi provjeru.",
  },
  {
    icon: Star,
    title: "Ocjene korisnika",
    desc: "Birajte po iskustvu.",
  },
  {
    icon: Zap,
    title: "Brze ponude",
    desc: "Ponude stižu brzo.",
  },
  {
    icon: MapPin,
    title: "Lokalna platforma",
    desc: "Fokus na Crnu Goru.",
  },
];

export function TrustSection() {
  return (
    <section className="py-10 lg:py-12">
      <h2 className="mb-6 text-center text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
        ZAŠTO KORISTITI MAJSTOR.ME
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-2xl border border-white/80 bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Icon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
