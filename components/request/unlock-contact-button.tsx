"use client";

import { useEffect } from "react";
import { trackFunnel } from "@/lib/track-funnel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Unlock, Coins, CheckCircle2, Phone, Mail, MapPin } from "lucide-react";

export function UnlockContactButton({
  requestId,
  alreadyUnlocked,
  creditsRequired,
  insufficientCredits = false,
  onUnlocked,
}: {
  requestId: string;
  alreadyUnlocked?: boolean;
  creditsRequired?: number;
  insufficientCredits?: boolean;
  onUnlocked?: (data: {
    phone: string;
    address?: string | null;
    requesterName?: string | null;
    email?: string | null;
    isVerified?: boolean;
    creditsSpent?: number;
  }) => void;
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
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="font-semibold text-emerald-900">Lead otključan</p>
        </div>
        <p className="mt-1 text-sm text-emerald-700">
          Kontakt podaci su sada dostupni. Možete poslati ponudu.
        </p>

        <div className="mt-4 space-y-2 rounded-lg bg-white/70 p-3 text-sm">
          {contactData.requesterName && (
            <p className="font-medium text-slate-800">{contactData.requesterName}</p>
          )}
          <div className="flex items-center gap-2 text-slate-700">
            <Phone className="h-4 w-4 shrink-0 text-slate-500" />
            <a href={`tel:${contactData.phone}`} className="font-medium text-emerald-800 hover:underline">
              {contactData.phone}
            </a>
          </div>
          {contactData.email && (
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="h-4 w-4 shrink-0 text-slate-500" />
              <a href={`mailto:${contactData.email}`} className="text-emerald-800 hover:underline">
                {contactData.email}
              </a>
            </div>
          )}
          {contactData.address && (
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <span>{contactData.address}</span>
            </div>
          )}
          {contactData.isVerified && (
            <p className="text-xs text-emerald-700">Verifikovan korisnik</p>
          )}
          {contactData.creditsSpent != null && contactData.creditsSpent > 0 && (
            <p className="text-xs text-slate-500">
              Potrošeno: {contactData.creditsSpent} kredita
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-600">
          Kontakt je sada otključan samo za vas kroz Majstor.me kreditni sistem.
        </p>
      </div>
    );
  }

  if (insufficientCredits) {
    return (
      <div className="rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 shadow-sm">
        <p className="text-sm font-semibold text-amber-950">
          Nemate dovoljno kredita za ovaj lead.
        </p>
        <Link href="/dashboard/handyman/credits" className="mt-3 inline-block">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-amber-400 bg-white font-semibold hover:bg-amber-50">
            <Coins className="h-4 w-4" />
            Dopuni kredite
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {mutation.error && (
        <p className="mb-3 text-sm font-medium text-red-700">
          {(mutation.error as Error).message}
          {(mutation.error as Error & { needsCredits?: boolean }).needsCredits && (
            <>
              {" "}
              <Link href="/dashboard/handyman/credits" className="font-semibold underline underline-offset-2">
                Dopuni kredite
              </Link>
            </>
          )}
        </p>
      )}
      <Button
        onClick={() => {
          trackFunnel("unlock_clicked", { requestId, creditsRequired });
          mutation.mutate();
        }}
        disabled={mutation.isPending}
        className="h-14 w-full gap-2 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-base font-bold text-white shadow-btn-cta hover:brightness-105 disabled:opacity-60 md:h-12 md:w-auto md:px-8"
        size="lg"
      >
        <Unlock className="h-5 w-5" />
        {mutation.isPending
          ? "Otključavanje..."
          : creditsRequired
            ? `Otključaj lead (${creditsRequired} kredita)`
            : "Otključaj lead"}
      </Button>
    </div>
  );
}
