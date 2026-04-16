"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RequestModerationActions({
  requestId,
  requesterPhone,
  canWriteRequests,
  canTrustSafety,
}: {
  requestId: string;
  requesterPhone: string | null;
  canWriteRequests: boolean;
  canTrustSafety: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const action = async (path: string, method = "POST") => {
    if (!canWriteRequests) return;
    if (loading) return;
    setLoading(path);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? "{}" : undefined,
      });
      const data = await res.json();
      if (data.success) {
        if (path === "/spam" && data.data) {
          const r = data.data;
          if (r.refundCount > 0) {
            alert(`Označeno kao spam. Vraćeno: ${r.refundCount} majstor(a), ${r.totalCreditsRefunded} kredita.`);
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
    if (!canWriteRequests || !canTrustSafety) return;
    if (!requesterPhone || !confirm(`Blokirati broj ${requesterPhone}?`)) return;
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

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Link href={`/admin/requests/${requestId}`}>
        <Button size="sm" variant="outline" className="h-7 text-xs">
          Detalji
        </Button>
      </Link>
      {canWriteRequests && (
        <>
          <Button
            size="sm"
            variant="default"
            onClick={() => action("/approve")}
            disabled={!!loading}
            className="h-7 text-xs"
          >
            Odobri
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => action("/reject")}
            disabled={!!loading}
            className="h-7 text-xs"
          >
            Odbij
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => action("/spam")}
            disabled={!!loading}
            className="h-7 text-xs"
          >
            Označi spam
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => action("/delete")}
            disabled={!!loading}
            className="h-7 text-xs"
          >
            Obriši
          </Button>
        </>
      )}
      {requesterPhone && canTrustSafety && canWriteRequests && (
        <Button
          size="sm"
          variant="destructive"
          onClick={blacklist}
          disabled={!!loading}
          className="h-7 text-xs"
        >
          Blokiraj broj
        </Button>
      )}
    </div>
  );
}
