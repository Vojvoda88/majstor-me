"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, FolderOpen, Coins, User, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Aktivno ako pathname odgovara ili je na javnoj početnoj (/) kao „app home“ */
  isActive: (pathname: string) => boolean;
};

/**
 * Sticky bottom navigacija (samo mobilni, md+ sakriveno).
 * Vidljivo na homepage-u i svim rutama osim login/register/admin za USER/HANDYMAN.
 */
export function MobileBottomNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status !== "authenticated" || !session?.user) return null;

  const role = session.user.role;
  if (role !== "HANDYMAN" && role !== "USER") return null;

  if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin")) {
    return null;
  }

  const isHandyman = role === "HANDYMAN";

  const items: NavItem[] = isHandyman
    ? [
        {
          href: "/dashboard/handyman",
          label: "Moj panel",
          icon: LayoutDashboard,
          isActive: (p) => p === "/dashboard/handyman" || p === "/",
        },
        {
          href: "/categories",
          label: "Usluge",
          icon: FolderOpen,
          isActive: (p) => p.startsWith("/categories"),
        },
        {
          href: "/dashboard/handyman/credits",
          label: "Krediti",
          icon: Coins,
          isActive: (p) => p.startsWith("/dashboard/handyman/credits"),
        },
        {
          href: "/dashboard/handyman/profile",
          label: "Profil",
          icon: User,
          isActive: (p) => p.startsWith("/dashboard/handyman/profile"),
        },
      ]
    : [
        {
          href: "/dashboard/user",
          label: "Moj panel",
          icon: LayoutDashboard,
          isActive: (p) => p === "/dashboard/user" || p === "/",
        },
        { href: "/request/create", label: "Novi zahtjev", icon: FilePlus, isActive: (p) => p.startsWith("/request/create") },
        { href: "/categories", label: "Usluge", icon: FolderOpen, isActive: (p) => p.startsWith("/categories") },
      ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[55] md:hidden"
      aria-label="Glavna navigacija"
    >
      <div className="pointer-events-none flex justify-center px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2">
        <div
          className={cn(
            "pointer-events-auto w-full max-w-md",
            "rounded-[1.35rem] border border-slate-200/90 bg-white/[0.97]",
            "shadow-[0_8px_40px_-12px_rgba(15,23,42,0.2),0_0_0_1px_rgba(15,23,42,0.04)]",
            "backdrop-blur-xl backdrop-saturate-150",
            "ring-1 ring-white/60"
          )}
        >
          <div className="flex items-stretch justify-between gap-0.5 px-1 py-1.5 sm:px-1.5">
            {items.map(({ href, label, icon: Icon, isActive }) => {
              const active = isActive(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition-all duration-200",
                    active
                      ? "bg-gradient-to-b from-[#EFF6FF] to-[#DBEAFE]/90 text-[#1e40af] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)] ring-1 ring-[#93C5FD]/90"
                      : "text-slate-500 hover:bg-slate-50/90 hover:text-slate-800 active:scale-[0.98]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[1.35rem] w-[1.35rem] shrink-0 sm:h-6 sm:w-6",
                      active ? "text-[#1d4ed8]" : "text-slate-400"
                    )}
                    strokeWidth={active ? 2.25 : 2}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "max-w-[5rem] truncate text-center text-[10px] font-semibold leading-tight tracking-tight sm:max-w-none sm:text-[11px]",
                      active ? "text-[#1e3a8a]" : "text-slate-500"
                    )}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
