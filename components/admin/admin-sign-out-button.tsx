"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

/**
 * Klijentski signOut (isti obrazac kao header) — POST forma bez CSRF tokena može ostati bez redirecta.
 */
export function AdminSignOutButton() {
  return (
    <button
      type="button"
      data-testid="admin-signout"
      className="inline-flex items-center justify-center gap-1.5 rounded-lg p-2 text-sm font-medium text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#DC2626] sm:p-0 sm:hover:bg-transparent"
      onClick={async () => {
        await signOut({ callbackUrl: "/" });
      }}
    >
      <LogOut className="h-4 w-4 sm:hidden" aria-hidden />
      <span className="max-sm:sr-only">Odjavi se</span>
    </button>
  );
}
