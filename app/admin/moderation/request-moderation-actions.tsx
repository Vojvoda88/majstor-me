"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RequestModerationActions({
  requestId,
  requesterPhone,
}: {
  requestId: string;
  requesterPhone: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const action = async (path: string, method = "POST") => {
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
            alert(`Spam. Refundirano: ${r.refundCount} majstor(a), ${r.totalCreditsRefunded} kredita.`);
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

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button
        size="sm"
        variant="default"
        onClick={() => action("/approve")}
        disabled={!!loading}
        className="h-7 text-xs"
      >
        Approve
      </Button>
      <Link href={`/admin/requests/${requestId}`}>
        <Button size="sm" variant="outline" className="h-7 text-xs">
          Edit
        </Button>
      </Link>
      <Button
        size="sm"
        variant="outline"
        onClick={() => action("/reject")}
        disabled={!!loading}
        className="h-7 text-xs"
      >
        Reject
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => action("/spam")}
        disabled={!!loading}
        className="h-7 text-xs"
      >
        Spam
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => action("/delete")}
        disabled={!!loading}
        className="h-7 text-xs"
      >
        Delete
      </Button>
      {requesterPhone && (
        <Button
          size="sm"
          variant="destructive"
          onClick={blacklist}
          disabled={!!loading}
          className="h-7 text-xs"
        >
          Blacklist
        </Button>
      )}
    </div>
  );
}
