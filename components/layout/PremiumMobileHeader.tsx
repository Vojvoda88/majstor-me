"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export function PremiumMobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-[rgba(226,232,240,0.85)] bg-[rgba(244,247,251,0.92)] backdrop-blur-[12px]">
      <div className="mx-auto flex h-full max-w-[430px] items-center justify-between px-4 md:max-w-4xl md:px-6">
        <Link href="/" className="shrink-0 text-[22px] font-semibold">
          <span className="text-[#2563EB]">Majstor</span>
          <span className="text-[#475569]">.me</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="/#kategorije" className="text-[13px] font-medium text-[#475569] transition hover:text-[#0F172A]">
            Kategorije
          </a>
          <a href="/#kako-radi" className="text-[13px] font-medium text-[#475569] transition hover:text-[#0F172A]">
            Kako radi
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-[14px] px-4 py-2.5 text-[13px] font-medium text-[#475569] transition hover:bg-white/80 hover:text-[#0F172A]"
          >
            Prijava
          </Link>
          <Link
            href="/register"
            className="rounded-[14px] bg-gradient-to-br from-[#60A5FA] to-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition hover:opacity-95"
          >
            Registracija
          </Link>
        </div>

        {session?.user?.image ? (
          <Link
            href={session.user.role === "HANDYMAN" ? "/dashboard/handyman" : "/dashboard/user"}
            className="flex min-h-[40px] min-w-[40px] items-center justify-center md:hidden"
          >
            <Image src={session.user.image} alt="" width={36} height={36} className="rounded-full object-cover" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#475569] transition hover:bg-white/60 md:hidden"
            aria-label="Meni"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
      </div>

      {menuOpen && !session && (
        <div className="border-t border-[#E2E8F0] bg-white/98 px-4 py-4 backdrop-blur-[12px] md:hidden">
          <nav className="flex flex-col gap-1">
            <a href="/#kategorije" className="flex min-h-[48px] items-center rounded-xl px-4 text-[15px] font-medium text-[#475569]" onClick={() => setMenuOpen(false)}>
              Kategorije
            </a>
            <a href="/#kako-radi" className="flex min-h-[48px] items-center rounded-xl px-4 text-[15px] font-medium text-[#475569]" onClick={() => setMenuOpen(false)}>
              Kako radi
            </a>
            <div className="mt-3 flex flex-col gap-2 border-t border-[#E2E8F0] pt-3">
              <Link href="/login" className="flex min-h-[48px] items-center rounded-xl px-4 text-[15px] font-medium text-[#0F172A]" onClick={() => setMenuOpen(false)}>
                Prijava
              </Link>
              <Link href="/register" className="flex min-h-[48px] items-center justify-center rounded-[14px] bg-gradient-to-br from-[#60A5FA] to-[#2563EB] font-semibold text-white" onClick={() => setMenuOpen(false)}>
                Registracija
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
