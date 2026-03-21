"use client";

import { useEffect, useState } from "react";
import { trackFunnel } from "@/lib/track-funnel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Unlock, Coins, CheckCircle2, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { whatsappHref, viberHref } from "@/lib/contact-links";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: fetchedContact, refetch } = useQuery({
    queryKey: ["unlock-contact", requestId],
    queryFn: async () => {
      const res = await fetch(`/api/requests/${requestId}/unlock-contact`, {
        method: "POST",
        credentials: "include",
      });
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
        credentials: "include",
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
      setConfirmOpen(false);
      onUnlocked?.(data);
      router.refresh();
    },
  });

  const contactData = mutation.data ?? fetchedContact;

  if (contactData) {
    const wa = contactData.phone ? whatsappHref(contactData.phone) : "#";
    const vb = contactData.phone ? viberHref(contactData.phone) : "#";

    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="font-semibold text-emerald-900">Kontakt je otključan</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-emerald-800">
          Možete <strong className="font-semibold">odmah pozvati ili pisati</strong> korisniku (Viber / WhatsApp / telefon), ili prvo
          poslati ponudu kroz formu ispod — oba su u redu nakon otključavanja.
        </p>

        <div className="mt-4 space-y-3 rounded-lg bg-white/80 p-3 text-sm">
          {contactData.requesterName && (
            <p className="font-medium text-slate-800">{contactData.requesterName}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${contactData.phone}`}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              <Phone className="h-4 w-4 shrink-0" />
              Pozovi
            </a>
            {vb !== "#" && (
              <a
                href={vb}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-[#7360f2]" />
                Viber
              </a>
            )}
            {wa !== "#" && (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-slate-600" />
                WhatsApp
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Phone className="h-4 w-4 shrink-0 text-slate-500" />
            <a href={`tel:${contactData.phone}`} className="font-medium text-emerald-800 hover:underline">
              {contactData.phone}
            </a>
          </div>
          {contactData.email && (
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="h-4 w-4 shrink-0 text-slate-500" />
              <a href={`mailto:${contactData.email}`} className="text-sm hover:underline">
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
              Potrošeno na kontakt: {contactData.creditsSpent} kredita
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-600">
          Ovaj kontakt je vezan za vaš nalog — koristite ga za dogovor oko posla na BrziMajstor.ME.
        </p>
      </div>
    );
  }

  if (insufficientCredits) {
    return (
      <div className="rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 shadow-sm">
        <p className="text-sm font-semibold text-amber-950">
          Nemate dovoljno kredita za ovaj kontakt.
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

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlock-confirm-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6">
            <h3 id="unlock-confirm-title" className="font-display text-lg font-bold text-slate-900">
              Otključati kontakt za ovaj posao?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Sada će se sa vašeg računa skinuti{" "}
              <strong className="font-semibold text-slate-900">
                {creditsRequired ?? "—"} kredita
              </strong>
              . Tek nakon toga vidite pun kontakt: telefon, Viber i WhatsApp (ako postoje), te možete poslati ponudu kroz
              formu ispod ili odmah pozvati korisnika.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Telefon, zatim Viber i WhatsApp gdje je dostupno</li>
              <li>Slanje ponude kroz platformu (nakon otključavanja)</li>
              <li>Direktan poziv ili poruka korisniku</li>
            </ul>
            <div className="mt-2 text-xs text-slate-500">Bez pretplate — plaćate samo ovaj kontakt.</div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setConfirmOpen(false)}
                disabled={mutation.isPending}
              >
                Otkaži
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => {
                  trackFunnel("unlock_clicked", { requestId, creditsRequired });
                  mutation.mutate();
                }}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Potvrđujem…" : "Potvrdi i otključaj"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={mutation.isPending}
        className="h-14 w-full gap-2 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-base font-bold text-white shadow-btn-cta hover:brightness-105 disabled:opacity-60 md:h-12 md:w-auto md:px-8"
        size="lg"
      >
        <Unlock className="h-5 w-5" />
        {mutation.isPending
          ? "Potvrđujem..."
          : creditsRequired
            ? `Želim kontakt (${creditsRequired} kredita)`
            : "Želim kontakt"}
      </Button>
    </div>
  );
}
