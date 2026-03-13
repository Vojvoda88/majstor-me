import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileNavSimple } from "./mobile-nav-simple";

export function SiteHeaderSimple() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors">
          Majstor.me
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm">Prijava</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Registracija</Button>
          </Link>
        </nav>
        <MobileNavSimple />
      </div>
    </header>
  );
}
