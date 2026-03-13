import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Novi zahtjev | Majstor.me",
  description: "Objavite zahtjev za majstora - vodoinstalater, električar, klima servis i više",
};

export default async function CreateRequestPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/request/create");
  if (session.user.role !== "USER") redirect("/");

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link href="/" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Nazad
      </Link>
      <CreateRequestForm />
    </div>
  );
}
