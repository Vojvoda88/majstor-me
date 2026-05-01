"use client";

import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { REQUEST_CREATE_CATEGORY_CHOICES, URGENCY_OPTIONS, CITIES } from "@/lib/constants";
import { displayLabelForRequestCategory } from "@/lib/categories";
import { RequestPhotosEditor } from "./request-photos-editor";
import { containsContactBypass } from "@/lib/contact-sanitization";
import { createRequestAction } from "@/app/actions/create-request";
import { cn } from "@/lib/utils";

const DRAFT_STORAGE_KEY = "brzimajstor-request-draft-v1";

const createRequestSchema = z
  .object({
    requesterName: z.string().min(2, "Unesite ime"),
    category: z.string().min(1, "Izaberite kategoriju"),
    title: z.string().min(3, "Naslov mora imati najmanje 3 karaktera"),
    description: z.string().min(10, "Opis mora imati najmanje 10 karaktera").max(2000),
    city: z.string().min(1, "Unesite grad"),
    requesterPhone: z.string().min(6, "Unesite broj telefona"),
    requesterViberPhone: z.string().optional(),
    requesterWhatsappPhone: z.string().optional(),
    address: z.string().optional(),
    requesterEmail: z.union([z.string().email("Neispravan email"), z.literal("")]).optional(),
    urgency: z.enum(["HITNO_DANAS", "U_NAREDNA_2_DANA", "NIJE_HITNO"]),
    photos: z.array(z.string().url()).max(5).optional().default([]),
  })
  .refine(
    (data) => {
      const t = containsContactBypass(data.title ?? "");
      return t.ok;
    },
    { message: "Ne ostavljajte kontakt podatke u naslovu. Koristite posebna polja.", path: ["title"] }
  )
  .refine(
    (data) => {
      const d = containsContactBypass(data.description ?? "");
      return d.ok;
    },
    {
      message:
        "Ne ostavljajte telefon, email, Instagram, Viber, WhatsApp ili adresu u opisu. Koristite posebna polja.",
      path: ["description"],
    }
  );

type CreateRequestFormData = z.infer<typeof createRequestSchema>;

type StoredDraftV1 = {
  v: 1;
  step: number;
  values: Partial<CreateRequestFormData>;
};

type CreateRequestFormProps = {
  initialCategory?: string;
  initialCity?: string;
};

