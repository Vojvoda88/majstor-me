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
    <section className="py-10 sm:py-14 lg:py-16">
      <h2 className="mb-4 text-center text-2xl font-semibold text-gray-900 sm:mb-6 sm:text-3xl">
        Zašto koristiti Majstor.me
      </h2>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <Icon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
