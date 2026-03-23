"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
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
import { REQUEST_CREATE_CATEGORY_CHOICES, URGENCY_OPTIONS, CITIES } from "@/lib/constants";
import { displayLabelForRequestCategory, REQUEST_CATEGORY_FALLBACK } from "@/lib/categories";
import { RequestPhotosEditor } from "./request-photos-editor";
import { containsContactBypass } from "@/lib/contact-sanitization";
import { createRequestAction } from "@/app/actions/create-request";

const createRequestSchema = z
  .object({
    requesterName: z.string().min(2, "Unesite ime"),
    category: z.string().min(1, "Odaberite kategoriju"),
    title: z.string().min(3, "Naslov mora imati najmanje 3 karaktera"),
    description: z.string().min(10, "Opis mora imati najmanje 10 karaktera").max(2000),
    city: z.string().min(1, "Unesite grad"),
    requesterPhone: z.string().min(6, "Unesite broj telefona"),
    address: z.string().optional(),
    requesterEmail: z.union([z.string().email("Neispravan email"), z.literal("")]).optional(),
    urgency: z.enum(["HITNO_DANAS", "U_NAREDNA_2_DANA", "NIJE_HITNO"]),
    photos: z.array(z.string().url()).max(5).optional().default([]),
  })
  .refine(
    (data) => {
      const t = containsContactBypass(data.title ?? "");
      return t.ok;
    },
    { message: "Ne ostavljajte kontakt podatke u naslovu. Koristite posebna polja.", path: ["title"] }
  )
  .refine(
    (data) => {
      const d = containsContactBypass(data.description ?? "");
      return d.ok;
    },
    {
      message: "Ne ostavljajte telefon, email, Instagram, Viber, WhatsApp ili adresu u opisu. Koristite posebna polja.",
      path: ["description"],
    }
  );

type CreateRequestFormData = z.infer<typeof createRequestSchema>;

type CreateRequestFormProps = {
  initialCategory?: string;
  initialCity?: string;
};

