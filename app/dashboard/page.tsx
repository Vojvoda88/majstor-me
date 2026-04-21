import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * /dashboard — redirect na odgovarajući dashboard na osnovu role.
 * Korisno kao callbackUrl za Google OAuth i ostale OAuth provajdere.
 */
export default async function DashboardRedirectPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role === "HANDYMAN") redirect("/dashboard/handyman");
  if (role === "ADMIN") redirect("/admin");
  redirect("/dashboard/user");
}
