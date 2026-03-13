"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { REQUEST_CATEGORIES, CITIES } from "@/lib/constants";

const URGENCY_LABELS: Record<string, string> = {
  HITNO_DANAS: "Hitno danas",
  U_NAREDNA_2_DANA: "U naredna 2 dana",
  NIJE_HITNO: "Nije hitno",
};

export function HandymanRequestList({
  requests,
  profileCategories,
  profileCities,
  currentCategory = "",
  currentCity = "",
  total = 0,
  page = 1,
  limit = 20,
}: {
  requests: Array<{
    id: string;
    category: string;
    description: string;
    city: string;
    urgency: string;
    createdAt: Date;
    user: { name: string };
    offers: { id: string }[];
  }>;
  profileCategories: string[];
  profileCities: string[];
  currentCategory?: string;
  currentCity?: string;
  total?: number;
  page?: number;
  limit?: number;
}) {
  const router = useRouter();

  const buildUrl = (cat: string, city: string, p = 1) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (city) params.set("city", city);
    if (p > 1) params.set("page", String(p));
    const q = params.toString();
    return `/dashboard/handyman${q ? `?${q}` : ""}`;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-[#64748B]">Filter:</span>
        <select
          className="h-11 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          value={currentCategory}
          onChange={(e) => router.push(buildUrl(e.target.value, currentCity, 1))}
        >
          <option value="">Sve kategorije</option>
          {profileCategories.length > 0
            ? profileCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))
            : REQUEST_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
        </select>
        <select
          className="h-11 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          value={currentCity}
          onChange={(e) => router.push(buildUrl(currentCategory, e.target.value, 1))}
        >
          <option value="">Svi gradovi</option>
          {(profileCities.length > 0 ? profileCities : [...CITIES]).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="Nema otvorenih zahtjeva"
          description="Nema zahtjeva za izabrane filtere. Pokušajte promijeniti kategoriju ili grad."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/request/${req.id}`}>
                      <CardTitle className="text-lg hover:underline">{req.category}</CardTitle>
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        variant={req.urgency === "HITNO_DANAS" ? "destructive" : req.urgency === "U_NAREDNA_2_DANA" ? "warning" : "outline"}
                      >
                        {URGENCY_LABELS[req.urgency]}
                      </Badge>
                      <Badge variant="secondary">{req.city}</Badge>
                      <Badge variant="outline">{req.offers.length} ponuda</Badge>
                    </div>
                  </div>
                  <Link href={`/request/${req.id}`}>
                    <span className="text-sm font-medium text-[#2563EB] hover:underline">Pogledaj →</span>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-[#64748B]">
                  {req.description}
                </p>
                <p className="mt-2 text-xs text-[#94A3B8]">
                  {req.user.name} • {new Date(req.createdAt).toLocaleDateString("sr")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Link
            href={buildUrl(currentCategory, currentCity, page - 1)}
            className={`rounded-lg px-4 py-2 text-sm ${page <= 1 ? "pointer-events-none text-[#94A3B8]" : "text-[#475569] hover:bg-[#F1F5F9]"}`}
          >
            ← Prethodna
          </Link>
          <span className="text-sm text-[#64748B]">
            Strana {page} / {totalPages}
          </span>
          <Link
            href={buildUrl(currentCategory, currentCity, page + 1)}
            className={`rounded-lg px-4 py-2 text-sm ${page >= totalPages ? "pointer-events-none text-[#94A3B8]" : "text-[#475569] hover:bg-[#F1F5F9]"}`}
          >
            Sljedeća →
          </Link>
        </div>
      )}
    </div>
  );
}
