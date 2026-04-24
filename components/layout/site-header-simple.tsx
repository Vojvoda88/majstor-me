import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileNavSimple } from "./mobile-nav-simple";

export function SiteHeaderSimple() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-[#0F172A]">
          <Image
            src="/brand/worker-cutout-blue.png"
            alt=""
            width={29}
            height={29}
            className="h-auto w-auto drop-shadow-[0_1px_3px_rgba(15,23,42,0.55)]"
            aria-hidden
          />
          <span>BrziMajstor.ME</span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/login" data-testid="nav-prijava">
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
