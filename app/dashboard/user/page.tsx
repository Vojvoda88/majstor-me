import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

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

  const requests = await prisma.request.findMany({
    where: { userId: session.user.id },
    include: {
      offers: {
        where: { status: "ACCEPTED" },
        include: { handyman: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Moji zahtjevi</h1>
          <p className="page-description">Pregled vaših objavljenih zahtjeva</p>
        </div>
        <Link href="/request/create">
          <span className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Novi zahtjev
          </span>
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Nemate objavljenih zahtjeva"
          description="Objavite zahtjev da biste dobili ponude od majstora"
          action={
            <Link href="/request/create">
              <span className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Objavite prvi zahtjev
              </span>
            </Link>
          }
        />
      ) : (
        <div className="mt-6 space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardHeader className="pb-2">
                <Link href={`/request/${req.id}`}>
                  <CardTitle className="text-lg hover:underline">{req.category}</CardTitle>
                </Link>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">{STATUS_LABELS[req.status]}</Badge>
                  <Badge variant="outline">{req.city}</Badge>
                  <Badge variant="outline">{req.offers.length} ponuda</Badge>
                  {req.offers[0] && (
                    <span className="text-sm text-muted-foreground">
                      Majstor: {req.offers[0].handyman.name}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {req.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(req.createdAt).toLocaleDateString("sr")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
