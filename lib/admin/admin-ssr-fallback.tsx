import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  routeTitle: string;
  cardTitle: string;
  logPrefix: string;
  message: string;
  code?: string;
  snapshot: Record<string, unknown>;
  resetHref: string;
  resetLabel?: string;
};

/**
 * Kontrolisana greška unutar admin layout-a (ne generički prazan RSC boundary).
 */
export function AdminRouteLoadError({
  routeTitle,
  cardTitle,
  logPrefix,
  message,
  code,
  snapshot,
  resetHref,
  resetLabel = "Osvježi bez filtera",
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">{routeTitle}</h1>
        <p className="mt-1 text-sm text-[#64748B]">Greška pri učitavanju (server)</p>
      </div>
      <Card className="border-amber-200 bg-amber-50/90">
        <CardHeader>
          <CardTitle className="text-amber-950">{cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-amber-950">
          <p>
            Dijagnostika je u server logu pod prefiksom{" "}
            <code className="rounded bg-amber-100 px-1">{logPrefix}</code>.
          </p>
          {code && (
            <p>
              <span className="font-medium">Kod:</span> {code}
            </p>
          )}
          <p className="whitespace-pre-wrap break-words font-mono text-xs">{message}</p>
          <p className="text-xs text-amber-900/90">
            <span className="font-medium">Snapshot:</span> {JSON.stringify(snapshot)}
          </p>
          <p className="text-xs text-amber-900/90">
            Ako je P2022 (nepostojeća kolona), baza je verovatno iza šeme — pokrenite{" "}
            <code className="rounded bg-amber-100 px-1">prisma migrate deploy</code> na produkciji.
          </p>
          <Link href={resetHref} className="inline-block font-medium text-[#2563EB] underline">
            {resetLabel}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
