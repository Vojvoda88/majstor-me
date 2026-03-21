"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Korisnik je prijavljen kao USER, a traži registraciju kao majstor.
 * Jedan nalog = jedna uloga — mora odjava pa nova registracija.
 */
export function RegisterMajstorSignOutCta() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-amber-200/80 bg-amber-50/40 p-8 text-center shadow-marketplace sm:p-10">
        <h1 className="font-display text-xl font-bold text-brand-navy sm:text-2xl">
          Već ste prijavljeni kao korisnik
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Da biste <strong>nudili usluge</strong>, potreban je <strong>majstorski nalog</strong> (odvojena
          registracija). Odjavite se sa trenutnog naloga, zatim kreirajte nalog kao majstor.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button
            className="w-full"
            size="lg"
            onClick={() => signOut({ callbackUrl: "/register?type=majstor" })}
          >
            Odjavi me i otvori registraciju majstora
          </Button>
          <Link href="/dashboard/user" className="text-sm font-medium text-[#2563EB] underline-offset-4 hover:underline">
            Ostani na korisničkom panelu
          </Link>
        </div>
      </div>
    </div>
  );
}
