"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Unlock } from "lucide-react";

export function UnlockContactButton({
  requestId,
  alreadyUnlocked,
  creditsRequired,
  onUnlocked,
}: {
  requestId: string;
  alreadyUnlocked?: boolean;
  creditsRequired?: number;
  onUnlocked?: (data: { phone: string; address?: string | null }) => void;
}) {
  const router = useRouter();
  const { data: fetchedContact, refetch } = useQuery({
    queryKey: ["unlock-contact", requestId],
    queryFn: async () => {
      const res = await fetch(`/api/requests/${requestId}/unlock-contact`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: false,
  });

  useEffect(() => {
    if (alreadyUnlocked) refetch();
  }, [alreadyUnlocked, refetch]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/requests/${requestId}/unlock-contact`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) {
        const err = new Error(json.error ?? "Greška") as Error & { needsCredits?: boolean };
        err.needsCredits = json.needsCredits === true;
        throw err;
      }
      return json.data;
    },
    onSuccess: (data) => {
      onUnlocked?.(data);
      router.refresh();
    },
  });

  const contactData = mutation.data ?? fetchedContact;

  if (contactData) {
    return (
      <div className="rounded-lg bg-emerald-50 p-4">
        <p className="text-sm font-medium text-emerald-800">Kontakt</p>
        <p className="mt-1">
          <a href={`tel:${contactData.phone}`} className="font-medium text-emerald-900 hover:underline">
            {contactData.phone}
          </a>
        </p>
        {contactData.address && (
          <p className="mt-1 text-sm text-emerald-700">{contactData.address}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {mutation.error && (
        <p className="mb-2 text-sm text-destructive">
          {(mutation.error as Error).message}
          {(mutation.error as Error & { needsCredits?: boolean }).needsCredits && (
            <>
              {" "}
              <Link href="/dashboard/handyman#credits" className="font-medium underline">
                Kupi kredite
              </Link>
            </>
          )}
        </p>
      )}
      <Button
        variant="outline"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="gap-2"
      >
        <Unlock className="h-4 w-4" />
        {mutation.isPending ? "Otključavanje..." : creditsRequired ? `Otključaj lead (${creditsRequired} kredita)` : "Otključaj lead"}
      </Button>
    </div>
  );
}
