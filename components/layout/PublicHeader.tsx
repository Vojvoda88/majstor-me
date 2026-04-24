"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { cn } from "@/lib/utils";

/**
 * Public header – statična navigacija za goste; za prijavljene: dashboard/admin + odjava.
 * Koristi useSession da prijavljeni korisnici ne vide Prijava/Registracija (koji bi ih redirectali).
 */
export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [hash, setHash] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const linkProps = { prefetch: true as const };

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
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
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
    const media = window.matchMedia("(min-width: 768px)");
    const syncViewport = () => setIsDesktopViewport(media.matches);
    syncViewport();

    const onResize = () => {
      syncViewport();
      if (media.matches) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    // Zagrij najčešće rute da navigacija djeluje instant.
    router.prefetch("/categories");
    if (session?.user?.role === "ADMIN") {
      router.prefetch("/admin");
      return;
    }
    if (session?.user?.role === "HANDYMAN") {
      router.prefetch("/dashboard/handyman");
      return;
    }
    if (session?.user?.role === "USER") {
      router.prefetch("/dashboard/user");
      return;
    }
    router.prefetch("/login");
    router.prefetch("/register");
  }, [router, session?.user?.role]);

  const isHome = pathname === "/";
  const homeTheme = isHome;
  const isKakoActive = isHome && hash === "#kako-radi";
  const isPocetnaActive = isHome && !isKakoActive;
  const isKategorijeActive = pathname === "/categories";
  const isProfilActive = pathname?.startsWith("/dashboard/handyman") ?? false;
  const isUserDashActive = pathname?.startsWith("/dashboard/user") ?? false;
  const isInstalirajActive = pathname === "/instaliraj";
  const isKontaktActive = pathname === "/kontakt";
  const loginForNotificationsHref = `/login?callbackUrl=${encodeURIComponent(pathname || "/")}`;

  const navLinkDesktop = (active: boolean) =>
    cn(
      "font-medium transition-colors",
      homeTheme
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
      "flex rounded-2xl border border-transparent px-3.5 py-3 text-[15px] font-medium text-slate-700 transition-colors hover:border-slate-200 hover:bg-slate-50",
      active && "border-blue-100 bg-blue-50/70 font-semibold text-slate-900"
    );

  const desktopGuestNav = (
    <>
      <Link
        href="/register?type=majstor"
        className={cn(
          "text-[15px] font-medium transition-colors",
          homeTheme ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-brand-navy"
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
          homeTheme
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
            Administracija
          </Button>
        </Link>
      )}
      {session?.user?.role === "USER" && (
        <Link href="/dashboard/user" {...linkProps}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              homeTheme
                ? "text-white/90 hover:bg-white/10 hover:text-white"
                : "text-gray-700 hover:text-brand-navy",
              isUserDashActive &&
                (homeTheme
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
              homeTheme
                ? "text-white/90 hover:bg-white/10 hover:text-white"
                : "text-gray-700 hover:text-brand-navy",
              isProfilActive &&
                (homeTheme
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
          homeTheme
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
      <>
        <button
          type="button"
          aria-label="Zatvori meni"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[9998] h-[100dvh] min-h-[100dvh] w-full bg-slate-950/60 backdrop-blur-[3px] md:hidden"
        />
        <aside
          className="fixed right-0 top-0 z-[9999] flex h-[100dvh] max-h-[100dvh] w-[min(92vw,23.5rem)] flex-col border-l border-slate-200/90 bg-gradient-to-b from-white via-white to-slate-50 shadow-[0_22px_55px_-15px_rgba(15,23,42,0.5)] md:hidden"
          data-testid="mobile-nav"
          aria-modal="true"
          role="dialog"
          aria-label="Mobilni meni"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-blue-600 to-blue-700 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-100/90">BrziMajstor.ME</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-white">Meni</p>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition hover:bg-white/10"
              aria-label="Zatvori meni"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)]">
              <p className="px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Navigacija
              </p>
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
              <Link
                href="/kontakt"
                className={sheetNavLink(isKontaktActive)}
                onClick={() => setMenuOpen(false)}
                data-testid="nav-kontakt"
                {...linkProps}
              >
                Kontakt / podrška
              </Link>
              </div>
            </div>

            {session ? (
              <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)]">
                <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Nalog</p>
                <div className="flex flex-col gap-1">
                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-3 text-[15px] font-semibold text-amber-900 transition hover:bg-amber-100"
                      onClick={() => setMenuOpen(false)}
                      {...linkProps}
                    >
                      Administracija
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
                    className="mt-2 flex w-full rounded-2xl border border-transparent px-3.5 py-3 text-left text-[15px] font-medium text-rose-600 transition hover:border-rose-100 hover:bg-rose-50"
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
              <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)]">
                <Link
                  href="/register?type=majstor"
                  className="flex rounded-2xl border border-transparent px-3.5 py-3 text-[15px] font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                  data-testid="nav-registracija-majstor"
                  {...linkProps}
                >
                  Registruj se kao majstor
                </Link>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="flex rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-center text-[15px] font-medium text-slate-700 transition hover:bg-slate-50"
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
      </>
    ) : null;

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-[100] w-full border-b shadow-sm transition-[background-color,border-color,box-shadow] duration-300 ease-out",
          "pt-[env(safe-area-inset-top)] backdrop-blur-[14px] backdrop-saturate-[180%]",
          homeTheme
            ? "border-white/[0.12] bg-gradient-to-r from-slate-950/75 via-slate-900/65 to-slate-950/75 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.7)]"
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
          className="inline-flex shrink-0 items-center gap-2 font-display text-lg font-bold tracking-tight lg:text-xl"
          data-testid="header-home"
          {...linkProps}
        >
          <Image
            src="/brand/worker-cutout-transparent.png"
            alt=""
            width={34}
            height={34}
            className="h-auto w-auto"
            aria-hidden
          />
          <span className={cn("flex items-baseline", homeTheme ? "text-slate-100" : "text-brand-navy")}>
            <span>BrziMajstor</span>
            <span className={cn(homeTheme ? "text-amber-300" : "text-blue-700")}>.ME</span>
          </span>
        </Link>

        <nav className="relative z-[100] ml-4 hidden items-center gap-x-4 lg:ml-6 lg:gap-x-6 xl:gap-x-8 md:flex" aria-label="Glavna navigacija">
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
          <Link href="/kontakt" className={navLinkDesktop(isKontaktActive)} data-testid="nav-kontakt-desktop" {...linkProps}>
            Kontakt
          </Link>
          {session && isDesktopViewport ? (
            <NotificationsDropdown
              buttonClassName={homeTheme ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-black/[0.04]"}
              iconClassName={homeTheme ? "text-white" : "text-current"}
            />
          ) : !session ? (
            <Link
              href={loginForNotificationsHref}
              aria-label="Prijava za obavještenja"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl transition",
                homeTheme ? "text-white/90 hover:bg-white/10 hover:text-white" : "text-gray-700 hover:bg-black/[0.04]"
              )}
              {...linkProps}
            >
              <Bell className="h-5 w-5" />
            </Link>
          ) : null}
          {status === "loading" ? (
            <div className="w-[200px]" aria-hidden />
          ) : session ? (
            desktopAuthNav
          ) : (
            desktopGuestNav
          )}
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          {session && !isDesktopViewport ? (
            <NotificationsDropdown
              buttonClassName={homeTheme ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-black/[0.04]"}
              iconClassName={homeTheme ? "text-white" : "text-current"}
            />
          ) : !session ? (
            <Link
              href={loginForNotificationsHref}
              aria-label="Prijava za obavještenja"
              className={cn(
                "inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-xl transition",
                homeTheme ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-black/[0.04]"
              )}
              {...linkProps}
            >
              <Bell className="h-5 w-5" />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              "flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-xl transition",
              homeTheme ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-black/[0.04]"
            )}
            aria-label="Meni"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
      <div aria-hidden className="h-[calc(56px+env(safe-area-inset-top))]" />
    {mounted ? createPortal(mobileDrawer, document.body) : null}
    </>
  );
}
