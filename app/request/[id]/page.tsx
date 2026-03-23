import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { guestPlainTokenMatchesHash } from "@/lib/guest-request-token";
import { requestDetailInclude } from "@/lib/requests/request-detail-include";
import { SiteHeader } from "@/components/layout/site-header";
import { RequestDetailView } from "@/components/request/request-detail-view";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;
  const session = await auth();

  const { prisma } = await import("@/lib/db");
  const req = await prisma.request.findUnique({
    where: { id },
    include: requestDetailInclude,
  });

  if (!req) notFound();

  const isOwner =
    (req.userId && session?.user?.id === req.userId) ||
    (!req.userId && guestPlainTokenMatchesHash(token, req.guestAccessTokenHash));

  return (
    <div className="min-h-screen bg-brand-page">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <RequestDetailView
          req={req}
          session={session}
          isOwner={isOwner}
          guestAccessTokenPlain={isOwner && !req.userId ? token : undefined}
        />
      </div>
    </div>
  );
}
