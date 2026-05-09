import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Coins,
  CreditCard,
  FileQuestion,
  FileText,
  FolderTree,
  Inbox,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  ScrollText,
  Settings,
  Shield,
  Tag,
  Users,
  Wrench,
} from "lucide-react";
import type { Permission } from "@/lib/admin/permissions";

export type AdminNavSection = "pregled" | "moderacija" | "operativa" | "sadrzaj";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
  section: AdminNavSection;
  mobilePriority: number;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Početak", icon: LayoutDashboard, permission: "dashboard", section: "pregled", mobilePriority: 1 },
  { href: "/admin/moderation", label: "Moderacija", icon: Inbox, permission: "moderation", section: "moderacija", mobilePriority: 2 },
  { href: "/admin/requests", label: "Zahtjevi", icon: FileText, permission: "requests", section: "operativa", mobilePriority: 3 },
  { href: "/admin/handymen", label: "Majstori", icon: Wrench, permission: "workers", section: "operativa", mobilePriority: 4 },
  { href: "/admin/users", label: "Korisnici", icon: Users, permission: "users", section: "operativa", mobilePriority: 5 },
  { href: "/admin/credits", label: "Krediti", icon: Coins, permission: "credits", section: "operativa", mobilePriority: 6 },
  { href: "/admin/payments", label: "Plaćanja", icon: CreditCard, permission: "payments", section: "operativa", mobilePriority: 7 },
  { href: "/admin/offers", label: "Ponude", icon: Tag, permission: "offers", section: "operativa", mobilePriority: 8 },
  { href: "/admin/chat", label: "Poruke", icon: MessageSquare, permission: "chat", section: "operativa", mobilePriority: 9 },
  { href: "/admin/funnel", label: "Tok konverzija", icon: BarChart3, permission: "credits", section: "operativa", mobilePriority: 10 },
  { href: "/admin/categories", label: "Kategorije", icon: FolderTree, permission: "categories", section: "sadrzaj", mobilePriority: 11 },
  { href: "/admin/cities", label: "Gradovi", icon: MapPin, permission: "cities", section: "sadrzaj", mobilePriority: 12 },
  { href: "/admin/notifications", label: "Notifikacije", icon: Bell, permission: "notifications", section: "sadrzaj", mobilePriority: 13 },
  { href: "/admin/trust-safety", label: "Povjerenje i sigurnost", icon: Shield, permission: "trust_safety", section: "sadrzaj", mobilePriority: 14 },
  { href: "/admin/content", label: "Sadržaj i FAQ", icon: FileQuestion, permission: "content", section: "sadrzaj", mobilePriority: 15 },
  { href: "/admin/settings", label: "Podešavanja", icon: Settings, permission: "settings", section: "sadrzaj", mobilePriority: 16 },
  { href: "/admin/audit", label: "Zapis aktivnosti", icon: ScrollText, permission: "audit_log", section: "sadrzaj", mobilePriority: 17 },
];
