"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { NotificationsDropdown } from "./notifications-dropdown";

export function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-[#0F172A]">
          <Image
            src="/brand/worker-cutout-transparent.png"
            alt=""
            width={32}
            height={32}
            className="h-auto w-auto"
            aria-hidden
          />
          <span>BrziMajstor.ME</span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {status === "loading" ? (
            <span className="h-9 w-20 animate-pulse rounded-xl bg-[#F1F5F9]" />
          ) : session ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="secondary" size="sm" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                    Administracija
                  </Button>
                </Link>
              )}
              {session.user.role === "USER" && (
                <Link href="/dashboard/user">
                  <Button variant="ghost" size="sm">Moji zahtjevi</Button>
                </Link>
              )}
              {session.user.role === "HANDYMAN" && (
                <Link href="/dashboard/handyman">
                  <Button variant="ghost" size="sm">Početak</Button>
                </Link>
              )}
              <NotificationsDropdown />
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Odjava
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Prijava</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registracija</Button>
              </Link>
            </>
          )}
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
