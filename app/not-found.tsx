import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Stranica nije pronađena</h1>
      <p className="mt-2 text-muted-foreground">Tražena stranica ne postoji ili je uklonjena.</p>
      <Link href="/" className="mt-6">
        <Button>Nazad na početnu</Button>
      </Link>
    </div>
  );
}
