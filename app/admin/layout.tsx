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
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center gap-6 px-4">
          <Link href="/admin" className="font-bold">Admin</Link>
          <nav className="flex gap-4">
            <Link href="/admin/users" className="text-sm hover:underline">Korisnici</Link>
            <Link href="/admin/handymen" className="text-sm hover:underline">Majstori</Link>
            <Link href="/admin/requests" className="text-sm hover:underline">Zahtjevi</Link>
            <Link href="/admin/reports" className="text-sm hover:underline">Prijave</Link>
          </nav>
          <Link href="/" className="ml-auto text-sm text-muted-foreground hover:text-foreground">
            ← Nazad
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
