import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] pb-20 pt-16">
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
          404 – Stranica nije pronađena
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl md:text-4xl">
          Ova adresa ne vodi do majstora.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[#64748B] sm:text-base">
          Stranica koju tražite više ne postoji ili nikada nije postojala. Možete se vratiti na početnu stranicu, pregledati
          kategorije ili odmah zatražiti majstora besplatno.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link href="/">
            <Button className="h-11 px-6 text-sm font-semibold sm:h-12 sm:px-7">
              ← Nazad na početnu
            </Button>
          </Link>
          <Link href="/categories">
            <Button
              variant="outline"
              className="h-11 px-6 text-sm font-semibold text-[#0F172A] sm:h-12 sm:px-7"
            >
              Pregledaj kategorije majstora
            </Button>
          </Link>
          <Link href="/request/create">
            <Button
              variant="outline"
              className="h-11 px-6 text-sm font-semibold text-[#0F172A] sm:h-12 sm:px-7"
            >
              Zatraži majstora
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
