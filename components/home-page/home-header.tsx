"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 mb-4 border-b border-slate-200/60 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo - premium treatment */}
        <Link
          href="/"
          className=" shrink-0 text-lg font-bold tracking-tight sm:text-[1.05rem]"
        >
          <span className="text-blue-600">Majstor</span>
          <span className="text-slate-700">.me</span>
        </Link>

        {/* Nav links - refined typography and spacing */}
        <nav className="hidden items-center gap-7 md:flex">
          <a
            href="#kako-radi"
            className="text-[13px] font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Kako radi
          </a>
          <a
            href="#kategorije"
            className="text-[13px] font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Kategorije
          </a>
          <a
            href="#gradovi"
            className="text-[13px] font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Gradovi
          </a>
        </nav>

        {/* Right side - subtle Prijava, strong Registracija */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Prijava
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/25"
          >
            Registracija
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex rounded-lg border border-slate-200/80 bg-white/80 p-2.5 transition hover:bg-slate-50 md:hidden"
          aria-label="Meni"
        >
          {menuOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200/60 bg-white/98 px-4 py-4 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1">
            <a
              href="#kako-radi"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              onClick={() => setMenuOpen(false)}
            >
              Kako radi
            </a>
            <a
              href="#kategorije"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              onClick={() => setMenuOpen(false)}
            >
              Kategorije
            </a>
            <a
              href="#gradovi"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              onClick={() => setMenuOpen(false)}
            >
              Gradovi
            </a>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/80 pt-3">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                Prijava
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                onClick={() => setMenuOpen(false)}
              >
                Registracija
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
