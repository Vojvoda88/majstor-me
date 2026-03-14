"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const navItems = session ? (
    <>
      {session.user.role === "USER" && (
        <Link href="/dashboard/user" onClick={() => setOpen(false)}>
          <Button variant="ghost" className="h-14 min-h-[48px] w-full justify-start text-base">
            Moji zahtjevi
          </Button>
        </Link>
      )}
      {session.user.role === "HANDYMAN" && (
        <Link href="/dashboard/handyman" onClick={() => setOpen(false)}>
          <Button variant="ghost" className="h-14 min-h-[48px] w-full justify-start text-base">
            Dashboard
          </Button>
        </Link>
      )}
      <Button
        variant="outline"
        className="h-14 min-h-[48px] w-full justify-start text-base"
        onClick={() => {
          setOpen(false);
          signOut({ callbackUrl: "/" });
        }}
      >
        Odjava
      </Button>
    </>
  ) : (
    <>
      <Link href="/login" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="h-14 min-h-[48px] w-full justify-start text-base">
          Prijava
        </Button>
      </Link>
      <Link href="/register" onClick={() => setOpen(false)}>
        <Button className="h-14 min-h-[48px] w-full justify-start text-base">Registracija</Button>
      </Link>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] active:bg-[#E2E8F0] md:hidden"
        aria-label="Otvori meni"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-72 flex-col gap-2 border-l border-[#E2E8F0] bg-white p-4 shadow-xl transition-transform md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between pb-4">
          <span className="font-semibold text-[#0F172A]">Meni</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#64748B] hover:bg-[#F1F5F9] active:bg-[#E2E8F0]"
            aria-label="Zatvori meni"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-2">{navItems}</nav>
      </div>
    </>
  );
}
