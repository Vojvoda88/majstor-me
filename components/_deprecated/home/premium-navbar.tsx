"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#kako-radi", label: "Kako radi" },
  { href: "#kategorije", label: "Kategorije" },
  { href: "#gradovi", label: "Gradovi" },
];

export function PremiumNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-4 md:h-20 md:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-[#0F172A] md:text-2xl hover:text-[#2563EB] transition-colors">
          BrziMajstor.ME
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-[15px] font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-medium">
              Prijava
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="font-medium">
              Registracija
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[#64748B] hover:bg-[#F1F5F9] md:hidden"
          aria-label="Meni"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#E2E8F0] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-[15px] font-medium text-[#475569] hover:bg-[#F8FAFC]"
              >
                {label}
              </a>
            ))}
            <div className="mt-2 flex gap-2 pt-2">
              <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Prijava</Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Registracija</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
