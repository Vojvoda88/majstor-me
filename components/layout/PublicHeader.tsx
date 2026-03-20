"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Public header – statična navigacija za goste; za prijavljene: dashboard/admin + odjava.
 * Koristi useSession da prijavljeni korisnici ne vide Prijava/Registracija (koji bi ih redirectali).
 */
export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const linkProps = { prefetch: false as const };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const navLink = (active: boolean) =>
    cn(
      "text-[15px] font-medium text-gray-700 transition-colors hover:text-brand-navy",
      active && "font-semibold text-brand-navy underline decoration-brand-navy/35 underline-offset-[6px]"
    );

  const isHome = pathname === "/";
  const isKakoActive = isHome && hash === "#kako-radi";
  const isPocetnaActive = isHome && !isKakoActive;
  const isKategorijeActive = pathname === "/categories";
  const isProfilActive = pathname?.startsWith("/dashboard/handyman") ?? false;
  const isUserDashActive = pathname?.startsWith("/dashboard/user") ?? false;

  const desktopGuestNav = (
    <>
      <Link
        href="/register?type=majstor"
        className="text-[15px] font-medium text-gray-700 transition-colors hover:text-brand-navy"
        data-testid="nav-registracija-majstor"
        {...linkProps}
      >
        Registruj se kao majstor
      </Link>
      <Link
        href="/login"
        className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#1e40af]"
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
          <Button variant="secondary" size="sm" className="bg-amber-100/90 text-amber-900 hover:bg-amber-200">
            Admin panel
          </Button>
        </Link>
      )}
      {session?.user?.role === "USER" && (
        <Link href="/dashboard/user" {...linkProps}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-gray-700 hover:text-brand-navy",
              isUserDashActive && "font-semibold text-brand-navy underline decoration-brand-navy/35 underline-offset-[6px]"
            )}
          >
            Moji zahtjevi
          </Button>
        </Link>
      )}
      {session?.user?.role === "HANDYMAN" && (
        <Link href="/dashboard/handyman" {...linkProps}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-gray-700 hover:text-brand-navy",
              isProfilActive && "font-semibold text-brand-navy underline decoration-brand-navy/35 underline-offset-[6px]"
            )}
          >
            Profil
          </Button>
        </Link>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="border-slate-200/90 bg-white/80 font-semibold text-gray-800 shadow-sm transition hover:bg-white hover:text-brand-navy"
      >
        Odjava
      </Button>
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-[100] w-full border-b border-white/20 shadow-sm transition-[background-color] duration-300 ease-out",
        "backdrop-blur-[12px] backdrop-saturate-[180%]",
        scrolled ? "bg-white/80" : "bg-white/65"
      )}
      data-testid="public-header"
      style={{ pointerEvents: "auto", WebkitBackdropFilter: "blur(12px) saturate(180%)" }}
    >
      <div className="relative z-[100] mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight md:text-2xl" data-testid="header-home" {...linkProps}>
          <span className="text-[#1d4ed8]">Majstor</span>
          <span className="text-slate-800">.me</span>
        </Link>

        <nav className="relative z-[100] hidden items-center gap-x-8 md:flex" aria-label="Glavna navigacija">
          <Link href="/" className={navLink(isPocetnaActive)} data-testid="nav-pocetna" {...linkProps}>
            Početna
          </Link>
          <Link href="/categories" className={navLink(isKategorijeActive)} data-testid="nav-kategorije" {...linkProps}>
            Kategorije
          </Link>
          <Link href="/#kako-radi" className={navLink(isKakoActive)} data-testid="nav-kako-radi" {...linkProps}>
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
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition hover:bg-white/50 md:hidden"
          aria-label="Meni"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div
          className={cn(
            "relative z-[100] border-t border-white/20 px-6 py-5 backdrop-blur-[12px] backdrop-saturate-[180%] md:hidden",
            "bg-white/75"
          )}
          data-testid="mobile-nav"
          style={{ WebkitBackdropFilter: "blur(12px) saturate(180%)" }}
        >
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              className={cn("py-3 text-[16px]", navLink(isPocetnaActive))}
              onClick={() => setMenuOpen(false)}
              data-testid="nav-pocetna"
              {...linkProps}
            >
              Početna
            </Link>
            <Link
              href="/categories"
              className={cn("py-3 text-[16px]", navLink(isKategorijeActive))}
              onClick={() => setMenuOpen(false)}
              data-testid="nav-kategorije"
              {...linkProps}
            >
              Kategorije
            </Link>
            <Link
              href="/#kako-radi"
              className={cn("py-3 text-[16px]", navLink(isKakoActive))}
              onClick={() => setMenuOpen(false)}
              data-testid="nav-kako-radi"
              {...linkProps}
            >
              Kako radi
            </Link>
            {session ? (
              <div className="mt-4 flex flex-col gap-2 border-t border-white/25 pt-4">
                {session.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="py-3 text-[16px] font-semibold text-amber-800"
                    onClick={() => setMenuOpen(false)}
                    {...linkProps}
                  >
                    Admin panel
                  </Link>
                )}
                {session.user?.role === "HANDYMAN" && (
                  <Link
                    href="/dashboard/handyman"
                    className={cn("py-3 text-[16px]", navLink(isProfilActive))}
                    onClick={() => setMenuOpen(false)}
                    {...linkProps}
                  >
                    Profil
                  </Link>
                )}
                {session.user?.role === "USER" && (
                  <Link
                    href="/dashboard/user"
                    className={cn("py-3 text-[16px]", navLink(isUserDashActive))}
                    onClick={() => setMenuOpen(false)}
                    {...linkProps}
                  >
                    Moji zahtjevi
                  </Link>
                )}
                <button
                  type="button"
                  className="mt-1 rounded-xl border border-slate-200/90 bg-white/80 py-3 text-left text-[16px] font-semibold text-gray-800 transition hover:bg-white"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Odjava
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/register?type=majstor"
                  className="py-3 text-[16px] font-medium text-gray-700"
                  onClick={() => setMenuOpen(false)}
                  data-testid="nav-registracija-majstor"
                  {...linkProps}
                >
                  Registruj se kao majstor
                </Link>
                <div className="mt-4 flex flex-col gap-2 border-t border-white/25 pt-4">
                  <Link
                    href="/login"
                    className="py-3 text-center text-[16px] font-medium text-gray-700"
                    onClick={() => setMenuOpen(false)}
                    data-testid="nav-prijava"
                    {...linkProps}
                  >
                    Prijava
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl bg-[#1d4ed8] py-3.5 text-center text-[16px] font-bold text-white shadow-sm"
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
