"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { HandymanCreditsPill } from "@/components/layout/handyman-credits-pill";

export function PremiumMobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const dashboardHref =
    session?.user?.role === "HANDYMAN"
      ? "/dashboard/handyman"
      : session?.user?.role === "ADMIN"
        ? "/admin"
        : "/dashboard/user";

  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const dashboardLabel =
    session?.user?.role === "HANDYMAN"
      ? "Profil majstora"
      : session?.user?.role === "ADMIN"
        ? "Administracija"
        : "Moj nalog";

  return (
    <>
    <header className="fixed left-0 right-0 top-0 z-[100] border-b border-slate-200/80 bg-white/95 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image
            src="/brand/worker-cutout-transparent.png"
            alt=""
            width={31}
            height={31}
            className="h-auto w-auto"
            aria-hidden
          />
          <span className="font-display text-xl font-bold tracking-tight md:text-2xl">
            <span className="text-[#1d4ed8]">BrziMajstor</span>
            <span className="text-slate-800">.ME</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/categories" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]">
            Kategorije
          </Link>
          <Link href="/#kako-radi" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]">
            Kako radi
          </Link>
          <Link href="/kontakt" className="text-[15px] font-medium text-slate-600 transition hover:text-[#1d4ed8]">
            Kontakt
          </Link>
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
            <>
              {session.user?.role === "HANDYMAN" && <HandymanCreditsPill />}
              <NotificationsDropdown />
              <Link
                href={
                  session.user?.role === "HANDYMAN"
                    ? "/dashboard/handyman"
                    : session.user?.role === "ADMIN"
                      ? "/admin"
                      : "/dashboard/user"
                }
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
            </>
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

        <div className="flex items-center gap-2 md:hidden">
          {session?.user?.role === "HANDYMAN" && <HandymanCreditsPill />}
          {session && <NotificationsDropdown />}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
            aria-label="Meni"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
            ) : (
              <Menu className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>
      </div>
    </header>

      {menuOpen && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Zatvori meni"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[200] bg-slate-950/50 backdrop-blur-[2px]"
          />
          <aside className="fixed inset-y-0 right-0 z-[210] flex w-[min(92vw,23.5rem)] flex-col border-l border-slate-200/80 bg-white shadow-[0_22px_55px_-15px_rgba(15,23,42,0.45)] pt-[env(safe-area-inset-top)]">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3.5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Navigacija</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">Meni</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
                aria-label="Zatvori meni panel"
              >
                <X className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="flex flex-col gap-1">
                <Link
                  href={dashboardHref}
                  className="rounded-xl bg-slate-100 px-3.5 py-3 text-[15px] font-semibold text-slate-900 transition hover:bg-slate-200"
                  onClick={() => setMenuOpen(false)}
                >
                  {dashboardLabel}
                </Link>
                <Link
                  href="/categories"
                  className="rounded-xl px-3.5 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Kategorije
                </Link>
                <Link
                  href="/#kako-radi"
                  className="rounded-xl px-3.5 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Kako radi
                </Link>
                <Link
                  href="/kontakt"
                  className="rounded-xl px-3.5 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Kontakt / podrška
                </Link>
                {session?.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="mt-1 flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-3 text-[15px] font-semibold text-amber-800 transition hover:bg-amber-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Administracija
                  </Link>
                )}
              </div>
            </nav>

            <div className="border-t border-slate-200/80 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {session ? (
                <button
                  type="button"
                  className="w-full rounded-xl px-3.5 py-3 text-left text-[15px] font-medium text-rose-600 transition hover:bg-rose-50"
                  onClick={async () => {
                    setMenuOpen(false);
                    await signOut({ callbackUrl: "/" });
                  }}
                >
                  Odjavi se
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="rounded-xl px-3.5 py-3 text-center text-[15px] font-medium text-slate-700 transition hover:bg-slate-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Prijava
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl bg-[#1d4ed8] px-3.5 py-3 text-center text-[15px] font-bold text-white transition hover:bg-[#1e40af]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Registracija
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
