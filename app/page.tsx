import Link from "next/link";
import { Button } from "@/components/ui/button";
import { REQUEST_CATEGORIES } from "@/lib/constants";

const HOW_IT_WORKS = [
  { step: 1, title: "Objavite zahtjev", description: "Opisite problem ili potrebu — kategorija, opis, grad, hitnost." },
  { step: 2, title: "Dobijte ponude", description: "Majstori iz cijele Crne Gore vam šalju ponude. Poredite cijene i ocjene." },
  { step: 3, title: "Izaberite majstora", description: "Prihvatite ponudu koja vam najviše odgovara. Dogovorite termin." },
];

const TRUST_ITEMS = [
  { label: "Lokalno za Crnu Goru", desc: "Majstori iz svih gradova Crne Gore" },
  { label: "Verifikovani profili", desc: "Admin tim provjerava sve majstore" },
  { label: "Ocjene i recenzije", desc: "Od strane zadovoljnih korisnika" },
  { label: "Brže do majstora", desc: "Ponude stižu odmah na email" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-[#0F172A]">Majstor.me</Link>
          <nav className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Prijava</Button></Link>
            <Link href="/register"><Button size="sm">Registracija</Button></Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
            Povezujemo korisnike i majstore
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#64748B] sm:text-xl">
            Nađi pouzdanog majstora u cijeloj Crnoj Gori ili objavi svoj zahtjev.
            Vodoinstalater, električar, klima servis i više.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Registruj se besplatno</Button>
            </Link>
            <Link href="/request/create">
              <Button size="lg" variant="outline">
                Objavi zahtjev
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-24">
          <h2 className="text-center text-2xl font-semibold text-[#0F172A] sm:text-3xl">Kategorije usluga</h2>
          <p className="mt-3 text-center text-[#64748B]">Brzi pristup najtraženijim vrstama poslova</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REQUEST_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href="/register"
                className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card transition-all hover:border-[#2563EB]/30 hover:shadow-card-hover"
              >
                <span className="font-medium text-[#1E293B] group-hover:text-[#2563EB]">{cat}</span>
                <span className="ml-2 inline-block opacity-0 transition-opacity group-hover:opacity-100">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <h2 className="text-center text-2xl font-semibold text-[#0F172A] sm:text-3xl">Kako radi</h2>
          <p className="mt-3 text-center text-[#64748B]">3 jednostavna koraka do majstora</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-card">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB] text-lg font-bold text-white">{item.step}</div>
                <h3 className="text-lg font-semibold text-[#0F172A]">{item.title}</h3>
                <p className="mt-2 text-[#64748B]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-2xl border border-[#E2E8F0] bg-white px-8 py-14 shadow-card">
          <h2 className="text-center text-xl font-semibold text-[#0F172A]">Zašto Majstor.me</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="text-center">
                <p className="font-medium text-[#1E293B]">{item.label}</p>
                <p className="mt-1 text-sm text-[#64748B]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-2xl bg-[#1E293B] px-8 py-16 text-center">
          <h2 className="text-2xl font-semibold text-white">Spremni za prvi zahtjev?</h2>
          <p className="mt-2 text-[#94A3B8]">Registrujte se besplatno i počnite odmah</p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link href="/request/create">
              <Button size="lg" className="bg-white text-[#1E293B] hover:bg-[#F1F5F9]">Objavi zahtjev</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">Registracija kao majstor</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
