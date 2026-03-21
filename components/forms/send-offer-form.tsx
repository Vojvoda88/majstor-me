"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PRICE_TYPES } from "@/lib/constants";

const OFFER_PRICE_TYPE_TUPLE = [
  "FIKSNA",
  "PREGLED_PA_KONACNA",
  "PO_SATU",
  "PO_M2",
  "PO_METRU_DUZNOM",
  "PO_TURI",
  "PO_DOGOVORU",
  "DRUGO",
] as const;

const AVAILABILITY_OPTIONS = [
  { value: "DANAS", label: "Danas" },
  { value: "SUTRA", label: "Sjutra" },
  { value: "NEKOLIKO_DANA", label: "U narednih nekoliko dana" },
  { value: "PO_DOGOVORU", label: "Po dogovoru" },
] as const;

const offerSchema = z
  .object({
    priceType: z.enum(OFFER_PRICE_TYPE_TUPLE),
    priceTypeOtherLabel: z.string().max(200).optional(),
    priceValue: z.number().optional().nullable(),
    message: z.string().max(1200).optional(),
    availabilityWindow: z.string().optional(),
    includedInPrice: z.string().max(500).optional(),
    extraNote: z.string().max(2000).optional(),
    proposedDate: z.string().optional(),
    proposedArrival: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.priceType === "FIKSNA") {
      if (data.priceValue == null || data.priceValue < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Unesite iznos (€)", path: ["priceValue"] });
      }
    }
    if (data.priceType === "DRUGO") {
      const t = (data.priceTypeOtherLabel ?? "").trim();
      if (t.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Opišite kako naplaćujete",
          path: ["priceTypeOtherLabel"],
        });
      }
    }
  });

type OfferFormData = z.infer<typeof offerSchema>;

function needsPriceAmount(priceType: string): boolean {
  return ["FIKSNA", "OKVIRNA", "PO_SATU", "PO_M2", "PO_METRU_DUZNOM", "PO_TURI", "IZLAZAK_NA_TEREN"].includes(priceType);
}

export function SendOfferForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: { priceType: "PO_DOGOVORU", availabilityWindow: "PO_DOGOVORU" },
  });

  const priceType = watch("priceType");

  const mutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      const res = await fetch("/api/offers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          priceType: data.priceType,
          priceTypeOtherLabel: data.priceType === "DRUGO" ? data.priceTypeOtherLabel : undefined,
          priceValue:
            data.priceType === "FIKSNA" || needsPriceAmount(data.priceType)
              ? data.priceValue
              : data.priceValue ?? undefined,
          message: data.message || undefined,
          availabilityWindow: data.availabilityWindow || undefined,
          includedInPrice: data.includedInPrice || undefined,
          extraNote: data.extraNote || undefined,
          proposedDate: data.proposedDate ? new Date(data.proposedDate).toISOString() : undefined,
          proposedArrival: data.proposedArrival || undefined,
        }),
      });
      const json = await res.json();
      const msg = typeof json?.error === "string" ? json.error : "Greška pri slanju ponude";
      if (!json?.success) {
        const err = new Error(msg) as Error & { needsCredits?: boolean; needsUnlock?: boolean };
        err.needsCredits = json.needsCredits === true;
        err.needsUnlock = json.needsUnlock === true;
        throw err;
      }
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  const showAmount = needsPriceAmount(priceType) || priceType === "PREGLED_PA_KONACNA";

  return (
    <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.15)]">
      <CardHeader>
        <CardTitle className="font-display text-xl">Pošalji ponudu</CardTitle>
        <CardDescription className="text-slate-600">
          Ponuda je dostupna nakon otključavanja kontakta. Pošaljite ponudu za manje od 2&nbsp;€ u odnosu na klasične oglase — plaćate
          samo kada želite kontakt, bez pretplate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
          {mutation.error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
              {mutation.error.message}
              {(mutation.error as Error & { needsUnlock?: boolean }).needsUnlock && (
                <p className="mt-2 font-medium">
                  Prvo otključajte kontakt gore — tek tada se mogu poslati ponuda ili direktan poziv.
                </p>
              )}
              {(mutation.error as Error & { needsCredits?: boolean }).needsCredits && (
                <Link
                  href="/dashboard/handyman/credits"
                  className="mt-2 inline-block font-semibold text-blue-700 underline underline-offset-2"
                >
                  Dopuni kredite →
                </Link>
              )}
            </div>
          )}
          <div>
            <Label>Tip cijene / način naplate</Label>
            <select className="select-premium mt-2" {...register("priceType")}>
              {PRICE_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          {priceType === "DRUGO" && (
            <div>
              <Label htmlFor="priceTypeOtherLabel">Kako naplaćujete? *</Label>
              <Input
                id="priceTypeOtherLabel"
                placeholder="npr. Po komadu, po dogovoru na licu mjesta…"
                {...register("priceTypeOtherLabel")}
              />
              {errors.priceTypeOtherLabel && (
                <p className="mt-1 text-sm text-destructive">{errors.priceTypeOtherLabel.message}</p>
              )}
            </div>
          )}

          {showAmount && (
            <div>
              <Label htmlFor="priceValue">
                Iznos (€)
                {priceType === "PREGLED_PA_KONACNA" && (
                  <span className="font-normal text-slate-500"> — opciono</span>
                )}
                {priceType === "FIKSNA" && " *"}
              </Label>
              <Input
                id="priceValue"
                type="number"
                step="0.01"
                min="0"
                placeholder="npr. 45"
                {...register("priceValue", { valueAsNumber: true })}
              />
              {errors.priceValue && (
                <p className="mt-1 text-sm text-destructive">{errors.priceValue.message}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="availabilityWindow">Kada možete doći</Label>
            <select id="availabilityWindow" className="select-premium mt-2" {...register("availabilityWindow")}>
              {AVAILABILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="message">Poruka korisniku</Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Kratko predstavite pristup, rok ili što je uključeno…"
              {...register("message")}
            />
          </div>

          <div>
            <Label htmlFor="includedInPrice">Šta je uključeno u cijenu (opciono)</Label>
            <Textarea
              id="includedInPrice"
              rows={2}
              placeholder="npr. materijal, prijevoz, garancija…"
              {...register("includedInPrice")}
            />
          </div>

          <div>
            <Label htmlFor="extraNote">Dodatna napomena (opciono)</Label>
            <Textarea id="extraNote" rows={2} placeholder="Posebni uslovi ili pitanja…" {...register("extraNote")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="proposedDate">Tačan datum dolaska (opciono)</Label>
              <Input id="proposedDate" type="datetime-local" {...register("proposedDate")} />
            </div>
            <div>
              <Label htmlFor="proposedArrival">Napomena o terminu (opciono)</Label>
              <Input id="proposedArrival" placeholder="npr. Popodne, nakon 16h" {...register("proposedArrival")} />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={mutation.isPending}
            className="h-14 min-h-[48px] w-full rounded-xl sm:h-12 sm:min-h-0"
          >
            {mutation.isPending ? "Slanje…" : "Pošalji ponudu"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
