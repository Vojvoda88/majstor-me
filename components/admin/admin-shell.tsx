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

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Overlay — ispod sidebara, iznad sadržaja; samo mobile */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Zatvori meni"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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
        <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center gap-2 border-b border-[#E2E8F0] bg-white px-3 py-2 sm:px-6">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="admin-sidebar-nav"
            aria-label={mobileOpen ? "Zatvori meni" : "Otvori meni"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <span className="min-w-0 flex-1 text-xs text-[#64748B] sm:text-sm">
            <span className="hidden sm:inline">Prijavljeni ste kao </span>
            <strong className="text-[#0F172A]">{session.user?.name}</strong>
            <span className="hidden sm:inline"> ({roleLabel})</span>
          </span>

          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <AdminPendingHeaderBadge counts={pendingReview} />
            <NotificationsDropdown />
            <Link
              href="/"
              className="whitespace-nowrap text-xs font-medium text-[#64748B] hover:text-[#0F172A] sm:text-sm"
            >
              <span className="sm:hidden">Sajt</span>
              <span className="hidden sm:inline">← Javna stranica</span>
            </Link>
            <AdminSignOutButton />
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
