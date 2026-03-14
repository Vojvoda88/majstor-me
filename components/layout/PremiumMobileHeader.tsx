"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export function PremiumMobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-xl font-semibold">
          <span className="text-[#2563EB]">Majstor</span>
          <span className="text-[#475569]">.me</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#kategorije" className="text-sm font-medium text-[#475569] transition hover:text-[#0F172A]">
            Kategorije
          </a>
          <a href="/#kako-radi" className="text-sm font-medium text-[#475569] transition hover:text-[#0F172A]">
            Kako radi
          </a>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {session ? (
            <Link
              href={session.user?.role === "HANDYMAN" ? "/dashboard/handyman" : "/dashboard/user"}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB]"
            >
              {session.user?.image ? (
                <Image src={session.user.image} alt="" width={40} height={40} className="object-cover" />
              ) : (
                <span className="text-sm font-semibold text-[#475569]">
                  {session.user?.name?.charAt(0) ?? "?"}
                </span>
              )}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-[#475569] transition hover:text-[#0F172A]"
              >
                Prijava
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                Registracija
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center text-[#475569] md:hidden"
          aria-label="Meni"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <a href="/#kategorije" className="py-3 text-[15px] font-medium text-[#0F172A]" onClick={() => setMenuOpen(false)}>
              Kategorije
            </a>
            <a href="/#kako-radi" className="py-3 text-[15px] font-medium text-[#0F172A]" onClick={() => setMenuOpen(false)}>
              Kako radi
            </a>
            {!session && (
              <div className="mt-4 flex flex-col gap-2 border-t border-[#E5E7EB] pt-4">
                <Link href="/login" className="py-3 text-center text-[15px] font-medium text-[#0F172A]" onClick={() => setMenuOpen(false)}>
                  Prijava
                </Link>
                <Link href="/register" className="rounded-lg bg-[#2563EB] py-3 text-center text-[15px] font-semibold text-white" onClick={() => setMenuOpen(false)}>
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
