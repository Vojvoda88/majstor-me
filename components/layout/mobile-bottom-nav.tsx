"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, FolderOpen, Coins, User, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sticky bottom navigacija (samo mobilni, dashboard). Desktop ne diramo.
 */
export function MobileBottomNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status !== "authenticated" || !session?.user) return null;

  const role = session.user.role;
  if (role !== "HANDYMAN" && role !== "USER") return null;

  const isHandyman = role === "HANDYMAN";

  const items = isHandyman
    ? [
        { href: "/dashboard/handyman", label: "Početak", icon: LayoutDashboard, match: /^\/dashboard\/handyman$/ },
        {
          href: "/categories",
          label: "Usluge",
          icon: FolderOpen,
          match: /^\/categories/,
        },
        {
          href: "/dashboard/handyman/credits",
          label: "Krediti",
          icon: Coins,
          match: /^\/dashboard\/handyman\/credits/,
        },
        {
          href: "/dashboard/handyman/profile",
          label: "Profil",
          icon: User,
          match: /^\/dashboard\/handyman\/profile/,
        },
      ]
    : [
        { href: "/dashboard/user", label: "Zahtjevi", icon: LayoutDashboard, match: /^\/dashboard\/user$/ },
        { href: "/request/create", label: "Novi", icon: FilePlus, match: /^\/request\/create/ },
        { href: "/categories", label: "Usluge", icon: FolderOpen, match: /^\/categories/ },
      ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] border-t border-slate-200/90 bg-white/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_32px_rgba(15,23,42,0.12)] backdrop-blur-md md:hidden supports-[backdrop-filter]:bg-white/90"
      aria-label="Brza navigacija"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || (match ? match.test(pathname) : false);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors",
                active ? "text-brand-navy" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active && "text-[#1d4ed8]")} strokeWidth={2} aria-hidden />
              <span className="truncate leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
