import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StickyBottomCTA } from "@/components/layout/StickyBottomCTA";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin, Calendar, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Otvoren",
  IN_PROGRESS: "U toku",
  COMPLETED: "Završen",
  CANCELLED: "Otkazan",
};

const URGENCY_LABELS: Record<string, string> = {
  HITNO_DANAS: "Hitno danas",
  U_NAREDNA_2_DANA: "U naredna 2 dana",
  NIJE_HITNO: "Nije hitno",
};

export default async function UserDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "USER") redirect("/");

  const { prisma } = await import("@/lib/db");
  const requests = await prisma.request.findMany({
    where: { userId: session.user.id },
    include: {
      offers: {
        include: { handyman: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#F4F7FB] pb-28 md:pb-10">
    <div className="mx-auto max-w-[430px] px-4 py-6 md:max-w-4xl md:py-8">
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
      {requests.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="Nemate objavljenih zahtjeva"
          description="Objavite zahtjev da biste dobili ponude od provjerenih majstora"
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
                      <Badge
                        variant={
                          req.urgency === "HITNO_DANAS"
                            ? "destructive"
                            : req.urgency === "U_NAREDNA_2_DANA"
                              ? "warning"
                              : "outline"
                        }
                      >
                        {URGENCY_LABELS[req.urgency]}
                      </Badge>
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
                  </CardHeader>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    <StickyBottomCTA href="/request/create" label="Objavi zahtjev" />
    </div>
  );
}
