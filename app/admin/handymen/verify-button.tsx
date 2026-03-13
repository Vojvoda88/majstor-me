"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export function VerifyHandymanButton({ profileId }: { profileId: string }) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/handymen/${profileId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VERIFIED" }),
      });
      const json = await res.json();
      const msg = typeof json?.error === "string" ? json.error : "Greška pri verifikaciji";
      if (!json?.success) throw new Error(msg);
    },
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex items-center gap-2">
      {mutation.error && <span className="text-xs text-destructive">{mutation.error.message}</span>}
      <Button
      size="sm"
      variant="outline"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "..." : "Verifikuj"}
    </Button>
    </div>
  );
}
