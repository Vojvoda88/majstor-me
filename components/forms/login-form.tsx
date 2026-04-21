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

          <div className="relative my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">ili</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard", prompt: "select_account" })}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Nastavi sa Google
          </button>

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
