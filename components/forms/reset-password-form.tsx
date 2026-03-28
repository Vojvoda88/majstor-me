"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordField } from "@/components/ui/password-field";

const schema = z
  .object({
    password: z.string().min(8, "Najmanje 8 karaktera"),
    confirm: z.string().min(8, "Potvrdite lozinku"),
  })
  .refine((d) => d.password === d.confirm, { message: "Lozinke se ne poklapaju", path: ["confirm"] });

type FormData = z.infer<typeof schema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(data: FormData) {
    setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof json?.error === "string" ? json.error : "Greška. Zatražite novi link.");
      return;
    }
    router.push("/login?reset=1");
    router.refresh();
  }

  if (!token || token.length < 32) {
    return (
      <Card className="w-full rounded-2xl border-[#E2E8F0] shadow-card">
        <CardContent className="pt-8">
          <p className="text-center text-sm text-slate-700">Nedostaje ili je neispravan link. Zatražite novi reset sa stranice za zaboravljenu lozinku.</p>
          <p className="mt-6 text-center">
            <Link href="/forgot-password" className="text-sm font-semibold text-[#2563EB] underline-offset-4 hover:underline">
              Zaboravljena lozinka
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
            <Label htmlFor="password">Nova lozinka</Label>
            <PasswordField id="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-3">
            <Label htmlFor="confirm">Potvrdi lozinku</Label>
            <PasswordField id="confirm" autoComplete="new-password" {...register("confirm")} />
            {errors.confirm && <p className="text-sm text-destructive">{errors.confirm.message}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Snimam…" : "Sačuvaj novu lozinku"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
