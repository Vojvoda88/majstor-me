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
      const data = await res.json();
      if (data.success) router.refresh();
      else alert(data.error ?? "Greška");
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
