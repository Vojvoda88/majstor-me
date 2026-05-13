"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  requestId: string;
  currentStatus: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  canWriteRequests: boolean;
};

export function MarkAgreedButton({ requestId, currentStatus, canWriteRequests }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!canWriteRequests) return null;
  if (currentStatus === "COMPLETED") return null;

  const onMark = async () => {
    if (!confirm("Označiti ovaj zahtjev kao „Posao dogovoren“ i zaključati ga za nova otključavanja?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        alert(data.error ?? "Greška pri zaključavanju zahtjeva.");
        return;
      }
      router.refresh();
    } catch {
      alert("Greška pri zaključavanju zahtjeva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posao dogovoren (admin)</CardTitle>
        <p className="text-sm text-[#64748B]">
          Zaključava zahtjev: više nema novih otključavanja kontakta ni novih ponuda.
        </p>
      </CardHeader>
      <CardContent>
        <Button type="button" onClick={onMark} disabled={loading}>
          {loading ? "Zaključavam..." : "Označi kao posao dogovoren"}
        </Button>
      </CardContent>
    </Card>
  );
}
