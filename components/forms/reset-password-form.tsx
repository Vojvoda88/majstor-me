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
import { useUiLanguage } from "@/lib/i18n/ui-language";

type ResetPasswordCopy = {
  minPassword: string;
  confirmPassword: string;
  passwordsMismatch: string;
  genericError: string;
  invalidLink: string;
  forgotPassword: string;
  newPassword: string;
  confirmPasswordLabel: string;
  save: string;
  saving: string;
};

const COPY: Record<"sr" | "en" | "ru" | "tr", ResetPasswordCopy> = {
  sr: {
    minPassword: "Najmanje 8 karaktera",
    confirmPassword: "Potvrdite lozinku",
    passwordsMismatch: "Lozinke se ne poklapaju",
    genericError: "Greška. Zatražite novi link.",
    invalidLink:
      "Nedostaje ili je neispravan link. Zatražite novi reset sa stranice za zaboravljenu lozinku.",
    forgotPassword: "Zaboravljena lozinka",
    newPassword: "Nova lozinka",
    confirmPasswordLabel: "Potvrdi lozinku",
    save: "Sačuvaj novu lozinku",
    saving: "Snimam...",
  },
  en: {
    minPassword: "At least 8 characters",
    confirmPassword: "Confirm your password",
    passwordsMismatch: "Passwords do not match",
    genericError: "Error. Request a new link.",
    invalidLink: "Missing or invalid link. Request a new reset link from the forgot-password page.",
    forgotPassword: "Forgot password",
    newPassword: "New password",
    confirmPasswordLabel: "Confirm password",
    save: "Save new password",
    saving: "Saving...",
  },
  ru: {
    minPassword: "Минимум 8 символов",
    confirmPassword: "Подтвердите пароль",
    passwordsMismatch: "Пароли не совпадают",
    genericError: "Ошибка. Запросите новую ссылку.",
    invalidLink: "Ссылка отсутствует или недействительна. Запросите новый сброс на странице восстановления.",
    forgotPassword: "Забыли пароль",
    newPassword: "Новый пароль",
    confirmPasswordLabel: "Подтвердите пароль",
    save: "Сохранить новый пароль",
    saving: "Сохранение...",
  },
  tr: {
    minPassword: "En az 8 karakter",
    confirmPassword: "Sifreyi onaylayin",
    passwordsMismatch: "Sifreler eslesmiyor",
    genericError: "Hata. Yeni bir baglanti isteyin.",
    invalidLink: "Baglanti eksik veya gecersiz. Sifremi unuttum sayfasindan yeni bir sifirlama baglantisi isteyin.",
    forgotPassword: "Sifremi unuttum",
    newPassword: "Yeni sifre",
    confirmPasswordLabel: "Sifreyi onayla",
    save: "Yeni sifreyi kaydet",
    saving: "Kaydediliyor...",
  },
};

function createSchema(copy: ResetPasswordCopy) {
  return z
    .object({
      password: z.string().min(8, copy.minPassword),
      confirm: z.string().min(8, copy.confirmPassword),
    })
    .refine((d) => d.password === d.confirm, { message: copy.passwordsMismatch, path: ["confirm"] });
}

type FormData = z.infer<ReturnType<typeof createSchema>>;

export function ResetPasswordForm({ token }: { token: string }) {
  const language = useUiLanguage();
  const copy = COPY[language];
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createSchema(copy)),
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
      setError(typeof json?.error === "string" ? json.error : copy.genericError);
      return;
    }
    router.push("/login?reset=1");
    router.refresh();
  }

  if (!token || token.length < 32) {
    return (
      <Card className="w-full rounded-2xl border-[#E2E8F0] shadow-card">
        <CardContent className="pt-8">
          <p className="text-center text-sm text-slate-700">{copy.invalidLink}</p>
          <p className="mt-6 text-center">
            <Link href="/forgot-password" className="text-sm font-semibold text-[#2563EB] underline-offset-4 hover:underline">
              {copy.forgotPassword}
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
            <Label htmlFor="password">{copy.newPassword}</Label>
            <PasswordField id="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-3">
            <Label htmlFor="confirm">{copy.confirmPasswordLabel}</Label>
            <PasswordField id="confirm" autoComplete="new-password" {...register("confirm")} />
            {errors.confirm && <p className="text-sm text-destructive">{errors.confirm.message}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? copy.saving : copy.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
