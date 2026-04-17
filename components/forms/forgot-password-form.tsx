"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const schema = z.object({
  email: z.string().email("Unesite validan email"),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: FormData) {
    setError(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email.trim().toLowerCase() }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 429) {
      setError(typeof json?.error === "string" ? json.error : "Previše zahtjeva. Pokušajte kasnije.");
      return;
    }
    if (!res.ok && json?.success === false && json?.error) {
      setError(typeof json.error === "string" ? json.error : "Greška. Pokušajte ponovo.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <Card className="w-full rounded-2xl border-[#E2E8F0] shadow-card">
        <CardContent className="pt-8">
          <p className="text-center text-sm leading-relaxed text-slate-700">
            Ako nalog sa tim emailom postoji i ima lozinku, poslali smo link za novu lozinku. Proverite poštu (i spam).
          </p>
          <p className="mt-6 text-center">
            <Link href="/login" className="text-sm font-semibold text-[#2563EB] underline-offset-4 hover:underline">
              Nazad na prijavu
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full rounded-2xl border-[#E2E8F0] shadow-card">
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="ime@primjer.me" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Slanje…" : "Pošalji link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
