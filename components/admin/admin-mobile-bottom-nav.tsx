"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AdminRole } from "@/lib/admin/permissions";
import { hasPermission } from "@/lib/admin/permissions";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav-config";

/**
 * Sticky bottom navigacija za admin (samo mobilni, lg+ sakriveno).
 * Prioritet redoslijeda; max 5 stavki — filtrirano po dozvolama (npr. finansije: Panel, Krediti, Uplate).
 */
type Props = {
  adminRole: AdminRole;
  /** Kad je otvoren drawer meni, sakrij bottom bar da ne preklapa UX */
  hidden?: boolean;
  /** Ukupno stvari na čekanju (za tačku na Moderacija) */
  pendingTotal?: number;
};

export function AdminMobileBottomNav({ adminRole, hidden = false, pendingTotal = 0 }: Props) {
  const pathname = usePathname() ?? "";

  const visible = ADMIN_NAV_ITEMS
    .filter((item) => hasPermission(adminRole, item.permission))
    .sort((a, b) => a.mobilePriority - b.mobilePriority)
    .slice(0, 5);

  if (hidden || visible.length === 0) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[52] border-t border-slate-200/90 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_32px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden"
      aria-label="Brza navigacija u administraciji"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5">
        {visible.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin" ? pathname === "/admin" || pathname === "/admin/" : pathname === href || pathname.startsWith(href + "/");
          const showDot = href === "/admin/moderation" && pendingTotal > 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-h-[50px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 text-[10px] font-semibold leading-tight transition-colors sm:min-h-[52px] sm:text-[11px]",
                isActive ? "text-brand-navy" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <span className="relative">
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-[#2563eb]" : "text-slate-500")} strokeWidth={2} aria-hidden />
                {showDot && (
                  <span className="absolute -right-1 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                    {pendingTotal > 9 ? "9+" : pendingTotal}
                  </span>
                )}
              </span>
              <span className="line-clamp-2 w-full text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
