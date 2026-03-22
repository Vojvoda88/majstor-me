"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RequestDetailActions({
  requestId,
  requesterPhone,
  adminStatus,
}: {
  requestId: string;
  requesterPhone: string | null;
  adminStatus: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const canAct =
    adminStatus === "PENDING_REVIEW" || adminStatus === null || adminStatus === "SUSPICIOUS";

  const action = async (path: string) => {
    if (!canAct || loading) return;
    setLoading(path);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      if (data.success) {
        if (path === "/spam" && data.data) {
          const r = data.data;
          if (r.refundCount > 0) {
            alert(`Zahtjev označen kao spam. Refundirano: ${r.refundCount} majstor(a), ukupno ${r.totalCreditsRefunded} kredita.`);
          } else if (r.alreadyRefunded) {
            alert("Zahtjev označen kao spam. (Refund je već bio izvršen ranije.)");
          }
        }
        router.refresh();
      } else {
        alert(data.error ?? "Greška");
      }
    } catch {
      alert("Greška");
    } finally {
      setLoading(null);
    }
  };

  const blacklist = async () => {
    if (!requesterPhone || !confirm(`Blacklistovati ${requesterPhone}?`)) return;
    setLoading("blacklist");
    try {
      const res = await fetch("/api/admin/blacklist/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: requesterPhone }),
      });
      const data = await res.json();
      if (data.success) {
        await action("/spam");
      } else {
        alert(data.error ?? "Greška");
      }
    } catch {
      alert("Greška");
    } finally {
      setLoading(null);
    }
  };

  if (!canAct) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderacija zahtjeva</CardTitle>
        <p className="text-sm font-normal text-[#64748B]">
          Odobri šalje oglas majstorima. Odbij briše. Sumnjivo pauzira distribuciju dok ne odlučite.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button onClick={() => action("/approve")} disabled={!!loading}>
          Odobri (distribucija)
        </Button>
        <Button variant="outline" onClick={() => action("/reject")} disabled={!!loading}>
          Odbij
        </Button>
        <Button
          variant="outline"
          className="border-amber-500 text-amber-800 hover:bg-amber-50"
          onClick={() => action("/suspicious")}
          disabled={!!loading}
        >
          Označi kao sumnjivo
        </Button>
        <Button variant="outline" onClick={() => action("/spam")} disabled={!!loading}>
          Spam
        </Button>
        <Button variant="outline" onClick={() => action("/delete")} disabled={!!loading}>
          Obriši
        </Button>
        {requesterPhone && (
          <Button variant="destructive" onClick={blacklist} disabled={!!loading}>
            Blacklist telefon
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
