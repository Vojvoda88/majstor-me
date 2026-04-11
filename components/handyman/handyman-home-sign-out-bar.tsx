"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Vidljivo na svim majstorskim stranicama — ista akcija kao logo (javna početna) + odjava bez hamburger menija.
 */
export function HandymanHomeSignOutBar() {
  return (
    <div className="border-b border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <Button variant="outline" size="sm" className="h-10 gap-2 border-slate-200 bg-white font-semibold text-slate-800 shadow-none" asChild>
          <Link href="/">
            <Home className="h-4 w-4 shrink-0 text-[#1d4ed8]" aria-hidden />
            Početna stranica
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 gap-2 border-rose-200/80 bg-rose-50/80 font-semibold text-rose-700 shadow-none hover:bg-rose-100"
          onClick={() => void signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          Odjavi se
        </Button>
      </div>
    </div>
  );
}
