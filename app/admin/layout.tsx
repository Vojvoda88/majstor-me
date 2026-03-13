import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white">
        <div className="container mx-auto flex h-16 max-w-6xl items-center gap-8 px-4">
          <Link href="/admin" className="font-semibold text-[#0F172A]">Admin</Link>
          <nav className="flex gap-6">
            <Link href="/admin/users" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A]">Korisnici</Link>
            <Link href="/admin/handymen" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A]">Majstori</Link>
            <Link href="/admin/requests" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A]">Zahtjevi</Link>
            <Link href="/admin/reports" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A]">Prijave</Link>
          </nav>
          <Link href="/" className="ml-auto text-sm text-[#64748B] hover:text-[#0F172A]">← Nazad</Link>
        </div>
      </header>
      <main className="container mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
