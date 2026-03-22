"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Wrench, CheckCircle2, Sparkles } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Unesite najmanje 2 karaktera (ime, firma ili tim)"),
  email: z.string().email("Unesite validan email"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 karaktera"),
  phone: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(["USER", "HANDYMAN"]).default("USER"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm({
  defaultRole = "USER",
}: {
  defaultRole?: "USER" | "HANDYMAN";
}) {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  });

  async function onSubmit(data: RegisterFormData) {
    setError("");
    const role: "USER" | "HANDYMAN" = data.role === "HANDYMAN" ? "HANDYMAN" : "USER";
    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role,
      ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
      ...(data.city?.trim() ? { city: data.city.trim() } : {}),
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let json: { success?: boolean; error?: unknown; code?: string };
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

    const signInResult = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/login");
      return;
    }

    if (role === "HANDYMAN") {
      router.push("/dashboard/handyman");
    } else {
      router.push("/request/create");
    }
    router.refresh();
  }

  const role = watch("role") ?? "USER";

  return (
    <Card className="card-premium w-full overflow-hidden rounded-[1.35rem] border-slate-200/80">
      <CardContent className="px-5 pb-8 pt-7 sm:px-8 sm:pt-9">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <div className="relative overflow-hidden rounded-2xl border border-[#BFDBFE]/90 bg-gradient-to-br from-[#F8FAFC] via-white to-[#EFF6FF] p-4 shadow-[0_12px_40px_-20px_rgba(29,78,216,0.35)] ring-1 ring-white/80">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#2563EB]/10 blur-2xl" aria-hidden />
                <div className="relative flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-md shadow-blue-500/25">
                    <Sparkles className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-display text-sm font-bold uppercase tracking-wide text-[#1e3a8a]">
                      Za majstore
                    </p>
                    <ul className="space-y-2 text-sm leading-snug text-slate-700">
                      <li className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        <span>Pregledate poslove <strong className="font-semibold text-slate-900">besplatno</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        <span>
                          <strong className="font-semibold text-slate-900">1000 kredita</strong> za početak
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        <span>Kontakt i ponuda tek kada vam posao odgovara</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        <span>
                          <strong className="font-semibold text-slate-900">Bez pretplate</strong> — platite samo kredite kad šaljete ponudu
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="name">
              {role === "HANDYMAN" ? "Naziv profila (firma, tim ili ime)" : "Ime i prezime"}
            </Label>
            <Input
              id="name"
              placeholder={
                role === "HANDYMAN"
                  ? "npr. Majstor Marko, Studio XY, Tim „Brza popravka“"
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
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 karaktera"
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
          <div className="space-y-3">
            <Label htmlFor="city">Grad (opciono)</Label>
            <Input id="city" placeholder="npr. Podgorica, Nikšić..." {...register("city")} />
          </div>
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
