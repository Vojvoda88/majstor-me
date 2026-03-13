"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const textClass = scrolled ? "text-[#475569] hover:text-[#0F172A]" : "lg:text-white/90 lg:hover:text-white text-[#475569] hover:text-[#0F172A]";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0] shadow-sm"
          : "lg:bg-transparent bg-white border-b border-[#E2E8F0] lg:border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span
              className={`text-xl font-bold transition-colors ${
                scrolled ? "text-[#2563EB]" : "lg:text-white text-[#2563EB]"
              }`}
            >
              Majstor
              <span className={scrolled ? "text-[#0F172A]" : "lg:text-white text-[#0F172A]"}>
                .me
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {["Kako radi", "Kategorije", "Gradovi"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className={`font-medium transition-colors ${textClass}`}
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {status === "loading" ? (
              <span className="h-9 w-24 animate-pulse rounded-xl bg-[#E2E8F0]" />
            ) : session ? (
              <>
                {session.user.role === "USER" && (
                  <Link href="/dashboard/user" className={`px-4 py-2 font-medium transition-colors ${textClass}`}>
                    Moji zahtjevi
                  </Link>
                )}
                {session.user.role === "HANDYMAN" && (
                  <Link href="/dashboard/handyman" className={`px-4 py-2 font-medium transition-colors ${textClass}`}>
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/api/auth/signout"
                  className={`px-4 py-2 font-medium transition-colors ${textClass}`}
                >
                  Odjava
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-4 py-2 font-medium transition-colors ${textClass}`}
                >
                  Prijava
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-[#2563EB] text-white rounded-full font-medium hover:bg-[#1d4ed8] transition-colors"
                >
                  Registracija
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-[#0F172A]"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-b border-[#E2E8F0]">
          <div className="px-4 py-4 space-y-3">
            {["Kako radi", "Kategorije", "Gradovi"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="block py-2 text-[#475569] hover:text-[#0F172A] font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              {session ? (
                <>
                  {session.user.role === "USER" && (
                    <Link
                      href="/dashboard/user"
                      className="block py-2 text-[#0F172A] font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Moji zahtjevi
                    </Link>
                  )}
                  {session.user.role === "HANDYMAN" && (
                    <Link
                      href="/dashboard/handyman"
                      className="block py-2 text-[#0F172A] font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/api/auth/signout"
                    className="block py-2 text-[#0F172A] font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Odjava
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block py-2 text-[#0F172A] font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Prijava
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full py-3 bg-[#2563EB] text-white rounded-full font-medium text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Registracija
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
