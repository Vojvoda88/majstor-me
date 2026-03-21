import { AppProviders } from "@/app/app-providers";
import { Providers } from "@/app/providers";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, adminRole } = await requireAdmin();

  return (
    <Providers>
      <AppProviders>
        <AdminShell adminRole={adminRole} session={session}>
          {children}
        </AdminShell>
      </AppProviders>
    </Providers>
  );
}
