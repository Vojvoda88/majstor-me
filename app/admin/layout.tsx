import { requireAdmin } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, adminRole } = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <AdminSidebar adminRole={adminRole} />
      <div className="pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
          <span className="text-sm text-[#64748B]">
            Prijavljeni ste kao <strong>{session.user.name}</strong> ({adminRole.replace("_", " ")})
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
            >
              ← Javna stranica
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm font-medium text-[#64748B] hover:text-[#DC2626]"
              >
                Odjavi se
              </button>
            </form>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
