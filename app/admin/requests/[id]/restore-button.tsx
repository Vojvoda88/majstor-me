"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RestoreRequestButton({ requestId }: { requestId: string }) {
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
    <Card>
      <CardHeader>
        <CardTitle>Odbijen greškom?</CardTitle>
        <p className="text-sm text-[#64748B]">
          Vratite zahtjev na čekanju i odobrite ga.
        </p>
      </CardHeader>
      <CardContent>
        <Button onClick={restore} disabled={loading}>
          {loading ? "..." : "Vrati zahtjev (Restore)"}
        </Button>
      </CardContent>
    </Card>
  );
}
