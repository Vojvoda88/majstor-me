import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, MapPin, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Moje ponude",
  description: "Pregled svih poslanih ponuda",
};

export const dynamic = "force-dynamic";

const PRICE_LABELS: Record<string, string> = {
  PO_DOGOVORU: "Po dogovoru",
  OKVIRNA: "Okvirna cijena",
  IZLAZAK_NA_TEREN: "Izlazak na teren",
  FIKSNA: "Fiksna cijena",
  PREGLED_PA_KONACNA: "Pregled pa konačna",
  PO_SATU: "Po satu",
  PO_M2: "Po m²",
  PO_METRU_DUZNOM: "Po metru dužnom",
  PO_TURI: "Po turi",
  DRUGO: "Drugo",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  PENDING: { label: "Čeka odgovor", variant: "secondary" },
  ACCEPTED: { label: "Prihvaćena", variant: "success" },
  REJECTED: { label: "Odbijena", variant: "destructive" },
  WITHDRAWN: { label: "Povučena", variant: "outline" },
};

export default async function HandymanOffersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "HANDYMAN") redirect("/");

  const { prisma } = await import("@/lib/db");

  const offers = await prisma.offer.findMany({
    where: { handymanId: session.user.id },
    include: {
      request: {
        select: {
          id: true,
          category: true,
          city: true,
          description: true,
          status: true,
          createdAt: true,
          urgency: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    total: offers.length,
    pending: offers.filter((o) => o.status === "PENDING").length,
    accepted: offers.filter((o) => o.status === "ACCEPTED").length,
    rejected: offers.filter((o) => o.status === "REJECTED").length,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard/handyman"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Nazad
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Moje ponude
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Sve ponude koje ste poslali klijentima
      </p>

      {/* KPI strip */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{counts.total}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Ukupno</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{counts.accepted}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Prihvaćene</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Na čekanju</p>
        </div>
      </div>

      {/* Lista ponuda */}
      <div className="mt-8 space-y-4">
        {offers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="font-medium text-slate-600">Još niste poslali nijednu ponudu.</p>
            <p className="mt-1 text-sm text-slate-400">
              Pronađite otvorene zahtjeve na{" "}
              <Link href="/dashboard/handyman" className="text-blue-600 hover:underline">
                dashboardu
              </Link>
              .
            </p>
          </div>
        ) : (
          offers.map((offer) => {
            const req = offer.request;
            const statusCfg = STATUS_CONFIG[offer.status] ?? { label: offer.status, variant: "secondary" as const };
            const priceLabel = PRICE_LABELS[offer.priceType] ?? offer.priceType;
            const priceDisplay =
              offer.priceValue != null && offer.priceType !== "DRUGO"
                ? `${priceLabel} — ${offer.priceValue} €`
                : priceLabel;

            return (
              <Link
                key={offer.id}
                href={`/request/${req.id}`}
                className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        <Tag className="h-3 w-3" />
                        {req.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {req.city || "Nije navedeno"}
                      </span>
                      {req.urgency === "HITNO_DANAS" && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          Hitno danas
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-700">
                      {req.description || "—"}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Vaša ponuda: <span className="text-slate-800">{priceDisplay}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(offer.createdAt).toLocaleDateString("sr")}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