export function CreateRequestForm({ initialCategory, initialCity }: CreateRequestFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") ?? initialCategory ?? "";
  const urlCity = searchParams.get("city") ?? initialCity ?? "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      city: urlCity || "",
      urgency: "NIJE_HITNO",
      category: urlCategory,
      photos: [],
      requesterEmail: "",
    },
  });

  const photos = watch("photos") ?? [];
  const urgencyWatch = watch("urgency");
  const urgencyHint = URGENCY_OPTIONS.find((o) => o.value === urgencyWatch)?.hint;

  useEffect(() => {
    // Kada se promijene URL parametri ili inicijalne vrijednosti, sinhronizuj formu
    if (urlCategory || urlCity) {
      reset((prev) => ({
        ...prev,
        city: urlCity || "",
        category: urlCategory,
      }));
    }
  }, [urlCategory, urlCity, reset]);

  /** Ako URL nosi staru kategoriju (npr. deep link), prikaži je da submit i dalje prolazi validaciju. */
  const categorySelectOptions = useMemo(() => {
    const base = [...REQUEST_CREATE_CATEGORY_CHOICES] as string[];
    if (urlCategory && !base.includes(urlCategory)) {
      return [urlCategory, ...base];
    }
    return base;
  }, [urlCategory]);

  const mutation = useMutation({
    mutationFn: async (data: CreateRequestFormData) => {
      const result = await createRequestAction(data);
      if (!result.ok) {
        throw new Error(result.error ?? "Došlo je do greške prilikom slanja zahtjeva. Pokušajte ponovo.");
      }
      return result.data;
    },
    onSuccess: (data) => {
      const notified = data.handymenNotified ?? 0;
      const parts = ["created=1"];
      if (notified > 0) parts.push(`notified=${notified}`);
      const qs = parts.join("&");
      const guest = typeof data.guestAccessToken === "string" ? data.guestAccessToken : null;
      if (guest) {
        router.push(`/request-access/${encodeURIComponent(guest)}?${qs}`);
      } else {
        router.push(`/request/${data.id}?${qs}`);
      }
      router.refresh();
    },
  });

  return (
  <>
    <Card className="w-full overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-marketplace">
      <CardHeader className="border-b border-slate-100/80 bg-gradient-to-r from-slate-50/80 to-white px-5 sm:px-8 sm:py-8">
        <CardTitle className="font-display text-xl text-brand-navy sm:text-2xl">Detalji zahtjeva</CardTitle>
        <CardDescription className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
          Objava je besplatna. Nakon što zahtjev bude odobren, majstori koji vide posao mogu poslati ponude — vi birate
          da li i koga angažujete.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-8 pt-6 sm:px-8">
        <form
          id="create-request-form"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-5"
          data-testid="create-request-form"
        >
          {mutation.error && (
            <div className="form-error text-sm text-[#B91C1C]">
              {(mutation.error as Error).message || "Došlo je do greške prilikom slanja zahtjeva. Pokušajte ponovo."}
            </div>
          )}
          <div className="space-y-3">
            <Label htmlFor="requesterName">Ime *</Label>
            <Input
              id="requesterName"
              placeholder="Vaše ime"
              {...register("requesterName")}
            />
            {errors.requesterName && (
              <p className="text-sm text-destructive">{errors.requesterName.message}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="requesterPhone">Broj telefona *</Label>
            <Input
              id="requesterPhone"
              type="tel"
              placeholder="+382 69 123 456"
              {...register("requesterPhone")}
            />
            {errors.requesterPhone && (
              <p className="text-sm text-destructive">{errors.requesterPhone.message}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="category">Kategorija</Label>
            <select
              id="category"
              className="select-premium"
              {...register("category")}
            >
              <option value="">Odaberite...</option>
              {categorySelectOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {displayLabelForRequestCategory(cat)}
                </option>
              ))}
            </select>
            <p className="text-xs leading-relaxed text-slate-500">
              Ne vidiš tačnu uslugu? Izaberi „Ostalo“ i u opisu napiši šta ti treba.
            </p>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="title">Naslov problema *</Label>
            <Input
              id="title"
              placeholder="Kratak naslov šta vam treba"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="description">Opis problema ili posla *</Label>
            <Textarea
              id="description"
              placeholder="Opišite šta vam treba: šta je pokvareno, dimenzije, kada vam treba, itd. Detaljniji opis = bolje ponude."
              rows={5}
              className="min-h-[120px] text-base"
              {...register("description")}
            />
            <p className="text-xs text-slate-500">
              Telefon, email i adresu unesite u posebna polja ispod – ne u opis.
            </p>
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="city">Grad</Label>
            <select
              id="city"
              className="select-premium"
              {...register("city")}
            >
              <option value="">Svi gradovi</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="requesterEmail">Email (opciono)</Label>
            <Input
              id="requesterEmail"
              type="email"
              placeholder="email@primjer.me"
              {...register("requesterEmail")}
            />
            {errors.requesterEmail && (
              <p className="text-sm text-destructive">{errors.requesterEmail.message}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="address">Adresa (opciono)</Label>
            <Input
              id="address"
              placeholder="Ulica i broj"
              {...register("address")}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="photos">Slike (opciono)</Label>
            <RequestPhotosEditor
              photos={photos}
              onChange={(p) => setValue("photos", p)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgency">Hitnost</Label>
            <select
              id="urgency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("urgency")}
            >
              {URGENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {urgencyHint && (
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{urgencyHint}</p>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Nakon slanja, zahtjev prvo pregleda administrator. Kada bude odobren, majstori će moći da odgovore. Vi
            odlučujete da li ćete nekoga angažovati — bez obaveze.
          </p>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary mt-2 hidden w-full items-center justify-center disabled:opacity-50 md:flex"
            data-testid="create-request-submit"
          >
            {mutation.isPending ? "Šaljem zahtjev..." : "Objavi zahtjev"}
          </button>
        </form>
      </CardContent>
    </Card>
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#E2E8F0] bg-[rgba(255,255,255,0.92)] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-[16px] md:hidden">
      <button
        type="submit"
        form="create-request-form"
        disabled={mutation.isPending}
        className="flex h-14 w-full items-center justify-center rounded-[16px] bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-lg font-bold text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)] transition active:scale-[0.98] disabled:opacity-60"
        data-testid="create-request-submit"
      >
        {mutation.isPending ? "Šaljem zahtjev..." : "Objavi zahtjev"}
      </button>
    </div>
  </>
  );
}
