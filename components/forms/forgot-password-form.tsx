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
import { useUiLanguage } from "@/lib/i18n/ui-language";

type ForgotPasswordCopy = {
  emailInvalid: string;
  tooManyRequests: string;
  genericError: string;
  sentInfo: string;
  backToLogin: string;
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
};

const COPY: Record<"sr" | "en" | "ru" | "tr", ForgotPasswordCopy> = {
  sr: {
    emailInvalid: "Unesite validan email",
    tooManyRequests: "Previše zahtjeva. Pokušajte kasnije.",
    genericError: "Greška. Pokušajte ponovo.",
    sentInfo:
      "Ako nalog sa tim emailom postoji i ima lozinku, poslali smo link za novu lozinku. Proverite poštu (i spam).",
    backToLogin: "Nazad na prijavu",
    emailLabel: "Email",
    emailPlaceholder: "ime@primjer.me",
    submit: "Pošalji link",
    submitting: "Slanje...",
  },
  en: {
    emailInvalid: "Enter a valid email address",
    tooManyRequests: "Too many requests. Please try again later.",
    genericError: "Error. Please try again.",
    sentInfo:
      "If an account with this email exists and has a password, we sent a reset link. Check your inbox (and spam).",
    backToLogin: "Back to login",
    emailLabel: "Email",
    emailPlaceholder: "name@example.com",
    submit: "Send link",
    submitting: "Sending...",
  },
  ru: {
    emailInvalid: "Введите корректный email",
    tooManyRequests: "Слишком много запросов. Попробуйте позже.",
    genericError: "Ошибка. Попробуйте снова.",
    sentInfo:
      "Если аккаунт с этим email существует и имеет пароль, мы отправили ссылку для сброса. Проверьте почту (и спам).",
    backToLogin: "Назад ко входу",
    emailLabel: "Email",
    emailPlaceholder: "name@example.com",
    submit: "Отправить ссылку",
    submitting: "Отправка...",
  },
  tr: {
    emailInvalid: "Gecerli bir e-posta girin",
    tooManyRequests: "Cok fazla istek. Lutfen daha sonra tekrar deneyin.",
    genericError: "Hata. Lutfen tekrar deneyin.",
    sentInfo:
      "Bu e-postaya ait bir hesap varsa ve sifresi varsa, sifre yenileme baglantisi gonderildi. Lutfen gelen kutusunu (ve spam klasorunu) kontrol edin.",
    backToLogin: "Girise don",
    emailLabel: "E-posta",
    emailPlaceholder: "name@example.com",
    submit: "Baglanti gonder",
    submitting: "Gonderiliyor...",
  },
};

function createSchema(copy: ForgotPasswordCopy) {
  return z.object({
    email: z.string().email(copy.emailInvalid),
  });
}

type FormData = z.infer<ReturnType<typeof createSchema>>;

export function ForgotPasswordForm() {
  const language = useUiLanguage();
  const copy = COPY[language];
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createSchema(copy)),
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
      setError(typeof json?.error === "string" ? json.error : copy.tooManyRequests);
      return;
    }
    if (!res.ok && json?.success === false && json?.error) {
      setError(typeof json.error === "string" ? json.error : copy.genericError);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <Card className="w-full rounded-2xl border-[#E2E8F0] shadow-card">
        <CardContent className="pt-8">
          <p className="text-center text-sm leading-relaxed text-slate-700">
            {copy.sentInfo}
          </p>
          <p className="mt-6 text-center">
            <Link href="/login" className="text-sm font-semibold text-[#2563EB] underline-offset-4 hover:underline">
              {copy.backToLogin}
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
            <Label htmlFor="email">{copy.emailLabel}</Label>
            <Input id="email" type="email" placeholder={copy.emailPlaceholder} autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? copy.submitting : copy.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
