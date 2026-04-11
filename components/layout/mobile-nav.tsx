"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const rowBtn =
    "h-12 min-h-[48px] w-full justify-start rounded-xl px-3.5 text-left text-[15px] font-medium";

  const navItems = session ? (
    <>
      {session.user.role === "ADMIN" && (
        <Button variant="secondary" className={cn(rowBtn, "bg-amber-100 text-amber-900 hover:bg-amber-200")} asChild>
          <Link href="/admin" onClick={() => setOpen(false)}>
            Admin panel
          </Link>
        </Button>
      )}
      {session.user.role === "USER" && (
        <Button variant="ghost" className={rowBtn} asChild>
          <Link href="/dashboard/user" onClick={() => setOpen(false)}>
            Moji zahtjevi
          </Link>
        </Button>
      )}
      {session.user.role === "HANDYMAN" && (
        <Button variant="ghost" className={rowBtn} asChild>
          <Link href="/dashboard/handyman" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
        </Button>
      )}
      <Button
        variant="outline"
        className={rowBtn}
        onClick={() => {
          setOpen(false);
          void signOut({ callbackUrl: "/" });
        }}
      >
        Odjava
      </Button>
    </>
  ) : (
    <>
      <Button variant="ghost" className={rowBtn} asChild>
        <Link href="/login" onClick={() => setOpen(false)}>
          Prijava
        </Link>
      </Button>
      <Button className={cn(rowBtn, "bg-[#1d4ed8] text-white hover:bg-[#1e40af]")} asChild>
        <Link href="/register" onClick={() => setOpen(false)}>
          Registracija
        </Link>
      </Button>
    </>
  );

  const drawer =
    open && mounted ? (
      <>
        <button
          type="button"
          aria-label="Zatvori meni"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[9998] h-[100dvh] min-h-[100dvh] w-full bg-slate-950/50 backdrop-blur-[2px] md:hidden"
        />
        <aside
          className="fixed right-0 top-0 z-[9999] flex h-[100dvh] max-h-[100dvh] w-[min(92vw,20rem)] flex-col border-l border-[#E2E8F0] bg-white shadow-[0_22px_55px_-15px_rgba(15,23,42,0.45)] md:hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Mobilni meni"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <span className="text-sm font-semibold text-[#0F172A]">Meni</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-[#F1F5F9]"
              aria-label="Zatvori meni"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {navItems}
          </nav>
        </aside>
      </>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] active:bg-[#E2E8F0] md:hidden"
        aria-label="Otvori meni"
        aria-expanded={open}
      >
        <Menu className="h-6 w-6" />
      </button>
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
