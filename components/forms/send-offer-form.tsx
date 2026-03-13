"use client";

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

const offerSchema = z.object({
  priceType: z.enum(["PO_DOGOVORU", "OKVIRNA", "IZLAZAK_NA_TEREN", "FIKSNA"]),
  priceValue: z.number().optional().nullable(),
  message: z.string().optional(),
  proposedDate: z.string().optional(),
}).refine(
  (data) => data.priceType !== "FIKSNA" || (data.priceValue != null && data.priceValue >= 0),
  { message: "Fiksna cijena zahtijeva iznos", path: ["priceValue"] }
);

type OfferFormData = z.infer<typeof offerSchema>;

export function SendOfferForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: { priceType: "PO_DOGOVORU" },
  });

  const priceType = watch("priceType");

  const mutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          ...data,
          priceValue: data.priceType === "FIKSNA" ? data.priceValue : undefined,
          proposedDate: data.proposedDate ? new Date(data.proposedDate).toISOString() : undefined,
        }),
      });
      const json = await res.json();
      const msg = typeof json?.error === "string" ? json.error : "Greška pri slanju ponude";
      if (!json?.success) throw new Error(msg);
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pošalji ponudu</CardTitle>
        <CardDescription>
          Unesite detalje vaše ponude
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          {mutation.error && <div className="form-error">{mutation.error.message}</div>}
          <div>
            <Label>Tip cijene</Label>
            <select
              className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register("priceType")}
            >
              {PRICE_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </select>
          </div>
          {(priceType === "OKVIRNA" || priceType === "FIKSNA") && (
            <div>
              <Label htmlFor="priceValue">
                {priceType === "FIKSNA" ? "Cijena (€) *" : "Okvirna cijena (€)"}
              </Label>
              <Input
                id="priceValue"
                type="number"
                step="0.01"
                min="0"
                placeholder={priceType === "OKVIRNA" ? "Opciono" : undefined}
                {...register("priceValue", { valueAsNumber: true })}
              />
              {errors.priceValue && (
                <p className="text-sm text-destructive">{errors.priceValue.message}</p>
              )}
            </div>
          )}
          <div>
            <Label htmlFor="message">Poruka (opciono)</Label>
            <Textarea
              id="message"
              rows={3}
              placeholder="Dodatne informacije za korisnika..."
              {...register("message")}
            />
          </div>
          <div>
            <Label htmlFor="proposedDate">Predloženi datum (opciono)</Label>
            <Input
              id="proposedDate"
              type="datetime-local"
              {...register("proposedDate")}
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Slanje..." : "Pošalji ponudu"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
