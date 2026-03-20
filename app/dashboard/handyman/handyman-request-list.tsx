"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { REQUEST_CATEGORIES, CITIES } from "@/lib/constants";
import { MapPin, MessageSquare, Calendar, User } from "lucide-react";

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
    user: { name: string } | null;
    requesterName?: string | null;
    requesterDisplayName?: string;
    isRequesterVerified?: boolean;
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
    <div className="mt-6 space-y-4 sm:mt-8">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <span className="w-full text-sm font-medium text-gray-600 sm:w-auto">Filter:</span>
        <select
          className="min-h-[44px] flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:min-h-0 sm:flex-initial sm:h-11"
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
          className="min-h-[44px] flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:min-h-0 sm:flex-initial sm:h-11"
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
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="overflow-hidden rounded-xl shadow-sm transition hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <Link href={`/request/${req.id}`}>
                      <CardTitle className="text-lg font-semibold text-[#0F172A] hover:text-[#2563EB] sm:text-xl">
                        {req.category}
                      </CardTitle>
                    </Link>
                    <p className="mt-2 line-clamp-2 text-sm text-[#64748B]">
                      {req.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
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
                        {req.offers.length} ponuda
                      </span>
                      <span className="flex items-center gap-1 text-sm text-[#94A3B8]">
                        <Calendar className="h-4 w-4" />
                        {new Date(req.createdAt).toLocaleDateString("sr")}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-[#94A3B8]">
                        <User className="h-4 w-4" />
                        {req.requesterDisplayName ?? req.requesterName ?? req.user?.name ?? "-"}
                      </span>
                      {req.isRequesterVerified && (
                        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 px-2 py-0 text-xs text-emerald-800">
                          Verifikovan
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Link href={`/request/${req.id}`} className="shrink-0">
                    <Button size="lg">Pošalji ponudu</Button>
                  </Link>
                </div>
              </CardHeader>
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