function coerceQueryString(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

/** Kratke oznake za korak 2 (mobilni izbor hitnosti). */
const URGENCY_SHORT_LABEL: Record<(typeof URGENCY_OPTIONS)[number]["value"], string> = {
  HITNO_DANAS: "Danas",
  U_NAREDNA_2_DANA: "Uskoro",
  NIJE_HITNO: "Fleksibilno",
};

export function CreateRequestForm({ initialCategory, initialCity }: CreateRequestFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = coerceQueryString(searchParams.get("category") ?? initialCategory ?? "");
  const urlCity = coerceQueryString(searchParams.get("city") ?? initialCity ?? "");

  const [step, setStep] = useState(1);
  const stepRef = useRef(step);
  stepRef.current = step;

  const draftHydratedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors },
    reset,
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      city: urlCity || "",
      urgency: "NIJE_HITNO",
      category: urlCategory,
      photos: [],
      requesterEmail: "",
      requesterViberPhone: "",
      requesterWhatsappPhone: "",
    },
  });

  const photos = watch("photos") ?? [];
  const urgencyWatch = watch("urgency");
  const urgencyHint = URGENCY_OPTIONS.find((o) => o.value === urgencyWatch)?.hint;

  useEffect(() => {
    if (urlCategory || urlCity) {
      reset((prev) => ({
        ...prev,
        city: urlCity || "",
        category: urlCategory,
      }));
    }
  }, [urlCategory, urlCity, reset]);

  useEffect(() => {
    if (draftHydratedRef.current) return;
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredDraftV1;
        if (parsed?.v === 1 && parsed.values && typeof parsed.values === "object") {
          reset((prev) => ({
            ...prev,
            ...parsed.values,
            category: (urlCategory || parsed.values.category || prev.category || "") as string,
            city: (urlCity || parsed.values.city || prev.city || "") as string,
            photos: Array.isArray(parsed.values.photos) ? parsed.values.photos : prev.photos,
            urgency: parsed.values.urgency ?? prev.urgency,
          }));

          if (typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 3) {
            setStep(parsed.step);
          }
        }
      }
    } catch {
      /* ignore corrupt draft */
    } finally {
      draftHydratedRef.current = true;
    }
  }, [reset, urlCategory, urlCity]);

  const persistDraft = useCallback(() => {
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          v: 1,
          step: stepRef.current,
          values: getValues(),
        } satisfies StoredDraftV1)
      );
    } catch {
      /* quota / private mode */
    }
  }, [getValues]);

  useEffect(() => {
    if (!draftHydratedRef.current) return;
    const sub = watch(() => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(persistDraft, 550);
    });
    return () => {
      sub.unsubscribe();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [watch, persistDraft]);

  useEffect(() => {
    if (!draftHydratedRef.current) return;
    persistDraft();
  }, [step, persistDraft]);

  const categorySelectOptions = useMemo(() => {
    const base = [...REQUEST_CREATE_CATEGORY_CHOICES] as string[];
    if (urlCategory && !base.includes(urlCategory)) {
      return [urlCategory, ...base];
    }
    return base;
  }, [urlCategory]);

  const mutation = useMutation({
    mutationFn: async (data: CreateRequestFormData) => {
      const result = await createRequestAction(data);
      if (!result.ok) {
        throw new Error(result.error ?? "Došlo je do greške prilikom slanja zahtjeva. Pokušajte ponovo.");
      }
      return result.data;
    },
    onSuccess: (data) => {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      const notified = data.handymenNotified ?? 0;
      const parts = ["created=1"];
      if (notified > 0) parts.push(`notified=${notified}`);
      const qs = parts.join("&");
      const guest = typeof data.guestAccessToken === "string" ? data.guestAccessToken : null;
      if (guest) {
        router.push(`/request-access/${encodeURIComponent(guest)}?${qs}`);
      } else {
        router.push(`/request/${data.id}?${qs}`);
      }
      router.refresh();
    },
  });

  const handleNext = async () => {
    if (step === 1) {
      const ok = await trigger(["category", "title", "description"], { shouldFocus: true });
      if (ok) setStep(2);
      return;
    }
    if (step === 2) {
      const ok = await trigger(["city", "urgency"], { shouldFocus: true });
      if (ok) setStep(3);
    }
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (step < 3) {
      e.preventDefault();
      void handleNext();
      return;
    }
    void handleSubmit((data) => mutation.mutate(data))(e);
  };

  const navDisabled = mutation.isPending;

  const stickyPrimaryClass =
    "flex min-h-[56px] flex-1 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-base font-bold text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)] transition active:scale-[0.98] disabled:opacity-60 sm:text-lg";

  const stickySecondaryClass =
    "flex min-h-[56px] flex-1 items-center justify-center rounded-[16px] border-2 border-slate-200 bg-white text-base font-semibold text-slate-800 transition active:scale-[0.98] disabled:opacity-50";

  return (
    <>
      <Card className="w-full overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-marketplace">
        <CardHeader className="border-b border-slate-100/80 bg-gradient-to-r from-slate-50/80 to-white px-5 py-5 sm:px-8 sm:py-6">
          <p className="text-[13px] font-semibold leading-snug text-slate-700 md:text-sm">
            Majstori u vašem području dobijaju vaš zahtjev odmah nakon slanja.
          </p>
          <CardTitle className="mt-3 font-display text-lg text-brand-navy sm:text-xl">Podaci za zahtjev</CardTitle>
          <CardDescription className="mt-1.5 text-sm text-slate-600">
            Korak {step} od 3 — polja označena (*) su obavezna.
          </CardDescription>
          <div className="mt-4 flex items-center justify-center gap-2" aria-hidden>
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  step >= n ? "bg-[#2563EB]" : "bg-slate-200"
                )}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-8 pt-5 sm:px-8 md:pb-10">
          <form
            id="create-request-form"
            onSubmit={onFormSubmit}
            className="space-y-4 sm:space-y-5"
            data-testid="create-request-form"
          >
            {mutation.error && (
              <div className="form-error text-sm text-[#B91C1C]">
                {(mutation.error as Error).message ||
                  "Došlo je do greške prilikom slanja zahtjeva. Pokušajte ponovo."}
              </div>
            )}

            {/* Korak 1 — šta vam treba */}
            <div className={cn("space-y-4 sm:space-y-5", step !== 1 && "hidden")} aria-hidden={step !== 1}>
              <h3 className="font-display text-base font-bold text-brand-navy md:text-lg">Šta vam treba?</h3>
              <div className="space-y-2">
                <Label htmlFor="category">Kategorija *</Label>
                <select id="category" className="select-premium min-h-[52px] text-base" {...register("category")}>
                  <option value="">Izaberite…</option>
                  {categorySelectOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {displayLabelForRequestCategory(cat)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  Nema tačne stavke? Izaberite „Ostalo / Ne vidim svoju uslugu“ i opišite u polju ispod.
                </p>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Kratki naslov *</Label>
                <Input
                  id="title"
                  placeholder="Npr. curenje slavine u kuhinji"
                  className="min-h-[52px] text-base"
                  {...register("title")}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Opis posla *</Label>
                <Textarea
                  id="description"
                  placeholder="Šta treba uraditi, gde, rok ako je bitan. Što jasnije — to bolje ponude."
                  rows={5}
                  className="min-h-[120px] text-base"
                  {...register("description")}
                />
                <p className="text-xs text-slate-500">
                  Bez telefona i emaila u tekstu — koristite polja za kontakt u zadnjem koraku.
                </p>
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Korak 2 — gdje i kada */}
            <div className={cn("space-y-4 sm:space-y-5", step !== 2 && "hidden")} aria-hidden={step !== 2}>
              <h3 className="font-display text-base font-bold text-brand-navy md:text-lg">Gdje i kada?</h3>
              <div className="space-y-2">
                <Label htmlFor="city">Grad *</Label>
                <select id="city" className="select-premium min-h-[52px] text-base" {...register("city")}>
                  <option value="">Izaberite grad</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>

              <fieldset className="space-y-2">
                <legend className="mb-1 text-sm font-medium text-slate-800">Kada vam treba majstor?</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {URGENCY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex min-h-[52px] cursor-pointer items-center justify-center rounded-2xl border-2 px-3 py-3 text-center text-sm font-semibold transition-colors",
                        urgencyWatch === opt.value
                          ? "border-[#2563EB] bg-blue-50 text-brand-navy"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      )}
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        className="sr-only"
                        {...register("urgency")}
                      />
                      <span>
                        {URGENCY_SHORT_LABEL[opt.value]}
                        <span className="mt-0.5 block text-[11px] font-normal text-slate-500 sm:text-xs">
                          {opt.label}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {errors.urgency && <p className="text-sm text-destructive">{errors.urgency.message}</p>}
                {urgencyHint && !errors.urgency && (
                  <p className="text-xs leading-relaxed text-slate-600">{urgencyHint}</p>
                )}
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="address">Adresa (opciono)</Label>
                <Input
                  id="address"
                  placeholder="Ulica i broj, ako želite"
                  className="min-h-[52px] text-base"
                  {...register("address")}
                />
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <Label htmlFor="photos">Slike (opciono)</Label>
                <RequestPhotosEditor photos={photos} onChange={(p) => setValue("photos", p)} />
                <p className="text-xs text-slate-500">Ako pomažu da se posao bolje razumije.</p>
              </div>
            </div>

            {/* Korak 3 — kontakt */}
            <div className={cn("space-y-4 sm:space-y-5", step !== 3 && "hidden")} aria-hidden={step !== 3}>
              <h3 className="font-display text-base font-bold text-brand-navy md:text-lg">Kontakt</h3>
              <div className="space-y-2">
                <Label htmlFor="requesterName">Vaše ime *</Label>
                <Input
                  id="requesterName"
                  placeholder="Ime"
                  autoComplete="name"
                  className="min-h-[52px] text-base"
                  {...register("requesterName")}
                />
                {errors.requesterName && (
                  <p className="text-sm text-destructive">{errors.requesterName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="requesterPhone">Telefon *</Label>
                <Input
                  id="requesterPhone"
                  type="tel"
                  placeholder="+382 69 123 456"
                  autoComplete="tel"
                  className="min-h-[52px] text-base"
                  {...register("requesterPhone")}
                />
                {errors.requesterPhone && (
                  <p className="text-sm text-destructive">{errors.requesterPhone.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="requesterViberPhone">Viber broj</Label>
                  <Input
                    id="requesterViberPhone"
                    type="tel"
                    placeholder="Opciono"
                    autoComplete="tel"
                    className="min-h-[48px] text-base"
                    {...register("requesterViberPhone")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requesterWhatsappPhone">WhatsApp broj</Label>
                  <Input
                    id="requesterWhatsappPhone"
                    type="tel"
                    placeholder="Opciono"
                    autoComplete="tel"
                    className="min-h-[48px] text-base"
                    {...register("requesterWhatsappPhone")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requesterEmail">Email (opciono)</Label>
                <Input
                  id="requesterEmail"
                  type="email"
                  placeholder="Opciono"
                  autoComplete="email"
                  className="min-h-[52px] text-base"
                  {...register("requesterEmail")}
                />
                {errors.requesterEmail && (
                  <p className="text-sm text-destructive">{errors.requesterEmail.message}</p>
                )}
              </div>

              <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
                Nakon slanja: kratki admin pregled, zatim ponude ako odobre. Vi birate da li i koga angažujete.
              </p>
            </div>

            {/* Desktop navigacija */}
            <div className="mt-2 hidden items-stretch gap-3 md:flex">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={navDisabled}
                  className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-4 text-base font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
                  data-testid="create-request-back"
                >
                  Nazad
                </button>
              ) : (
                <span className="flex-1" aria-hidden />
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => void handleNext()}
                  disabled={navDisabled}
                  className="btn-primary inline-flex min-h-[52px] flex-[2] items-center justify-center px-6 disabled:opacity-50"
                  data-testid="create-request-next"
                >
                  Nastavi
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={navDisabled}
                  className="btn-primary inline-flex min-h-[52px] flex-[2] items-center justify-center disabled:opacity-50"
                  data-testid="create-request-submit"
                >
                  {mutation.isPending ? "Šaljem zahtjev..." : "Pošalji zahtjev"}
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Mobilni sticky — Nazad + Nastavi / Pošalji */}
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#E2E8F0] bg-[rgba(255,255,255,0.94)] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-sticky backdrop-blur-[16px] md:hidden">
        <div className="flex gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={navDisabled}
              className={stickySecondaryClass}
              data-testid="create-request-back"
            >
              Nazad
            </button>
          ) : null}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => void handleNext()}
              disabled={navDisabled}
              className={cn(stickyPrimaryClass, step === 1 && "w-full flex-none")}
              data-testid="create-request-next"
            >
              Nastavi
            </button>
          ) : (
            <button
              type="submit"
              form="create-request-form"
              disabled={navDisabled}
              className={cn(stickyPrimaryClass, "flex-1")}
              data-testid="create-request-submit"
            >
              {mutation.isPending ? "Šaljem zahtjev..." : "Pošalji zahtjev"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
