"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RestoreButtonInline({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const restore = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/restore`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) router.refresh();
      else alert(data.error ?? "Greška");
    } catch {
      alert("Greška");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={restore} disabled={loading} className="h-7 text-xs">
      {loading ? "..." : "Vrati"}
    </Button>
  );
}
