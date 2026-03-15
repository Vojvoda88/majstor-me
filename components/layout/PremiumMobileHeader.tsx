"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Shield } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export function PremiumMobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight md:text-2xl">
          <span className="text-[#1d4ed8]">Majstor</span>
          <span className="text-slate-800">.me</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <a href="/categories" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]">
            Kategorije
          </a>
          <a href="/#kako-radi" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]">
            Kako radi
          </a>
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2.5 text-[15px] font-semibold text-amber-800 transition hover:bg-amber-200"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
          {session ? (
            <Link
              href={session.user?.role === "HANDYMAN" ? "/dashboard/handyman" : session.user?.role === "ADMIN" ? "/admin" : "/dashboard/user"}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-100 transition hover:bg-slate-200"
            >
              {session.user?.image && (session.user.image.startsWith("http") || session.user.image.startsWith("/")) ? (
                <Image src={session.user.image} alt="" width={40} height={40} className="object-cover" />
              ) : (
                <span className="text-sm font-semibold text-slate-600">
                  {session.user?.name?.charAt(0) ?? "?"}
                </span>
              )}
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]">
                Prijava
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-[15px] font-bold text-white transition hover:bg-[#1e40af]"
              >
                Registracija
              </Link>
            </div>
          )}
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
        <div className="border-t border-slate-100 bg-white px-6 py-5 md:hidden">
          <nav className="flex flex-col gap-1">
            <a href="/categories" className="py-3 text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)}>
              Kategorije
            </a>
            <a href="/#kako-radi" className="py-3 text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)}>
              Kako radi
            </a>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 py-3 text-[16px] font-semibold text-amber-700"
                onClick={() => setMenuOpen(false)}
              >
                <Shield className="h-4 w-4" />
                Admin panel
              </Link>
            )}
            {!session && (
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                <Link href="/login" className="py-3 text-center text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)}>
                  Prijava
                </Link>
                <Link href="/register" className="rounded-xl bg-[#1d4ed8] py-3.5 text-center text-[16px] font-bold text-white" onClick={() => setMenuOpen(false)}>
                  Registracija
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
