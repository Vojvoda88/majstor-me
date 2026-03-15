"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

/**
 * Lagani public header – bez useSession.
 * Samo statična navigacija: Početna, Kategorije, Kako radi, Postani majstor, Prijava.
 * Koristi se na homepage-u i javnim stranicama da se ne učitava session.
 */
export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md" data-testid="public-header">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight md:text-2xl" data-testid="header-home">
          <span className="text-[#1d4ed8]">Majstor</span>
          <span className="text-slate-800">.me</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Glavna navigacija">
          <Link href="/" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]" data-testid="nav-pocetna">
            Početna
          </Link>
          <Link href="/categories" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]" data-testid="nav-kategorije">
            Kategorije
          </Link>
          <Link href="/#kako-radi" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]" data-testid="nav-kako-radi">
            Kako radi
          </Link>
          <Link
            href="/register"
            className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]"
            data-testid="nav-postani-majstor"
          >
            Postani majstor
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-[15px] font-bold text-white transition hover:bg-[#1e40af]"
            data-testid="nav-prijava"
          >
            Prijava
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 md:hidden"
          aria-label="Meni"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-6 py-5 md:hidden" data-testid="mobile-nav">
          <nav className="flex flex-col gap-1">
            <Link href="/" className="py-3 text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)} data-testid="nav-pocetna">
              Početna
            </Link>
            <Link href="/categories" className="py-3 text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)} data-testid="nav-kategorije">
              Kategorije
            </Link>
            <Link href="/#kako-radi" className="py-3 text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)} data-testid="nav-kako-radi">
              Kako radi
            </Link>
            <Link href="/register" className="py-3 text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)} data-testid="nav-postani-majstor">
              Postani majstor
            </Link>
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
              <Link href="/login" className="py-3 text-center text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)} data-testid="nav-prijava">
                Prijava
              </Link>
              <Link href="/register" className="rounded-xl bg-[#1d4ed8] py-3.5 text-center text-[16px] font-bold text-white" onClick={() => setMenuOpen(false)}>
                Registracija
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
