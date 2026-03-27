import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { hashGuestAccessToken } from "@/lib/guest-request-token";
import { requestDetailInclude } from "@/lib/requests/request-detail-include";
import { SiteHeader } from "@/components/layout/site-header";
import { RequestDetailView } from "@/components/request/request-detail-view";
import { GuestAccessPersist } from "@/components/request/guest-access-persist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function GuestAccessInvalid() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-slate-900">Link nije važeći</h1>
      <p className="mt-3 text-slate-600">Ovaj link više nije važeći ili nije ispravan.</p>
      <Link href="/" className="mt-8 inline-block font-medium text-blue-600 hover:underline">
        Na početnu
      </Link>
    </div>
  );
}

export default async function GuestRequestAccessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: raw } = await params;
  const token = raw.trim().toLowerCase();

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return (
      <div className="min-h-screen bg-brand-page">
        <SiteHeader />
        <GuestAccessInvalid />
      </div>
    );
  }

  const { prisma } = await import("@/lib/db");
  const hash = hashGuestAccessToken(token);
  const req = await prisma.request.findUnique({
    where: { guestAccessTokenHash: hash },
    include: requestDetailInclude,
  });

  if (!req || req.userId) {
    return (
      <div className="min-h-screen bg-brand-page">
        <SiteHeader />
        <GuestAccessInvalid />
      </div>
    );
  }

  const session = await auth();

  return (
    <div className="min-h-screen bg-brand-page">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <GuestAccessPersist token={token} />
        <RequestDetailView
          req={req}
          session={session}
          isOwner
          guestAccessTokenPlain={token}
          isGuestAccessRoute
        />
      </div>
    </div>
  );
}
