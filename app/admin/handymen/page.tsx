import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { VerifyHandymanButton } from "./verify-button";

export const dynamic = "force-dynamic";

export default async function AdminHandymenPage() {
  const { prisma } = await import("@/lib/db");
  const handymen = await prisma.handymanProfile.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="page-title">Majstori</h1>
      <p className="page-description">Lista majstora sa opcijom verifikacije</p>
      {handymen.length === 0 ? (
        <EmptyState className="mt-6" title="Nema majstora" />
      ) : (
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Ime</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Kategorije</th>
                  <th className="px-4 py-3 text-left font-medium">Ocjena</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {handymen.map((hp) => (
                  <tr key={hp.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{hp.user.name}</td>
                    <td className="px-4 py-3">{hp.user.email}</td>
                    <td className="px-4 py-3">
                      {hp.categories.join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3">
                      ★ {hp.ratingAvg.toFixed(1)} ({hp.reviewCount})
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          hp.verifiedStatus === "VERIFIED"
                            ? "success"
                            : hp.verifiedStatus === "REJECTED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {hp.verifiedStatus === "VERIFIED"
                          ? "Verifikovan"
                          : hp.verifiedStatus === "REJECTED"
                          ? "Odbijen"
                          : "Na čekanju"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {hp.verifiedStatus === "PENDING" && (
                        <VerifyHandymanButton profileId={hp.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
