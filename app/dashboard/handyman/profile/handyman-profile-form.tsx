"use client";

import { useMemo } from "react";
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
import { CITIES, AVAILABILITY_STATUS_OPTIONS } from "@/lib/constants";
import { displayLabelForRequestCategory, HANDYMAN_SELECTABLE_INTERNAL_NAMES } from "@/lib/categories";
import { GalleryEditor } from "@/components/profile/gallery-editor";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import type { HandymanProfileClientProps } from "@/lib/handyman-profile-for-client";

const MAX_CATEGORIES = 5;

const profileSchema = z.object({
  avatarUrl: z.string().url().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().optional(),
  categories: z
    .array(z.string())
    .min(1, "Odaberite najmanje jednu kategoriju")
    .max(MAX_CATEGORIES, "Možete izabrati maksimalno 5 kategorija."),
  cities: z.array(z.string()), // prazan = svi gradovi (server čuva punu listu)
  galleryImages: z.array(z.string().url()).optional(),
  yearsOfExperience: z.number().int().min(0).max(50).optional().nullable(),
  startingPrice: z.number().min(0).optional().nullable(),
  averageResponseMinutes: z.number().int().min(0).max(1440).optional().nullable(),
  serviceAreasDescription: z.string().max(500).optional().nullable(),
  travelRadiusKm: z.number().int().min(0).max(200).optional().nullable(),
  availabilityStatus: z.enum(["AVAILABLE", "BUSY", "EMERGENCY_ONLY"]).optional().nullable(),
  viberPhone: z.string().max(20).optional().nullable(),
  whatsappPhone: z.string().max(20).optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const CITIES_LIST = [...CITIES];

export function HandymanProfileForm({
  profile,
  userName,
}: {
  profile: HandymanProfileClientProps | null;
  userName?: string | null;
}) {
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
      avatarUrl: profile?.avatarUrl ?? null,
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
      viberPhone: profile?.viberPhone ?? null,
      whatsappPhone: profile?.whatsappPhone ?? null,
    },
  });

  const categories = watch("categories");
  const cities = watch("cities");

  const handymanCategoryChoices = useMemo(() => {
    const selectable = new Set(HANDYMAN_SELECTABLE_INTERNAL_NAMES);
    const extras = (profile?.categories ?? []).filter((c) => !selectable.has(c));
    return [...HANDYMAN_SELECTABLE_INTERNAL_NAMES, ...extras];
  }, [profile?.categories]);
  const galleryImages = watch("galleryImages") ?? [];
  const avatarUrl = watch("avatarUrl");

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
    if (categories.includes(cat)) {
      setValue("categories", categories.filter((c) => c !== cat));
    } else if (categories.length >= MAX_CATEGORIES) {
      return; // Ne dodavaj, prikaži error ispod
    } else {
      setValue("categories", [...categories, cat]);
    }
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
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Sve izmjene opisa, slika i ostalih javnih podataka idu administratoru na pregled prije javne objave profila.
      </div>

      {/* Osnovni podaci */}
      <Card>
        <CardHeader>
          <CardTitle>Osnovni podaci</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Profilna slika</Label>
            <AvatarUpload
              currentUrl={avatarUrl ?? null}
              onChange={(url) => setValue("avatarUrl", url)}
              userName={userName}
            />
          </div>
          <div>
            <Label>Broj telefona</Label>
            <Input
              {...register("phone")}
              type="tel"
              placeholder="npr. 069 123 456"
              className="mt-2"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Viber broj (opciono)</Label>
              <Input
                {...register("viberPhone")}
                type="tel"
                placeholder="npr. 069 123 456"
                className="mt-2"
              />
            </div>
            <div>
              <Label>WhatsApp broj (opciono)</Label>
              <Input
                {...register("whatsappPhone")}
                type="tel"
                placeholder="npr. 069 123 456"
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label>Kategorije *</Label>
            <p className="text-sm text-muted-foreground">
              Odaberite kategorije u kojima nudite usluge (maks. {MAX_CATEGORIES})
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {handymanCategoryChoices.map((cat) => (
                <label key={cat} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span className="text-sm">{displayLabelForRequestCategory(cat)}</span>
                </label>
              ))}
            </div>
            {errors.categories && (
              <p className="mt-1 text-sm text-destructive">{errors.categories.message}</p>
            )}
            {categories.length >= MAX_CATEGORIES && !errors.categories && (
              <p className="mt-1 text-sm text-amber-600">Možete izabrati maksimalno 5 kategorija.</p>
            )}
          </div>
          <div>
            <Label>Gradovi (opciono)</Label>
            <p className="text-sm text-muted-foreground">
              Ako ne izaberete ni jedan, tretiraćemo kao da radite u svim gradovima na platformi.
            </p>
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
          <p className="text-sm text-muted-foreground">
            Ovo pomaže klijentu da odmah vidi koliko ste iskusni, koliko brzo odgovarate i za kakve poslove ste dostupni.
          </p>
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
          <p className="text-sm text-muted-foreground">Dodajte slike stvarnih radova da profil djeluje uvjerljivo i ozbiljno.</p>
        </CardHeader>
        <CardContent>
          <GalleryEditor
            images={galleryImages}
            onChange={(imgs) => setValue("galleryImages", imgs)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opis profila</CardTitle>
          <p className="text-sm text-muted-foreground">
            Na kraju napišite jasan opis: šta radite, za koga radite i zašto bi klijent izabrao baš vas.
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register("bio")}
            rows={5}
            placeholder="Npr. Radimo adaptacije kupatila, vodoinstalaterske intervencije i manje hitne popravke u Podgorici i okolini. Dolazak po dogovoru, uredan rad i jasna cijena prije početka."
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Čuvanje..." : "Sačuvaj profil"}
      </Button>
    </form>
  );
}
