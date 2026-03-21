"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Inbox, FileText, Wrench, Users, Coins, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminRole, Permission } from "@/lib/admin/permissions";
import { hasPermission } from "@/lib/admin/permissions";

/**
 * Sticky bottom navigacija za admin (samo mobilni, lg+ sakriveno).
 * Prioritet redoslijeda; max 5 stavki — filtrirano po dozvolama (npr. finansije: Panel, Krediti, Uplate).
 */
const ITEMS: {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
}[] = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, permission: "dashboard" },
  { href: "/admin/moderation", label: "Moderacija", icon: Inbox, permission: "moderation" },
  { href: "/admin/requests", label: "Zahtjevi", icon: FileText, permission: "requests" },
  { href: "/admin/handymen", label: "Majstori", icon: Wrench, permission: "workers" },
  { href: "/admin/users", label: "Korisnici", icon: Users, permission: "users" },
  { href: "/admin/credits", label: "Krediti", icon: Coins, permission: "credits" },
  { href: "/admin/payments", label: "Uplate", icon: CreditCard, permission: "payments" },
];

type Props = {
  adminRole: AdminRole;
  /** Kad je otvoren drawer meni, sakrij bottom bar da ne preklapa UX */
  hidden?: boolean;
};

export function AdminMobileBottomNav({ adminRole, hidden = false }: Props) {
  const pathname = usePathname();

  const visible = ITEMS.filter((item) => hasPermission(adminRole, item.permission));

  if (hidden || visible.length === 0) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[52] border-t border-slate-200/90 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_32px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden"
      aria-label="Admin brza navigacija"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5">
        {visible.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin" ? pathname === "/admin" || pathname === "/admin/" : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[50px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 text-[10px] font-semibold leading-tight transition-colors sm:min-h-[52px] sm:text-[11px]",
                isActive ? "text-brand-navy" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-[#2563eb]" : "text-slate-500")} strokeWidth={2} aria-hidden />
              <span className="line-clamp-2 w-full text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
