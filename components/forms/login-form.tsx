"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  defaultLoginPathForRole,
  getSafeInternalCallbackPath,
  shouldUseRoleDefaultInstead,
} from "@/lib/auth/safe-callback-path";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordField } from "@/components/ui/password-field";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Unesite validan email"),
  password: z.string().min(1, "Unesite lozinku"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function messageForAuthErrorCode(code: string): string | null {
  switch (code) {
    case "Configuration":
      return "Konfiguracija prijave je neispravna (provjerite NEXTAUTH_URL / NEXTAUTH_SECRET na serveru).";
    case "Callback":
    case "OAuthCallback":
      return "Greška pri obradi prijave. Pokušajte ponovo za nekoliko sekundi.";
    case "Verification":
    case "EmailSignin":
      return "Verifikacija emaila nije uspjela. Pokušajte ponovo.";
    case "SessionRequired":
      return "Sesija je istekla. Prijavite se ponovo.";
    default:
      return null;
  }
}

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailQ = searchParams.get("email");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setInfo("Nalog je kreiran. Možete se odmah prijaviti.");
    } else if (searchParams.get("verified") === "1") {
      setInfo("Email adresa je potvrđena. Sada se možete prijaviti.");
    } else {
      setInfo(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!emailQ) return;
    try {
      reset({ email: decodeURIComponent(emailQ), password: "" });
    } catch {
      reset({ email: emailQ, password: "" });
    }
  }, [emailQ, reset]);
  async function onSubmit(data: LoginFormData) {
    setError(null);
    setInfo(null);

    let result: Awaited<ReturnType<typeof signIn>>;
    try {
      result = await signIn("credentials", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      });
    } catch (e) {
      console.error("[login] signIn threw", e);
      setError(
        "Greška pri prijavi (klijent). Osvježite stranicu i pokušajte ponovo; ako se ponavlja, javite podršci."
      );
      return;
    }

    const authError = result?.error;

    if (result?.error || result?.ok === false) {
      if (authError === "CredentialsSignin") {
        setError("Pogrešan email ili lozinka");
      } else if (authError === "AccessDenied") {
        setError("Pristup je odbijen.");
      } else if (authError) {
        const specific = messageForAuthErrorCode(authError);
        setError(
          specific ??
            `Prijava nije uspjela (kod: ${authError}). Pokušajte ponovo ili kontaktirajte podršku.`
        );
      } else {
        setError("Pogrešan email ili lozinka");
      }
      return;
    }

    router.refresh();
    let session = await getSession();
    if (!session?.user) {
      await new Promise((r) => setTimeout(r, 80));
      session = await getSession();
    }
    const role = (session?.user as { role?: string } | undefined)?.role;
    const rawCallback = searchParams.get("callbackUrl");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const safe = getSafeInternalCallbackPath(rawCallback, origin);

    let target: string;
    if (!shouldUseRoleDefaultInstead(safe)) {
      target = safe as string;
    } else {
      target = defaultLoginPathForRole(role);
    }

    router.push(target);
    router.refresh();
  }

  return (
    <Card className="w-full rounded-2xl border-[#E2E8F0] shadow-card">
      <CardContent className="pt-8">
        <form
          method="post"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          data-testid="login-form"
        >
          {info && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {info}
            </div>
          )}
          {error && (
            <div className="form-error" data-testid="login-error" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ime@primjer.me"
              data-testid="login-email"
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
              data-testid="login-password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="mt-2 w-full" size="lg" disabled={isSubmitting} data-testid="login-submit">
            {isSubmitting ? "Prijava..." : "Prijavi se"}
          </Button>
          <p className="mt-4 text-center text-sm text-[#64748B]">
            Nemate nalog?{" "}
            <Link href="/register" className="font-medium text-[#2563EB] underline-offset-4 hover:underline">
              Otvorite registraciju
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="min-h-[280px] animate-pulse rounded-2xl bg-slate-100" aria-hidden />}>
      <LoginFormInner />
    </Suspense>
  );
}
