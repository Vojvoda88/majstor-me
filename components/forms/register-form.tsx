"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/ui/password-field";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Wrench, ChevronDown } from "lucide-react";
import { HANDYMAN_START_BONUS_CREDITS, STANDARD_LEAD_CREDITS } from "@/lib/credit-packages";
import { CITIES, MAX_HANDYMAN_CATEGORIES } from "@/lib/constants";
import { displayLabelForRequestCategory, HANDYMAN_SELECTABLE_INTERNAL_NAMES } from "@/lib/categories";

const registerSchema = z
  .object({
    name: z.string().min(2, "Naziv mora imati najmanje 2 karaktera"),
    email: z.string().email("Unesite validan email"),
    password: z.string().min(6, "Lozinka mora imati najmanje 6 karaktera"),
    phone: z.string().optional(),
    viberPhone: z.string().optional(),
    whatsappPhone: z.string().optional(),
    city: z.string().optional(),
    role: z.enum(["USER", "HANDYMAN"]).default("USER"),
    categories: z.array(z.string()).default([]),
    workCities: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "HANDYMAN") return;
    if (data.categories.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Izaberite najmanje jednu kategoriju koju pokrivate.",
        path: ["categories"],
      });
    }
    if (data.categories.length > MAX_HANDYMAN_CATEGORIES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Možete izabrati najviše ${MAX_HANDYMAN_CATEGORIES} kategorija.`,
        path: ["categories"],
      });
    }
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm({
  defaultRole = "USER",
}: {
  defaultRole?: "USER" | "HANDYMAN";
}) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [workCitiesOpen, setWorkCitiesOpen] = useState(false);
  const workCitiesPanelRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole, categories: [], workCities: [], viberPhone: "", whatsappPhone: "" },
  });

  async function onSubmit(data: RegisterFormData) {
    setError("");
    const role: "USER" | "HANDYMAN" = data.role === "HANDYMAN" ? "HANDYMAN" : "USER";
    const payload: Record<string, unknown> = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role,
      ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
      ...(role === "HANDYMAN" && data.viberPhone?.trim() ? { viberPhone: data.viberPhone.trim() } : {}),
      ...(role === "HANDYMAN" && data.whatsappPhone?.trim() ? { whatsappPhone: data.whatsappPhone.trim() } : {}),
      ...(data.city?.trim() ? { city: data.city.trim() } : {}),
    };
    if (role === "HANDYMAN") {
      payload.categories = data.categories;
      payload.workCities = data.workCities;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let json: {
      success?: boolean;
      error?: unknown;
      code?: string;
      data?: { verificationEmailSent?: boolean };
    };
    try {
      json = await res.json();
    } catch {
      setError("Server nije vratio validan odgovor. Pokušajte ponovo.");
      return;
    }

    if (!json.success) {
      if (json.code === "EMAIL_ALREADY_EXISTS") {
        setError(
          "Ovaj email je već registrovan. Prijavite se ili koristite drugi email."
        );
        return;
      }
      const err = json.error;
      const msg =
        typeof err === "string"
          ? err
          : err && typeof err === "object"
            ? (Object.values(err as Record<string, unknown>).flat().find(Boolean) as string) ||
              "Greška pri registraciji"
            : "Greška pri registraciji";
      setError(msg);
      return;
    }

    const verify = json.data?.verificationEmailSent === false ? "skipped" : "sent";
    router.push(`/login?registered=1&verify=${verify}`);
    router.refresh();
  }

  const role = (watch("role") as RegisterFormData["role"] | undefined) ?? defaultRole;
  const categoriesSel = watch("categories") ?? [];
  const workCitiesSel = watch("workCities") ?? [];

  const prevRole = useRef(role);
  useEffect(() => {
    if (prevRole.current === "HANDYMAN" && role === "USER") {
      setValue("categories", []);
      setValue("workCities", []);
      setValue("viberPhone", "");
      setValue("whatsappPhone", "");
      setWorkCitiesOpen(false);
    }
    prevRole.current = role;
  }, [role, setValue]);

  useEffect(() => {
    if (!workCitiesOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = workCitiesPanelRef.current;
      if (el && !el.contains(e.target as Node)) setWorkCitiesOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [workCitiesOpen]);

  const toggleCategory = (cat: string) => {
    if (categoriesSel.includes(cat)) {
      setValue("categories", categoriesSel.filter((c) => c !== cat));
    } else if (categoriesSel.length < MAX_HANDYMAN_CATEGORIES) {
      setValue("categories", [...categoriesSel, cat]);
    }
  };

  const toggleWorkCity = (city: string) => {
    if (workCitiesSel.includes(city)) {
      setValue(
        "workCities",
        workCitiesSel.filter((c) => c !== city)
      );
    } else {
      setValue("workCities", [...workCitiesSel, city]);
    }
  };

  return (
    <Card className="w-full rounded-2xl border-[#E2E8F0] shadow-card">
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </div>
          ) : null}
          <div className="space-y-3">
            <Label>Tip naloga</Label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  role === "USER"
                    ? "border-[#2563EB] bg-[#2563EB]/5"
                    : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]"
                )}
              >
                <input type="radio" value="USER" className="sr-only" {...register("role")} />
                <User className={cn("h-8 w-8", role === "USER" ? "text-[#2563EB]" : "text-[#94A3B8]")} />
                <span className="font-medium text-[#0F172A]">Korisnik</span>
                <span className="text-xs text-[#64748B]">Tražim majstora</span>
              </label>
              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  role === "HANDYMAN"
                    ? "border-[#2563EB] bg-[#2563EB]/5"
                    : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]"
                )}
              >
                <input type="radio" value="HANDYMAN" className="sr-only" {...register("role")} />
                <Wrench className={cn("h-8 w-8", role === "HANDYMAN" ? "text-[#2563EB]" : "text-[#94A3B8]")} />
                <span className="font-medium text-[#0F172A]">Majstor</span>
                <span className="text-xs text-[#64748B]">Nudim usluge</span>
              </label>
            </div>
            {role === "HANDYMAN" && (
              <div className="rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2.5 text-xs leading-relaxed text-slate-700">
                <strong className="font-semibold text-slate-800">Za majstore:</strong> Registracija je besplatna; dobijate{" "}
                {HANDYMAN_START_BONUS_CREDITS.toLocaleString("sr-Latn-ME")} start kredita. Nema pretplate — krediti idu na
                otključavanje kontakta kad vam posao odgovara (standardni, nije hitno posao = {STANDARD_LEAD_CREDITS}{" "}
                kredita). Admin kratko odobri profil prije punog pristupa poslovima.
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="name">
              {role === "HANDYMAN"
                ? "Naziv profila (firma, servis, tim ili ime)"
                : "Ime i prezime"}
            </Label>
            <Input
              id="name"
              placeholder={
                role === "HANDYMAN"
                  ? "npr. Elektro Servis Podgorica, Tim Majstor, Marko Marković"
                  : "Marko Marković"
              }
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ime@primjer.me"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="password">Lozinka</Label>
            <PasswordField
              id="password"
              placeholder="Min. 6 karaktera"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon (opciono)</Label>
            <Input id="phone" placeholder="+382 xx xxx xxx" {...register("phone")} />
          </div>
          {role === "HANDYMAN" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="viberPhone">Viber broj (opciono)</Label>
                <Input id="viberPhone" placeholder="+382 xx xxx xxx" {...register("viberPhone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappPhone">WhatsApp broj (opciono)</Label>
                <Input id="whatsappPhone" placeholder="+382 xx xxx xxx" {...register("whatsappPhone")} />
              </div>
            </div>
          )}
          <div className="space-y-3">
            <Label htmlFor="city">Grad (opciono)</Label>
            <Input id="city" placeholder="npr. Podgorica, Nikšić..." {...register("city")} />
            {role === "HANDYMAN" ? (
              <p className="text-xs text-[#64748B]">
                Glavni grad na profilu. Područje poslovanja (više gradova) birate ispod, prije registracije.
              </p>
            ) : null}
          </div>
          {role === "HANDYMAN" && (
            <>
              <div className="space-y-2 border-t border-slate-100 pt-5">
                <Label>Kategorije koje pokrivate *</Label>
                <p className="text-xs text-[#64748B]">
                  Najmanje jedna, najviše {MAX_HANDYMAN_CATEGORIES}. Admin i dalje odobrava profil.
                </p>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white p-3">
                  <div className="flex flex-col gap-2">
                    {HANDYMAN_SELECTABLE_INTERNAL_NAMES.map((cat) => (
                      <label key={cat} className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 shrink-0"
                          checked={categoriesSel.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                        />
                        <span>{displayLabelForRequestCategory(cat)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {errors.categories && (
                  <p className="text-sm text-destructive">{errors.categories.message as string}</p>
                )}
              </div>
              <div className="space-y-2" ref={workCitiesPanelRef}>
                <Label>Gradovi u kojima radite</Label>
                <p className="text-xs text-[#64748B]">
                  Ako ništa ne označite, smatraćemo da radite u <strong className="font-medium text-slate-700">svim gradovima</strong> na
                  platformi. Otvorite meni i po želji označite gradove.
                </p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setWorkCitiesOpen((o) => !o)}
                    className={cn(
                      "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-sm",
                      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                    aria-expanded={workCitiesOpen}
                    aria-haspopup="listbox"
                  >
                    <span className="min-w-0 truncate text-slate-800">
                      {workCitiesSel.length === 0
                        ? "Svi gradovi (podrazumijevano)"
                        : workCitiesSel.length === 1
                          ? workCitiesSel[0]
                          : workCitiesSel.length <= 3
                            ? workCitiesSel.join(", ")
                            : `${workCitiesSel.length} gradova izabrano`}
                    </span>
                    <ChevronDown
                      className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", workCitiesOpen && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                  {workCitiesOpen && (
                    <div
                      className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white p-2 shadow-lg"
                      role="listbox"
                    >
                      {CITIES.map((city) => (
                        <label
                          key={city}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 shrink-0"
                            checked={workCitiesSel.includes(city)}
                            onChange={() => toggleWorkCity(city)}
                          />
                          <span>{city}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          <Button type="submit" className="mt-2 w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Registracija..." : "Registruj se"}
          </Button>
          <p className="mt-4 text-center text-sm text-[#64748B]">
            Već imate nalog?{" "}
            <Link href="/login" className="font-medium text-[#2563EB] underline-offset-4 hover:underline">
              Prijavite se
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
