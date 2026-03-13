import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeaderSimple } from "@/components/layout/site-header-simple";
import { CheckCircle2, Star, MapPin, Wrench, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HandymanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id, role: "HANDYMAN" },
    include: {
      handymanProfile: true,
    },
  });

  if (!user?.handymanProfile) notFound();

  const profile = user.handymanProfile;
  const isVerified = profile.verifiedStatus === "VERIFIED";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SiteHeaderSimple />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
        >
          ← Nazad
        </Link>

        <Card className="overflow-hidden rounded-2xl border-[#E2E8F0] shadow-card">
          <CardHeader className="bg-gradient-to-br from-[#F8FAFC] to-white pb-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#E2E8F0] text-[#64748B]">
                <Wrench className="h-10 w-10" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <CardTitle className="text-xl font-bold text-[#0F172A] sm:text-2xl">
                    {user.name}
                  </CardTitle>
                  {isVerified && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verifikovan
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-[#64748B] sm:justify-start">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                    {profile.ratingAvg.toFixed(1)}
                  </span>
                  <span>{profile.reviewCount} recenzija</span>
                  {user.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.city}
                    </span>
                  )}
                </div>
                {profile.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {profile.categories.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
                {profile.cities.length > 0 && (
                  <p className="mt-2 text-sm text-[#64748B]">
                    Radi u: {profile.cities.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {profile.bio && (
              <div>
                <h3 className="text-sm font-medium text-[#475569]">O majstoru</h3>
                <p className="mt-1 text-[#64748B]">{profile.bio}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Link href={`/request/create?handyman=${user.id}`}>
                <Button size="lg" className="gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Pošalji zahtjev
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
