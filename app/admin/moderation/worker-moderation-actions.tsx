"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function WorkerModerationActions({ handymanId }: { handymanId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const action = async (path: string) => {
    if (loading) return;
    setLoading(path);
    try {
      const res = await fetch(`/api/admin/handymen/${handymanId}${path}`, {
        method: "POST",
      });
      const text = await res.text();
      let data: { success?: boolean; error?: string; code?: string; detail?: string };
      try {
        data = JSON.parse(text) as typeof data;
      } catch {
        alert(`Greška (${res.status}): ${text.slice(0, 240)}`);
        return;
      }
      if (data.success) router.refresh();
      else {
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
        onClick={() => action("/suspend")}
        disabled={!!loading}
        className="h-7 text-xs"
      >
        Suspend
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => action("/ban")}
        disabled={!!loading}
        className="h-7 text-xs"
      >
        Ban
      </Button>
      <Link href={`/admin/handymen/${handymanId}`}>
        <Button size="sm" variant="outline" className="h-7 text-xs">
          Edit
        </Button>
      </Link>
      <Link href={`/admin/handymen/${handymanId}`}>
        <Button size="sm" variant="outline" className="h-7 text-xs">
          Credits
        </Button>
      </Link>
    </div>
  );
}
