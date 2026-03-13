import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Novi zahtjev | Majstor.me",
  description: "Objavite zahtjev za majstora - vodoinstalater, električar, klima servis i više",
};

export const dynamic = "force-dynamic";

export default async function CreateRequestPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/request/create");
  if (session.user.role !== "USER") redirect("/");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container mx-auto flex h-16 max-w-2xl items-center px-4">
          <Link href="/" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A]">← Nazad</Link>
        </div>
      </header>
      <div className="container mx-auto max-w-2xl px-4 py-8">
      <CreateRequestForm />
      </div>
    </div>
  );
}
