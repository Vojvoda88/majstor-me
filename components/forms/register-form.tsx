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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Wrench } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Ime mora imati najmanje 2 karaktera"),
  email: z.string().email("Unesite validan email"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 karaktera"),
  phone: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(["USER", "HANDYMAN"]),
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
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!json.success) {
      const err = json.error;
      const msg =
        typeof err === "string"
          ? err
          : err && typeof err === "object"
            ? (Object.values(err).flat().find(Boolean) as string) || "Greška pri registraciji"
            : "Greška pri registraciji";
      setError(msg);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/login");
      return;
    }

    if (data.role === "HANDYMAN") {
      router.push("/dashboard/handyman");
    } else {
      router.push("/request/create");
    }
    router.refresh();
  }

  const role = watch("role") ?? "USER";

  return (
    <Card className="w-full rounded-2xl border-[#E2E8F0] shadow-card">
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error ? <div className="form-error">{error}</div> : null}
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
          </div>
          <div className="space-y-3">
            <Label htmlFor="name">Ime i prezime</Label>
            <Input id="name" placeholder="Marko Marković" {...register("name")} />
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
