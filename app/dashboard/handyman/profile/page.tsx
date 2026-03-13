import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HandymanProfileForm } from "./handyman-profile-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HandymanProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "HANDYMAN") redirect("/");

  const profile = await prisma.handymanProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold">Profil majstora</h1>
      <p className="mt-1 text-muted-foreground">
        Izaberite kategorije i gradove u kojima nudite usluge
      </p>
      <HandymanProfileForm profile={profile} />
    </div>
  );
}
