import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import { SiteHeader } from "@/components/layout/site-header";
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
      <SiteHeader />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/dashboard/user"
          className="mb-6 inline-flex text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
        >
          ← Nazad na moje zahtjeve
        </Link>
        <CreateRequestForm />
      </div>
    </div>
  );
}
