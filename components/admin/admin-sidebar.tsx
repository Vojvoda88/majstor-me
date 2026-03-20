"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Wrench,
  Users,
  FileText,
  Tag,
  Coins,
  CreditCard,
  MessageSquare,
  FolderTree,
  MapPin,
  Bell,
  Shield,
  FileQuestion,
  Settings,
  ScrollText,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminRole } from "@/lib/admin/permissions";
import { hasPermission } from "@/lib/admin/permissions";

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { href: "/admin/moderation", label: "Moderation Inbox", icon: Inbox, permission: "moderation" },
  { href: "/admin/handymen", label: "Majstori", icon: Wrench, permission: "workers" },
  { href: "/admin/users", label: "Korisnici", icon: Users, permission: "users" },
  { href: "/admin/requests", label: "Zahtjevi", icon: FileText, permission: "requests" },
  { href: "/admin/offers", label: "Ponude", icon: Tag, permission: "offers" },
  { href: "/admin/credits", label: "Krediti", icon: Coins, permission: "credits" },
  { href: "/admin/funnel", label: "Funnel", icon: BarChart3, permission: "credits" },
  { href: "/admin/payments", label: "Plaćanja", icon: CreditCard, permission: "payments" },
  { href: "/admin/chat", label: "Chat", icon: MessageSquare, permission: "chat" },
  { href: "/admin/categories", label: "Kategorije", icon: FolderTree, permission: "categories" },
  { href: "/admin/cities", label: "Gradovi", icon: MapPin, permission: "cities" },
  { href: "/admin/notifications", label: "Notifikacije", icon: Bell, permission: "notifications" },
  { href: "/admin/trust-safety", label: "Trust & Safety", icon: Shield, permission: "trust_safety" },
  { href: "/admin/content", label: "Sadržaj / FAQ", icon: FileQuestion, permission: "content" },
  { href: "/admin/settings", label: "Podešavanja", icon: Settings, permission: "settings" },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText, permission: "audit_log" },
];

export function AdminSidebar({ adminRole }: { adminRole: AdminRole }) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) =>
    hasPermission(adminRole, item.permission as Parameters<typeof hasPermission>[1])
  );

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#E2E8F0] bg-white" data-testid="admin-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-[#E2E8F0] px-4">
          <Link href="/admin" className="font-semibold text-[#0F172A]" data-testid="admin-nav-dashboard">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
              const testId = item.href === "/admin" ? "admin-nav-dashboard" : "admin-nav-" + item.href.replace(/^\/admin\/?/, "");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-testid={testId}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#2563EB] text-white"
                        : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
