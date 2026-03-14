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
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          <span className="text-[#2563EB]">Majstor</span>
          <span className="text-gray-800">.me</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          <a href="/#kategorije" className="transition hover:text-[#2563EB]">
            Kategorije
          </a>
          <a href="/#kako-radi" className="transition hover:text-[#2563EB]">
            Kako radi
          </a>
          {session ? (
            <Link
              href={session.user?.role === "HANDYMAN" ? "/dashboard/handyman" : "/dashboard/user"}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200"
            >
              {session.user?.image ? (
                <Image src={session.user.image} alt="" width={40} height={40} className="object-cover" />
              ) : (
                <span className="text-sm font-semibold text-gray-600">
                  {session.user?.name?.charAt(0) ?? "?"}
                </span>
              )}
            </Link>
          ) : (
            <>
              <Link href="/login" className="transition hover:text-[#2563EB]">
                Prijava
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8]"
              >
                Registracija
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center text-gray-600 md:hidden"
          aria-label="Meni"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-100 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <a href="/#kategorije" className="py-2 text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              Kategorije
            </a>
            <a href="/#kako-radi" className="py-2 text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              Kako radi
            </a>
            {!session && (
              <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                <Link href="/login" className="py-2 text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                  Prijava
                </Link>
                <Link href="/register" className="rounded-md bg-[#2563EB] py-2 text-center text-sm font-medium text-white" onClick={() => setMenuOpen(false)}>
                  Registracija
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
