"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REQUEST_CATEGORIES, CITIES } from "@/lib/constants";

const profileSchema = z.object({
  bio: z.string().optional(),
  categories: z.array(z.string()).min(1, "Odaberite najmanje jednu kategoriju"),
  cities: z.array(z.string()).min(1, "Odaberite najmanje jedan grad"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const CITIES_LIST = [...CITIES];

export function HandymanProfileForm({
  profile,
}: {
  profile: { bio: string | null; categories: string[]; cities: string[] } | null;
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
      bio: profile?.bio ?? "",
      categories: profile?.categories ?? [],
      cities: profile?.cities ?? [],
    },
  });

  const categories = watch("categories");
  const cities = watch("cities");

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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Kategorije i gradovi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          {mutation.error && <div className="form-error">{mutation.error.message}</div>}
          <div>
            <Label>Bio (opciono)</Label>
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
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Čuvanje..." : "Sačuvaj profil"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
