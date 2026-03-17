"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * Public header – statična navigacija za goste; za prijavljene: dashboard/admin + odjava.
 * Koristi useSession da prijavljeni korisnici ne vide Prijava/Registracija (koji bi ih redirectali).
 */
export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const linkProps = { prefetch: false as const };

  const desktopGuestNav = (
    <>
      <Link
        href="/register?type=majstor"
        className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]"
        data-testid="nav-registracija-majstor"
        {...linkProps}
      >
        Registruj se kao majstor
      </Link>
      <Link
        href="/login"
        className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-[15px] font-bold text-white transition hover:bg-[#1e40af]"
        data-testid="nav-prijava"
        {...linkProps}
      >
        Prijava
      </Link>
    </>
  );

  const desktopAuthNav = (
    <>
      {session?.user?.role === "ADMIN" && (
        <Link href="/admin" {...linkProps}>
          <Button variant="secondary" size="sm" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Admin panel
          </Button>
        </Link>
      )}
      {session?.user?.role === "USER" && (
        <Link href="/dashboard/user" {...linkProps}>
          <Button variant="ghost" size="sm">Moji zahtjevi</Button>
        </Link>
      )}
      {session?.user?.role === "HANDYMAN" && (
        <Link href="/dashboard/handyman" {...linkProps}>
          <Button variant="ghost" size="sm">Dashboard</Button>
        </Link>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Odjava
      </Button>
    </>
  );

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] border-b border-slate-200/80 bg-white/95 backdrop-blur-md" data-testid="public-header" style={{ pointerEvents: "auto" }}>
      <div className="relative z-[100] mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight md:text-2xl" data-testid="header-home" {...linkProps}>
          <span className="text-[#1d4ed8]">Majstor</span>
          <span className="text-slate-800">.me</span>
        </Link>

        <nav className="relative z-[100] hidden items-center gap-8 md:flex" aria-label="Glavna navigacija">
          <Link href="/" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]" data-testid="nav-pocetna" {...linkProps}>
            Početna
          </Link>
          <Link href="/categories" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]" data-testid="nav-kategorije" {...linkProps}>
            Kategorije
          </Link>
          <Link href="/#kako-radi" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]" data-testid="nav-kako-radi" {...linkProps}>
            Kako radi
          </Link>
          {status === "loading" ? (
            desktopGuestNav
          ) : session ? (
            desktopAuthNav
          ) : (
            desktopGuestNav
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
        <div className="relative z-[100] border-t border-slate-100 bg-white px-6 py-5 md:hidden" data-testid="mobile-nav">
          <nav className="flex flex-col gap-1">
            <Link href="/" className="py-3 text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)} data-testid="nav-pocetna" {...linkProps}>
              Početna
            </Link>
            <Link href="/categories" className="py-3 text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)} data-testid="nav-kategorije" {...linkProps}>
              Kategorije
            </Link>
            <Link href="/#kako-radi" className="py-3 text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)} data-testid="nav-kako-radi" {...linkProps}>
              Kako radi
            </Link>
            {session ? (
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                {session.user?.role === "ADMIN" && (
                  <Link href="/admin" className="py-3 text-[16px] font-semibold text-amber-700" onClick={() => setMenuOpen(false)} {...linkProps}>
                    Admin panel
                  </Link>
                )}
                {session.user?.role === "HANDYMAN" && (
                  <Link href="/dashboard/handyman" className="py-3 text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)} {...linkProps}>
                    Dashboard
                  </Link>
                )}
                {session.user?.role === "USER" && (
                  <Link href="/dashboard/user" className="py-3 text-[16px] font-medium text-slate-700" onClick={() => setMenuOpen(false)} {...linkProps}>
                    Moji zahtjevi
                  </Link>
                )}
                <button
                  type="button"
                  className="py-3 text-left text-[16px] font-medium text-red-600 hover:underline"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Odjavi se
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/register?type=majstor"
                  className="py-3 text-[16px] font-medium text-slate-700"
                  onClick={() => setMenuOpen(false)}
                  data-testid="nav-registracija-majstor"
                  {...linkProps}
                >
                  Registruj se kao majstor
                </Link>
                <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                  <Link
                    href="/login"
                    className="py-3 text-center text-[16px] font-medium text-slate-700"
                    onClick={() => setMenuOpen(false)}
                    data-testid="nav-prijava"
                    {...linkProps}
                  >
                    Prijava
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl bg-[#1d4ed8] py-3.5 text-center text-[16px] font-bold text-white"
                    onClick={() => setMenuOpen(false)}
                    data-testid="nav-registracija"
                    {...linkProps}
                  >
                    Registracija
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
