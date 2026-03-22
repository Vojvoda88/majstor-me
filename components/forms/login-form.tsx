"use client";

import { useState } from "react";
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
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Unesite validan email"),
  password: z.string().min(1, "Unesite lozinku"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Pogrešan email ili lozinka");
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
          {error && <div className="form-error" data-testid="login-error">{error}</div>}
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
            <Input
              id="password"
              type="password"
              data-testid="login-password"
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
              Registrujte se
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
