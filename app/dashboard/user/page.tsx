import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireVerified } from "@/lib/auth/require-verified";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { UrgencyBadge } from "@/components/request/urgency-badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin, Calendar, MessageSquare } from "lucide-react";
import { DeleteMyAccount } from "@/components/account/delete-my-account";
import { UserPushNotificationsCard } from "@/components/user/push-notifications-card";
import { LeaveReviewForm } from "@/components/user/leave-review-form";
import { VerifyEmailBanner } from "@/components/account/verify-email-banner";
import { Heart, Star } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Otvoren",
  IN_PROGRESS: "U toku",
  COMPLETED: "Završen",
  CANCELLED: "Otkazan",
};

export default async function UserDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "USER") redirect("/");
  await requireVerified(session);

  const { prisma } = await import("@/lib/db");
  const [requests, savedHandymen, currentUser] = await Promise.all([
    prisma.request.findMany({
      where: { userId: session.user.id },
      include: {
        offers: {
          include: { handyman: { select: { id: true, name: true } } },
        },
        review: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedHandyman.findMany({
      where: { userId: session.user.id },
      include: {
        handyman: {
          select: {
            id: true,
            name: true,
            city: true,
            handymanProfile: {
              select: {
                avatarUrl: true,
                verifiedStatus: true,
                ratingAvg: true,
                reviewCount: true,
                workerCategories: {
                  include: { category: { select: { name: true } } },
                  take: 2,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#F4F7FB] pb-28 md:pb-10">
    <div className="mx-auto max-w-[430px] px-4 py-6 md:max-w-4xl md:py-8">
      {!currentUser?.emailVerified && <VerifyEmailBanner />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            Moji zahtjevi
          </h1>
          <p className="mt-2 text-base text-[#64748B]">
            Pregled vaših objavljenih zahtjeva
          </p>
        </div>
        <Link href="/request/create">
          <Button size="lg" className="h-12 px-6">
            Novi zahtjev
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <UserPushNotificationsCard />
      </div>

      {/* Sačuvani majstori */}
      {savedHandymen.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Heart className="h-5 w-5 fill-rose-400 text-rose-400" />
            Sačuvani majstori
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedHandymen.map(({ handyman }) => {
              const cats = handyman.handymanProfile?.workerCategories.map((wc) => wc.category.name) ?? [];
              const isVerified = handyman.handymanProfile?.verifiedStatus === "VERIFIED";
              const rating = handyman.handymanProfile?.ratingAvg ?? 0;
              const reviewCount = handyman.handymanProfile?.reviewCount ?? 0;
              return (
                <Link
                  key={handyman.id}
                  href={`/handyman/${handyman.id}`}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                    {handyman.handymanProfile?.avatarUrl ? (
                      <img
                        src={handyman.handymanProfile.avatarUrl}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      handyman.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{handyman.name}</p>
                    {cats.length > 0 && (
                      <p className="truncate text-xs text-slate-500">{cats.join(", ")}</p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {reviewCount > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-600">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {rating.toFixed(1)}
                        </span>
                      )}
                      {isVerified && (
                        <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                          Verifikovan
                        </span>
                      )}
                      {handyman.city && (
                        <span className="text-xs text-slate-400">{handyman.city}</span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-blue-600">Pogledaj →</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="Nemate objavljenih zahtjeva"
          description="Objavite zahtjev da biste primali ponude od majstora kojima posao odgovara"
          action={
            <Link href="/request/create">
              <Button size="lg">Objavite prvi zahtjev</Button>
            </Link>
          }
        />
      ) : (
        <div className="mt-8 space-y-4">
          {requests.map((req) => {
            const acceptedOffer = req.offers.find((o) => o.status === "ACCEPTED");
            const totalOffers = req.offers.length;
            const canReview =
              req.status === "COMPLETED" &&
              acceptedOffer != null &&
              req.review == null;
            return (
              <Card
                key={req.id}
                className="overflow-hidden transition-shadow hover:shadow-card-hover"
              >
                <Link href={`/request/${req.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-semibold text-[#0F172A] hover:text-[#2563EB] sm:text-xl">
                          {req.category}
                        </CardTitle>
                        <p className="mt-2 line-clamp-2 text-sm text-[#64748B]">
                          {req.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-[#2563EB]">
                        Pogledaj →
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          req.status === "COMPLETED"
                            ? "success"
                            : req.status === "CANCELLED"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {STATUS_LABELS[req.status]}
                      </Badge>
                      {req.status === "OPEN" && req.adminStatus === "PENDING_REVIEW" && (
                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
                          Čeka pregled administratora
                        </Badge>
                      )}
                      {req.status === "OPEN" && req.adminStatus === "DISTRIBUTED" && (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
                          Odobren — majstori mogu odgovoriti
                        </Badge>
                      )}
                      <UrgencyBadge urgency={req.urgency} />
                      <span className="flex items-center gap-1 text-sm text-[#64748B]">
                        <MapPin className="h-4 w-4" />
                        {req.city}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-[#64748B]">
                        <MessageSquare className="h-4 w-4" />
                        {totalOffers} ponuda
                      </span>
                      <span className="flex items-center gap-1 text-sm text-[#94A3B8]">
                        <Calendar className="h-4 w-4" />
                        {new Date(req.createdAt).toLocaleDateString("sr")}
                      </span>
                    </div>
                    {acceptedOffer && (
                      <p className="mt-2 text-sm text-[#16A34A]">
                        Majstor: {acceptedOffer.handyman.name}
                      </p>
                    )}
                    {req.status === "COMPLETED" && req.review != null && (
                      <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                        ★ Recenzija ostavljena
                      </p>
                    )}
                  </CardHeader>
                </Link>
                {canReview && (
                  <div className="border-t border-slate-100 px-6 pb-4">
                    <LeaveReviewForm
                      requestId={req.id}
                      handymanName={acceptedOffer!.handyman.name ?? "majstora"}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      <div className="mt-10">
        <DeleteMyAccount />
      </div>
    </div>
    </div>
  );
}
