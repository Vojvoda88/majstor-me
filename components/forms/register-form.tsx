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

const registerSchema = z.object({
  name: z.string().min(2, "Ime mora imati najmanje 2 karaktera"),
  email: z.string().email("Unesite validan email"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 karaktera"),
  phone: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(["USER", "HANDYMAN"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "USER" },
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

  return (
    <Card className="w-full border-[#E2E8F0] shadow-soft">
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error ? <div className="form-error">{error}</div> : null}
          <div className="space-y-3">
            <Label htmlFor="role">Tip naloga</Label>
            <select
              id="role"
              className="select-premium"
              {...register("role")}
            >
              <option value="USER">Korisnik (tražim majstora)</option>
              <option value="HANDYMAN">Majstor (nudim usluge)</option>
            </select>
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
