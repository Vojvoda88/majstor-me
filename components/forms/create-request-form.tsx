"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
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
import { REQUEST_CATEGORIES, URGENCY_OPTIONS, CITIES } from "@/lib/constants";
import { RequestPhotosEditor } from "./request-photos-editor";

const createRequestSchema = z.object({
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
});

type CreateRequestFormData = z.infer<typeof createRequestSchema>;

export function CreateRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") ?? "";
  const urlCity = searchParams.get("city") ?? "";

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

  useEffect(() => {
    if (urlCategory || urlCity) {
      reset({
        city: urlCity || "",
        urgency: "NIJE_HITNO",
        category: urlCategory,
      });
    }
  }, [urlCategory, urlCity, reset]);

  const mutation = useMutation({
    mutationFn: async (data: CreateRequestFormData) => {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Greška");
      return json.data;
    },
    onSuccess: (data) => {
      const notified = data.handymenNotified ?? 0;
      const token = data.requesterToken ? `&token=${encodeURIComponent(data.requesterToken)}` : "";
      router.push(`/request/${data.id}?created=1${notified > 0 ? `&notified=${notified}` : ""}${token}`);
      router.refresh();
    },
  });

  return (
  <>
    <Card className="w-full rounded-[22px] border border-[#E7EDF5] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">Novi zahtjev</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Opisite problem ili potrebu. Majstori će vam poslati ponude.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form
          id="create-request-form"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-5"
          data-testid="create-request-form"
        >
          {mutation.error && <div className="form-error">{mutation.error.message}</div>}
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
              {REQUEST_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary mt-2 hidden w-full items-center justify-center disabled:opacity-50 md:flex"
            data-testid="create-request-submit"
          >
            {mutation.isPending ? "Objavljivanje..." : "Objavi zahtjev"}
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
        {mutation.isPending ? "Objavljivanje..." : "Objavi zahtjev"}
      </button>
    </div>
  </>
  );
}
