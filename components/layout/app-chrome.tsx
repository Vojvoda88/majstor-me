"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

/**
 * Globalni mobile chrome: bottom nav za ulogovane korisnike/majstore (van /admin, /login, /register).
 * Jedan izvor istine — i homepage i dashboard imaju isti bar.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const role = session?.user?.role;
  const showNav =
    status === "authenticated" &&
    (role === "HANDYMAN" || role === "USER") &&
    pathname !== "/login" &&
    pathname !== "/register" &&
    !pathname.startsWith("/admin");

  useEffect(() => {
    if (showNav) {
      document.body.setAttribute("data-mobile-nav", "true");
    } else {
      document.body.removeAttribute("data-mobile-nav");
    }
    return () => {
      document.body.removeAttribute("data-mobile-nav");
    };
  }, [showNav]);

  return (
    <>
      {children}
      <MobileBottomNav />
    </>
  );
}
