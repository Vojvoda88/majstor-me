"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      const json = await res.json();
      const msg = typeof json?.error === "string" ? json.error : "Greška pri otkazivanju";
      if (!json?.success) throw new Error(msg);
    },
    onSuccess: () => router.refresh(),
  });

  return (
    <div>
      {mutation.error && (
        <p className="mb-2 text-sm text-[#DC2626]">{mutation.error.message}</p>
      )}
      <Button
        variant="outline"
        className="border-[#DC2626]/50 text-[#DC2626] hover:bg-[#DC2626]/10"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Otkazivanje..." : "Otkazi zahtjev"}
      </Button>
    </div>
  );
}
