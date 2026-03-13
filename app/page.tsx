import Link from "next/link";
import { Button } from "@/components/ui/button";
import { REQUEST_CATEGORIES } from "@/lib/constants";

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Objavite zahtjev",
    description: "Opisite problem ili potrebu — kategorija, opis, grad, hitnost.",
  },
  {
    step: 2,
    title: "Dobijte ponude",
    description: "Majstori iz Nikšića vam šalju ponude. Poredite cijene i ocjene.",
  },
  {
    step: 3,
    title: "Izaberite majstora",
    description: "Prihvatite ponudu koja vam najviše odgovara. Dogovorite termin.",
  },
  {
    step: 4,
    title: "Ocijenite posao",
    description: "Nakon završenog posla ostavite recenziju. Pomažete drugima da nađu kvalitet.",
  },
];

const TRUST_ITEMS = [
  { label: "Verifikovani majstori", desc: "Admin tim provjerava profile" },
  { label: "Ocjene i recenzije", desc: "Od strane zadovoljnih korisnika" },
  { label: "100% lokalno", desc: "Samo majstori iz Nikšića" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            Majstor.me
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Prijava</Button>
            </Link>
            <Link href="/register">
              <Button>Registracija</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Povezujemo korisnike i majstore
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Nađi pouzdanog majstora u Nikšiću ili objavi svoj zahtjev.
            Vodoinstalater, električar, klima servis i više.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Registruj se besplatno</Button>
            </Link>
            <Link href="/request/create">
              <Button size="lg" variant="outline">
                Objavi zahtjev
              </Button>
            </Link>
          </div>
        </div>

        {/* Kategorije */}
        <section className="mt-20">
          <h2 className="text-center text-2xl font-semibold">Kategorije usluga</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Brzi pristup najtraženijim vrstama poslova
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REQUEST_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href="/register"
                className="group rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="font-medium">{cat}</span>
                <span className="ml-2 opacity-0 transition-opacity group-hover:opacity-100">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Kako radi */}
        <section className="mt-20">
          <h2 className="text-center text-2xl font-semibold">Kako radi</h2>
          <p className="mt-2 text-center text-muted-foreground">
            4 jednostavna koraka do majstora
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="rounded-lg border bg-card p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust sekcija */}
        <section className="mt-20 rounded-xl border bg-muted/30 px-6 py-10">
          <h2 className="text-center text-xl font-semibold">Zašto Majstor.me</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-8">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="text-center">
                <p className="font-medium">{item.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA na dnu */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground">Spremni za prvi zahtjev?</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/request/create">
              <Button size="lg">Objavi zahtjev</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Registracija kao majstor
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
