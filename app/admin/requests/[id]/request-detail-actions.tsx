"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RequestDetailActions({
  requestId,
  requesterPhone,
  adminStatus,
  canWriteRequests,
  canTrustSafety,
}: {
  requestId: string;
  requesterPhone: string | null;
  adminStatus: string | null;
  canWriteRequests: boolean;
  canTrustSafety: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const canAct = canWriteRequests && (adminStatus === "PENDING_REVIEW" || !adminStatus);

  const action = async (path: string) => {
    if (!canAct || loading) return;
    setLoading(path);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const text = await res.text();
      let data: {
        success?: boolean;
        error?: string;
        code?: string;
        detail?: string;
        data?: { refundCount?: number; totalCreditsRefunded?: number; alreadyRefunded?: boolean };
      };
      try {
        data = JSON.parse(text) as typeof data;
      } catch {
        alert(`Greška (${res.status}): ${text.slice(0, 240)}`);
        return;
      }
      if (data.success) {
        if (path === "/spam" && data.data) {
          const r = data.data;
          if ((r.refundCount ?? 0) > 0) {
            alert(`Zahtjev označen kao spam. Refundirano: ${r.refundCount} majstor(a), ukupno ${r.totalCreditsRefunded} kredita.`);
          } else if (r.alreadyRefunded) {
            alert("Zahtjev označen kao spam. (Refund je već bio izvršen ranije.)");
          }
        }
        router.refresh();
      } else {
        const err = typeof data.error === "string" ? data.error : "Greška";
        const code = typeof data.code === "string" ? ` [${data.code}]` : "";
        const detail = typeof data.detail === "string" ? `\n${data.detail.slice(0, 300)}` : "";
        alert(`${err}${code}${detail}`);
      }
    } catch {
      alert("Greška");
    } finally {
      setLoading(null);
    }
  };

  const blacklist = async () => {
    if (!canTrustSafety) return;
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
        <CardTitle>Moderacija</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          onClick={() => action("/approve")}
          disabled={!!loading}
        >
          Approve
        </Button>
        <Button variant="outline" onClick={() => action("/reject")} disabled={!!loading}>
          Reject
        </Button>
        <Button variant="outline" onClick={() => action("/spam")} disabled={!!loading}>
          Mark as spam
        </Button>
        <Button variant="outline" onClick={() => action("/delete")} disabled={!!loading}>
          Delete
        </Button>
        {requesterPhone && canTrustSafety && (
          <Button variant="destructive" onClick={blacklist} disabled={!!loading}>
            Blacklist phone
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
