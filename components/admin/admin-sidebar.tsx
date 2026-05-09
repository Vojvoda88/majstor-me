"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminPendingReviewCounts } from "@/lib/admin-pending-counts";
import type { AdminRole } from "@/lib/admin/permissions";
import { hasPermission } from "@/lib/admin/permissions";
import {
  ADMIN_NAV_ITEMS,
  type AdminNavItem,
  type AdminNavSection,
} from "@/components/admin/admin-nav-config";

const SECTION_ORDER: AdminNavSection[] = ["pregled", "moderacija", "operativa", "sadrzaj"];

const SECTION_TITLES: Record<AdminNavSection, string> = {
  pregled: "Pregled",
  moderacija: "Moderacija",
  operativa: "Operativa",
  sadrzaj: "Sadržaj i podešavanja",
};

type SidebarProps = {
  adminRole: AdminRole;
  pendingReview: AdminPendingReviewCounts;
  mobileOpen?: boolean;
  onClose?: () => void;
};

export function AdminSidebar({ adminRole, pendingReview, mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname() ?? "";

  const visibleItems = ADMIN_NAV_ITEMS.filter((item) =>
    hasPermission(adminRole, item.permission as Parameters<typeof hasPermission>[1])
  );

  const itemsBySection = SECTION_ORDER.map((section) => ({
    section,
    title: SECTION_TITLES[section],
    items: visibleItems.filter((i) => i.section === section),
  })).filter((g) => g.items.length > 0);

  const renderItem = (item: AdminNavItem) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
    const testId = item.href === "/admin" ? "admin-nav-dashboard" : "admin-nav-" + item.href.replace(/^\/admin\/?/, "");
    const pendingMod =
      item.href === "/admin/moderation"
        ? pendingReview.pendingRequests + pendingReview.pendingHandymen
        : item.href === "/admin/requests"
          ? pendingReview.pendingRequests
          : item.href === "/admin/handymen"
            ? pendingReview.pendingHandymen
            : 0;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          data-testid={testId}
          onClick={() => onClose?.()}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
            isActive
              ? "bg-[#0F172A] text-white shadow-sm ring-1 ring-black/5"
              : "text-[#475569] hover:bg-[#EEF2FF] hover:text-[#0F172A]"
          )}
        >
          <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-[#64748B]")} />
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {pendingMod > 0 && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-bold tabular-nums",
                isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
              )}
            >
              {pendingMod > 99 ? "99+" : pendingMod}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <aside
      id="admin-sidebar-nav"
      data-testid="admin-sidebar"
      className={cn(
            "fixed left-0 top-0 z-50 flex h-screen w-[min(100vw,17.5rem)] max-w-[88vw] flex-col border-r border-[#E2E8F0] bg-white shadow-xl transition-transform duration-200 ease-out lg:z-40 lg:max-w-none lg:shadow-none",
        "lg:translate-x-0 lg:pointer-events-auto",
        mobileOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none lg:translate-x-0"
      )}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 flex-col gap-2 border-b border-[#E2E8F0] px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:px-4 lg:pb-3 lg:pt-4">
          <div className="flex h-10 items-center px-1">
            <Link
              href="/admin"
              className="font-semibold tracking-tight text-[#0F172A]"
              data-testid="admin-sidebar-title"
              onClick={() => onClose?.()}
            >
              Administracija
            </Link>
          </div>
          <Link
            href="/"
            data-testid="admin-nav-public-home"
            onClick={() => onClose?.()}
            className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-[#F8FAFC] px-3 py-2.5 text-sm font-semibold text-[#334155] transition hover:border-slate-300 hover:bg-[#F1F5F9]"
          >
            <Home className="h-4 w-4 shrink-0 text-[#64748B]" aria-hidden />
            <span>Javna početna</span>
          </Link>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 lg:px-4" aria-label="Admin navigacija">
          <div className="flex flex-col gap-5">
            {itemsBySection.map(({ section, title, items }) => (
              <div key={section}>
                <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">{title}</p>
                <ul className="space-y-1">{items.map((item) => renderItem(item))}</ul>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
