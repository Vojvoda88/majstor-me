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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REQUEST_CATEGORIES, CITIES, AVAILABILITY_STATUS_OPTIONS } from "@/lib/constants";
import { GalleryEditor } from "@/components/profile/gallery-editor";

const profileSchema = z.object({
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().optional(),
  categories: z.array(z.string()).min(1, "Odaberite najmanje jednu kategoriju"),
  cities: z.array(z.string()).min(1, "Odaberite najmanje jedan grad"),
  galleryImages: z.array(z.string().url()).optional(),
  yearsOfExperience: z.number().int().min(0).max(50).optional().nullable(),
  startingPrice: z.number().min(0).optional().nullable(),
  averageResponseMinutes: z.number().int().min(0).max(1440).optional().nullable(),
  serviceAreasDescription: z.string().max(500).optional().nullable(),
  travelRadiusKm: z.number().int().min(0).max(200).optional().nullable(),
  availabilityStatus: z.enum(["AVAILABLE", "BUSY", "EMERGENCY_ONLY"]).optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const CITIES_LIST = [...CITIES];

type Profile = {
  phone?: string | null;
  bio: string | null;
  categories: string[];
  cities: string[];
  galleryImages?: string[];
  yearsOfExperience?: number | null;
  startingPrice?: number | null;
  completedJobsCount?: number;
  averageResponseMinutes?: number | null;
  serviceAreasDescription?: string | null;
  travelRadiusKm?: number | null;
  availabilityStatus?: string | null;
} | null;

export function HandymanProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: profile?.phone ?? "",
      bio: profile?.bio ?? "",
      categories: profile?.categories ?? [],
      cities: profile?.cities ?? [],
      galleryImages: profile?.galleryImages ?? [],
      yearsOfExperience: profile?.yearsOfExperience ?? null,
      startingPrice: profile?.startingPrice ?? null,
      averageResponseMinutes: profile?.averageResponseMinutes ?? null,
      serviceAreasDescription: profile?.serviceAreasDescription ?? null,
      travelRadiusKm: profile?.travelRadiusKm ?? null,
      availabilityStatus: (profile?.availabilityStatus as ProfileFormData["availabilityStatus"]) ?? "AVAILABLE",
    },
  });

  const categories = watch("categories");
  const cities = watch("cities");
  const galleryImages = watch("galleryImages") ?? [];

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await fetch("/api/handyman/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      const msg = typeof json?.error === "string" ? json.error : "Greška pri ažuriranju profila";
      if (!json?.success) throw new Error(msg);
    },
    onSuccess: () => {
      router.push("/dashboard/handyman");
      router.refresh();
    },
  });

  const toggleCategory = (cat: string) => {
    const next = categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
    setValue("categories", next);
  };

  const toggleCity = (city: string) => {
    const next = cities.includes(city)
      ? cities.filter((c) => c !== city)
      : [...cities, city];
    setValue("cities", next);
  };

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      {mutation.error && <div className="form-error">{mutation.error.message}</div>}

      {/* Osnovni podaci */}
      <Card>
        <CardHeader>
          <CardTitle>Osnovni podaci</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Broj telefona</Label>
            <Input
              {...register("phone")}
              type="tel"
              placeholder="npr. 069 123 456"
              className="mt-2"
            />
          </div>
          <div>
            <Label>Bio / Opis usluga</Label>
            <Textarea
              {...register("bio")}
              className="mt-2"
              rows={3}
              placeholder="Kratko o vama i uslugama..."
            />
          </div>
          <div>
            <Label>Kategorije *</Label>
            <p className="text-sm text-muted-foreground">Odaberite kategorije u kojima nudite usluge</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {REQUEST_CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
            {errors.categories && (
              <p className="mt-1 text-sm text-destructive">{errors.categories.message}</p>
            )}
          </div>
          <div>
            <Label>Gradovi *</Label>
            <p className="text-sm text-muted-foreground">U kojim gradovima radite</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CITIES_LIST.map((city) => (
                <label key={city} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cities.includes(city)}
                    onChange={() => toggleCity(city)}
                  />
                  <span className="text-sm">{city}</span>
                </label>
              ))}
            </div>
            {errors.cities && (
              <p className="mt-1 text-sm text-destructive">{errors.cities.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detalji profila */}
      <Card>
        <CardHeader>
          <CardTitle>Detalji profila</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Godine iskustva</Label>
              <Input
                type="number"
                min={0}
                max={50}
                {...register("yearsOfExperience", { valueAsNumber: true })}
                placeholder="npr. 5"
              />
            </div>
            <div>
              <Label>Cijena od (€)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                {...register("startingPrice", { valueAsNumber: true })}
                placeholder="npr. 30"
              />
            </div>
            <div>
              <Label>Prosječno vrijeme odgovora (min)</Label>
              <Input
                type="number"
                min={0}
                max={1440}
                {...register("averageResponseMinutes", { valueAsNumber: true })}
                placeholder="npr. 60"
              />
            </div>
            <div>
              <Label>Radius putovanja (km)</Label>
              <Input
                type="number"
                min={0}
                max={200}
                {...register("travelRadiusKm", { valueAsNumber: true })}
                placeholder="npr. 50"
              />
            </div>
          </div>
          <div>
            <Label>Status dostupnosti</Label>
            <select
              {...register("availabilityStatus")}
              className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {AVAILABILITY_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Opis područja rada (opciono)</Label>
            <Textarea
              {...register("serviceAreasDescription")}
              className="mt-2"
              rows={2}
              placeholder="Dodatne informacije o područjima..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Galerija */}
      <Card>
        <CardHeader>
          <CardTitle>Galerija radova</CardTitle>
          <p className="text-sm text-muted-foreground">Dodajte URL-ove slika vaših radova</p>
        </CardHeader>
        <CardContent>
          <GalleryEditor
            images={galleryImages}
            onChange={(imgs) => setValue("galleryImages", imgs)}
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Čuvanje..." : "Sačuvaj profil"}
      </Button>
    </form>
  );
}
