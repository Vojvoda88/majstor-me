import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            Majstor.me
          </Link>
          <nav className="flex items-center gap-4">
            {session ? (
              <>
                {session.user.role === "HANDYMAN" ? (
                  <Link href="/dashboard/handyman">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                ) : session.user.role === "USER" ? (
                  <Link href="/dashboard/user">
                    <Button variant="ghost">Moji zahtjevi</Button>
                  </Link>
                ) : null}
                {session.user.role === "USER" ? (
                  <Link href="/request/create">
                    <Button variant="default">Novi zahtjev</Button>
                  </Link>
                ) : null}
                {session.user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="outline">Admin</Button>
                  </Link>
                )}
                <Link href="/api/auth/signout">
                  <Button variant="ghost">Odjavi se</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Prijava</Button>
                </Link>
                <Link href="/register">
                  <Button>Registracija</Button>
                </Link>
              </>
            )}
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
          {!session && (
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
          )}
          {session?.user?.role === "USER" && (
            <div className="mt-8">
              <Link href="/request/create">
                <Button size="lg">Kreiraj novi zahtjev</Button>
              </Link>
            </div>
          )}
          {session?.user?.role === "HANDYMAN" && (
            <div className="mt-8">
              <Link href="/dashboard/handyman">
                <Button size="lg">Pregledaj zahtjeve</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
