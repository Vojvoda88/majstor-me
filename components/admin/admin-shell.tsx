"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileBottomNav } from "@/components/admin/admin-mobile-bottom-nav";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { AdminPendingHeaderBadge } from "@/components/admin/admin-pending-header-badge";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import type { AdminPendingReviewCounts } from "@/lib/admin-pending-counts";
import type { AdminRole } from "@/lib/admin/permissions";
type Props = {
  adminRole: AdminRole;
  session: { user?: { name?: string | null } | null };
  pendingReview: AdminPendingReviewCounts;
  children: React.ReactNode;
};

export function AdminShell({ adminRole, session, pendingReview, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const roleLabel = adminRole.replace(/_/g, " ");
  const pendingTotal = pendingReview.pendingRequests + pendingReview.pendingHandymen;

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Overlay — ispod sidebara, iznad sadržaja; samo mobile */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Zatvori meni"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AdminSidebar
        adminRole={adminRole}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pendingReview={pendingReview}
      />

      <div className="flex min-h-screen w-full min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 shrink-0 border-b border-[#E2E8F0] bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
          <div className="flex items-center gap-2 px-3 py-2.5 sm:px-6">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] transition hover:bg-[#F1F5F9] lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="admin-sidebar-nav"
              aria-label={mobileOpen ? "Zatvori meni" : "Otvori meni"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight text-[#0F172A]">Administracija</p>
              <p className="hidden truncate text-xs text-[#64748B] sm:block">
                {session.user?.name} · {roleLabel}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <NotificationsDropdown />
              <AdminSignOutButton />
            </div>
          </div>
          {pendingTotal > 0 && (
            <div className="border-t border-[#F1F5F9] px-3 py-2 sm:hidden">
              <AdminPendingHeaderBadge counts={pendingReview} />
            </div>
          )}
          <div className="hidden items-center gap-3 border-t border-[#F1F5F9] px-6 py-2 sm:flex">
            <div className="min-w-0 flex-1">{pendingTotal > 0 ? <AdminPendingHeaderBadge counts={pendingReview} /> : null}</div>
            <Link href="/" className="shrink-0 text-xs font-medium text-[#64748B] transition hover:text-[#0F172A]">
              ← Javna stranica
            </Link>
          </div>
        </header>

        <main className="min-w-0 overflow-x-hidden p-4 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:p-6 lg:pb-6">
          {children}
        </main>
        <AdminMobileBottomNav adminRole={adminRole} hidden={mobileOpen} pendingTotal={pendingReview.pendingRequests + pendingReview.pendingHandymen} />
      </div>
    </div>
  );
}
