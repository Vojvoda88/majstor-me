"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const linkProps = { prefetch: false as const };

  useEffect(() => setMounted(true), []);

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

  useEffect(() => {
    if (!menuOpen) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isHome = pathname === "/";
  const homeAtTop = isHome && !scrolled;
  const isKakoActive = isHome && hash === "#kako-radi";
  const isPocetnaActive = isHome && !isKakoActive;
  const isKategorijeActive = pathname === "/categories";
  const isProfilActive = pathname?.startsWith("/dashboard/handyman") ?? false;
  const isUserDashActive = pathname?.startsWith("/dashboard/user") ?? false;
  const isInstalirajActive = pathname === "/instaliraj";

  const navLinkDesktop = (active: boolean) =>
    cn(
      "font-medium transition-colors",
      homeAtTop
        ? cn(
            "text-white/85 hover:text-white",
            active && "font-semibold text-white underline decoration-white/40 underline-offset-[6px]"
          )
        : cn(
            "text-gray-700 hover:text-brand-navy",
            active && "font-semibold text-brand-navy underline decoration-brand-navy/35 underline-offset-[6px]"
          )
    );

  const sheetNavLink = (active: boolean) =>
    cn(
      "flex rounded-xl px-3.5 py-3 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-50",
      active && "bg-slate-100 font-semibold text-slate-900"
    );

  const desktopGuestNav = (
    <>
      <Link
        href="/register?type=majstor"
        className={cn(
          "text-[15px] font-medium transition-colors",
          homeAtTop ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-brand-navy"
        )}
        data-testid="nav-registracija-majstor"
        {...linkProps}
      >
        Registruj se kao majstor
      </Link>
      <Link
        href="/login"
        className={cn(
          "rounded-xl px-5 py-2.5 text-[15px] font-bold shadow-sm transition",
          homeAtTop
            ? "bg-amber-400 text-brand-navy hover:bg-amber-300"
            : "bg-[#1d4ed8] text-white hover:bg-[#1e40af]"
        )}
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
              homeAtTop
                ? "text-white/90 hover:bg-white/10 hover:text-white"
                : "text-gray-700 hover:text-brand-navy",
              isUserDashActive &&
                (homeAtTop
                  ? "font-semibold text-white underline decoration-white/40 underline-offset-[6px]"
                  : "font-semibold text-brand-navy underline decoration-brand-navy/35 underline-offset-[6px]")
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
              homeAtTop
                ? "text-white/90 hover:bg-white/10 hover:text-white"
                : "text-gray-700 hover:text-brand-navy",
              isProfilActive &&
                (homeAtTop
                  ? "font-semibold text-white underline decoration-white/40 underline-offset-[6px]"
                  : "font-semibold text-brand-navy underline decoration-brand-navy/35 underline-offset-[6px]")
            )}
          >
            Profil majstora
          </Button>
        </Link>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
        className={cn(
          "font-semibold shadow-sm transition",
          homeAtTop
            ? "border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
            : "border-slate-200/90 bg-white/80 text-gray-800 hover:bg-white hover:text-brand-navy"
        )}
      >
        Odjava
      </Button>
    </>
  );

  const mobileDrawer =
    menuOpen && mounted ? (
      <div className="md:hidden">
        <button
          type="button"
          aria-label="Zatvori meni"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[500] h-[100dvh] w-full bg-slate-950/55 backdrop-blur-sm"
        />
        <aside
          className="fixed right-0 top-0 z-[510] flex h-[100dvh] max-h-[100dvh] w-[min(92vw,23.5rem)] flex-col border-l border-slate-200/90 bg-white shadow-[0_22px_55px_-15px_rgba(15,23,42,0.5)]"
          data-testid="mobile-nav"
          aria-modal="true"
          role="dialog"
          aria-label="Mobilni meni"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">BrziMajstor.ME</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">Meni</p>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
              aria-label="Zatvori meni"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className={sheetNavLink(isPocetnaActive)}
                onClick={() => setMenuOpen(false)}
                data-testid="nav-pocetna"
                {...linkProps}
              >
                Početna
              </Link>
              <Link
                href="/categories"
                className={sheetNavLink(isKategorijeActive)}
                onClick={() => setMenuOpen(false)}
                data-testid="nav-kategorije"
                {...linkProps}
              >
                Kategorije
              </Link>
              <Link
                href="/#kako-radi"
                className={sheetNavLink(isKakoActive)}
                onClick={() => setMenuOpen(false)}
                data-testid="nav-kako-radi"
                {...linkProps}
              >
                Kako radi
              </Link>
              <Link
                href="/instaliraj"
                className={sheetNavLink(isInstalirajActive)}
                onClick={() => setMenuOpen(false)}
                data-testid="nav-instaliraj-mobile"
                {...linkProps}
              >
                Instaliraj aplikaciju
              </Link>
            </div>

            {session ? (
              <div className="mt-6 border-t border-slate-200/90 pt-5">
                <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Nalog</p>
                <div className="flex flex-col gap-1">
                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-3 text-[15px] font-semibold text-amber-900 transition hover:bg-amber-100"
                      onClick={() => setMenuOpen(false)}
                      {...linkProps}
                    >
                      Admin panel
                    </Link>
                  )}
                  {session.user?.role === "HANDYMAN" && (
                    <Link
                      href="/dashboard/handyman"
                      className={sheetNavLink(isProfilActive)}
                      onClick={() => setMenuOpen(false)}
                      {...linkProps}
                    >
                      Profil majstora
                    </Link>
                  )}
                  {session.user?.role === "USER" && (
                    <Link
                      href="/dashboard/user"
                      className={sheetNavLink(isUserDashActive)}
                      onClick={() => setMenuOpen(false)}
                      {...linkProps}
                    >
                      Moji zahtjevi
                    </Link>
                  )}
                  <button
                    type="button"
                    className="mt-2 flex w-full rounded-xl px-3.5 py-3 text-left text-[15px] font-medium text-rose-600 transition hover:bg-rose-50"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    Odjavi se
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 border-t border-slate-200/90 pt-5">
                <Link
                  href="/register?type=majstor"
                  className="flex rounded-xl px-3.5 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                  data-testid="nav-registracija-majstor"
                  {...linkProps}
                >
                  Registruj se kao majstor
                </Link>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="flex rounded-xl px-3.5 py-3 text-center text-[15px] font-medium text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                    data-testid="nav-prijava"
                    {...linkProps}
                  >
                    Prijava
                  </Link>
                  <Link
                    href="/register"
                    className="flex min-h-[48px] items-center justify-center rounded-xl bg-[#1d4ed8] py-3.5 text-center text-[15px] font-bold text-white shadow-sm transition hover:bg-[#1e40af] active:opacity-95"
                    onClick={() => setMenuOpen(false)}
                    data-testid="nav-registracija"
                    {...linkProps}
                  >
                    Registracija
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </aside>
      </div>
    ) : null;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[100] w-full border-b shadow-sm transition-[background-color,border-color] duration-300 ease-out",
          "pt-[env(safe-area-inset-top)] backdrop-blur-[12px] backdrop-saturate-[180%]",
          homeAtTop
            ? "border-white/10 bg-slate-950/50"
            : scrolled
              ? "border-slate-200/80 bg-white/90"
              : "border-white/20 bg-white/75"
        )}
        data-testid="public-header"
        style={{ pointerEvents: "auto", WebkitBackdropFilter: "blur(12px) saturate(180%)" }}
      >
        <div className="relative z-[100] mx-auto flex min-h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight md:text-2xl"
          data-testid="header-home"
          {...linkProps}
        >
          <span className={cn(homeAtTop ? "text-sky-300" : "text-[#1d4ed8]")}>BrziMajstor</span>
          <span className={cn(homeAtTop ? "text-white" : "text-slate-800")}>.ME</span>
        </Link>

        <nav className="relative z-[100] hidden items-center gap-x-8 md:flex" aria-label="Glavna navigacija">
          <Link href="/" className={navLinkDesktop(isPocetnaActive)} data-testid="nav-pocetna" {...linkProps}>
            Početna
          </Link>
          <Link href="/categories" className={navLinkDesktop(isKategorijeActive)} data-testid="nav-kategorije" {...linkProps}>
            Kategorije
          </Link>
          <Link href="/#kako-radi" className={navLinkDesktop(isKakoActive)} data-testid="nav-kako-radi" {...linkProps}>
            Kako radi
          </Link>
          <Link href="/instaliraj" className={navLinkDesktop(isInstalirajActive)} data-testid="nav-instaliraj" {...linkProps}>
            Instaliraj aplikaciju
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
          className={cn(
            "flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-xl transition md:hidden",
            homeAtTop ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-black/[0.04]"
          )}
          aria-label="Meni"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </header>
    {mounted ? createPortal(mobileDrawer, document.body) : null}
    </>
  );
}
