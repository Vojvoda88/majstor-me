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

  const canAct = adminStatus === "PENDING_REVIEW" || !adminStatus;

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
      if (data.success) router.refresh();
      else alert(data.error ?? "Greška");
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
        {requesterPhone && (
          <Button variant="destructive" onClick={blacklist} disabled={!!loading}>
            Blacklist phone
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
