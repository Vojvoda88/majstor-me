import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Povezujemo korisnike i majstore
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Nađi pouzdanog majstora u Nikšiću ili objavi svoj zahtjev.
            Vodoinstalater, električar, klima servis i više.
          </p>
          <div className="mt-8 flex justify-center gap-4">
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
      </main>
    </div>
  );
}
