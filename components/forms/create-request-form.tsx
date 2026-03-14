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
  category: z.string().min(1, "Odaberite kategoriju"),
  description: z.string().min(10, "Opis mora imati najmanje 10 karaktera").max(2000),
  city: z.string().min(1, "Unesite grad"),
  address: z.string().optional(),
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
      city: urlCity || "Podgorica",
      urgency: "NIJE_HITNO",
      category: urlCategory,
      photos: [],
    },
  });

  const photos = watch("photos") ?? [];

  useEffect(() => {
    if (urlCategory || urlCity) {
      reset({
        city: urlCity || "Podgorica",
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
      router.push(`/request/${data.id}?created=1${notified > 0 ? `&notified=${notified}` : ""}`);
      router.refresh();
    },
  });

  return (
    <Card className="w-full rounded-xl bg-white shadow-sm transition hover:shadow-md">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">Novi zahtjev</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Opisite problem ili potrebu. Majstori će vam poslati ponude.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-5"
        >
          {mutation.error && <div className="form-error">{mutation.error.message}</div>}
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
              <option value="">Odaberite grad...</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
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
          <Button
            type="submit"
            className="mt-2 h-14 min-h-[48px] w-full text-base font-semibold sm:h-12 sm:text-sm"
            size="lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Objavljivanje..." : "Objavi zahtjev"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
