"use client";

import { signOut } from "next-auth/react";

/**
 * Klijentski signOut (isti obrazac kao header) — POST forma bez CSRF tokena može ostati bez redirecta.
 */
export function AdminSignOutButton() {
  return (
    <button
      type="button"
      data-testid="admin-signout"
      className="text-sm font-medium text-[#64748B] hover:text-[#DC2626]"
      onClick={async () => {
        await signOut({ callbackUrl: "/" });
      }}
    >
      Odjavi se
    </button>
  );
}
