"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function MarkAsBypassAttemptButton({
  requestId,
  canMark,
}: {
  requestId: string;
  canMark: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!canMark) return null;

  const handleClick = async () => {
    if (!confirm("Označiti ovaj zahtjev kao pokušaj zaobilaženja (spam)? Zahtjev će biti uklonjen, a majstorima koji su uzeli kontakt biće vraćeni krediti."))
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/spam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      if (data.success) {
        const r = data.data;
        if (r?.refundCount > 0) {
          alert(`Zahtjev označen kao spam. Refundirano: ${r.refundCount} majstor(a), ukupno ${r.totalCreditsRefunded} kredita.`);
        } else if (r?.alreadyRefunded) {
          alert("Zahtjev označen kao spam. (Refund je već bio izvršen ranije.)");
        } else {
          alert("Zahtjev označen kao spam.");
        }
        router.refresh();
      } else {
        alert(data.error ?? "Greška");
      }
    } catch {
      alert("Greška");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
      onClick={handleClick}
      disabled={loading}
    >
      <AlertTriangle className="mr-2 h-4 w-4" />
      {loading ? "..." : "Pokušaj zaobilaženja"}
    </Button>
  );
}
