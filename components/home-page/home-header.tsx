"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 mb-4 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-blue-600">Majstor</span>
          <span className="text-slate-900">.me</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#kako-radi" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Kako radi
          </a>
          <a href="#kategorije" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Kategorije
          </a>
          <a href="#gradovi" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Gradovi
          </a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Prijava
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            Registracija
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex rounded-xl border border-slate-200 bg-white p-2 md:hidden"
          aria-label="Meni"
        >
          {menuOpen ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200/80 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <a href="#kako-radi" className="font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
              Kako radi
            </a>
            <a href="#kategorije" className="font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
              Kategorije
            </a>
            <a href="#gradovi" className="font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
              Gradovi
            </a>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3">
              <Link href="/login" className="font-semibold text-slate-700" onClick={() => setMenuOpen(false)}>
                Prijava
              </Link>
              <Link href="/register" className="rounded-2xl bg-blue-600 px-5 py-3 text-center font-semibold text-white" onClick={() => setMenuOpen(false)}>
                Registracija
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
