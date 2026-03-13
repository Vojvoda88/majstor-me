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

const createRequestSchema = z.object({
  category: z.string().min(1, "Odaberite kategoriju"),
  description: z.string().min(10, "Opis mora imati najmanje 10 karaktera"),
  city: z.string().min(1, "Unesite grad"),
  address: z.string().optional(),
  urgency: z.enum(["HITNO_DANAS", "U_NAREDNA_2_DANA", "NIJE_HITNO"]),
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
    formState: { errors },
    reset,
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      city: urlCity || "Podgorica",
      urgency: "NIJE_HITNO",
      category: urlCategory,
    },
  });

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
        body: JSON.stringify({ ...data, photos: [] }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Greška");
      return json.data;
    },
    onSuccess: (data) => {
      router.push(`/request/${data.id}`);
      router.refresh();
    },
  });

  return (
    <Card className="w-full border-[#E2E8F0] shadow-soft">
      <CardHeader>
        <CardTitle>Novi zahtjev</CardTitle>
        <CardDescription>
          Opisite problem ili potrebu. Majstori će vam poslati ponude.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              placeholder="Detaljno opišite problem..."
              rows={4}
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
          <Button type="submit" className="mt-2 w-full" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? "Objavljivanje..." : "Objavi zahtjev"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
