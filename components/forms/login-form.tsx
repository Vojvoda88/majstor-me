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

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailQ = searchParams.get("email");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setInfo("Poslali smo vam email za potvrdu naloga. Potvrdite email adresu kako biste nastavili.");
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

  const unverifiedFromUrl = searchParams.get("error") === "unverified";

  async function onSubmit(data: LoginFormData) {
    setError(null);
    setResendMsg(null);
    if (!unverifiedFromUrl) setInfo(null);

    const result = await signIn("credentials", {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      redirect: false,
    });

    /**
     * NextAuth sa redirect:false: kad signIn callback vrati URL sa ?error=unverified,
     * klijent postavlja result.error = "unverified" i result.url = null (ne puni url kad postoji error).
     * Stari kod je provjeravao samo result.url — zato je unverified uvijek padao u granu "pogrešna lozinka".
     */
    const authError = result?.error;
    if (authError === "unverified" || result?.url?.includes("unverified")) {
      const emailParam = encodeURIComponent(data.email.trim().toLowerCase());
      router.replace(result?.url?.includes("unverified") ? (result.url as string) : `/login?error=unverified&email=${emailParam}`);
      return;
    }

    if (result?.error || result?.ok === false) {
      if (authError === "CredentialsSignin") {
        setError("Pogrešan email ili lozinka");
      } else if (authError === "AccessDenied") {
        setError("Pristup je odbijen.");
      } else if (authError) {
        setError("Prijava nije uspjela. Pokušajte ponovo.");
      } else {
        setError("Pogrešan email ili lozinka");
      }
      if (searchParams.get("error") === "unverified") {
        router.replace("/login");
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

  async function resendVerification() {
    const email = getValues("email")?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setResendMsg("Unesite email u polje iznad pa pokušajte ponovo.");
      return;
    }
    setResendBusy(true);
    setResendMsg(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.success) {
        setResendMsg("Ako nalog postoji i email još nije potvrđen, poslali smo novi link.");
      } else {
        setResendMsg(typeof json?.error === "string" ? json.error : "Pokušajte kasnije.");
      }
    } catch {
      setResendMsg("Greška mreže. Pokušajte ponovo.");
    } finally {
      setResendBusy(false);
    }
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
          {unverifiedFromUrl && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-3 text-sm text-amber-950">
              <p className="font-medium">Email adresa još nije potvrđena.</p>
              <p className="mt-1 text-amber-900/90">Potvrdite email prije prijave.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full border-amber-300 text-amber-950"
                disabled={resendBusy}
                onClick={() => void resendVerification()}
              >
                {resendBusy ? "Slanje…" : "Pošalji ponovo link za potvrdu"}
              </Button>
              {resendMsg && <p className="mt-2 text-xs text-amber-900">{resendMsg}</p>}
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
