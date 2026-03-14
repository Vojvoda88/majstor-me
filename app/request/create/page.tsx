import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import { SiteHeader } from "@/components/layout/site-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Novi zahtjev | Majstor.me",
  description: "Objavite zahtjev za majstora - vodoinstalater, električar, klima servis i više",
};

export const dynamic = "force-dynamic";

export default async function CreateRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.city) q.set("city", params.city);
  const callbackPath = `/request/create${q.toString() ? `?${q}` : ""}`;
  if (!session) redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  if (session.user.role !== "USER") redirect("/");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SiteHeader />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Početna", href: "/" },
            { label: "Moji zahtjevi", href: "/dashboard/user" },
            { label: "Novi zahtjev" },
          ]}
        />
        <CreateRequestForm />
      </div>
    </div>
  );
}
