"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CREDIT_PACKAGES } from "@/lib/credit-packages";

type Props = {
  defaultFullName: string;
  defaultPhone: string;
  defaultCity: string;
  supportEmail: string;
  supportPhone: string | null;
};

export function CashActivationForm({
  defaultFullName,
  defaultPhone,
  defaultCity,
  supportEmail,
  supportPhone,
}: Props) {
  const [fullName, setFullName] = useState(defaultFullName);
  const [phone, setPhone] = useState(defaultPhone);
  const [city, setCity] = useState(defaultCity);
  const [packageId, setPackageId] = useState(CREDIT_PACKAGES[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"" | "kes" | "posta">("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/handyman/credits/cash-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName,
          phone,
          city,
          packageId,
          paymentMethod: paymentMethod === "" ? undefined : paymentMethod,
          note: note.trim() || undefined,
        }),
      });
      let data: { ok?: boolean; error?: string } = {};
      try {
        data = (await res.json()) as { ok?: boolean; error?: string };
      } catch {
        setError(
          res.ok
            ? "Neočekivan odgovor servera. Pokušajte ponovo."
            : "Server greška (provjerite migracije baze). Pokušajte ponovo."
        );
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Slanje nije uspjelo. Pokušajte ponovo.");
        return;
      }
      setDone(true);
    } catch {
      setError("Greška pri slanju. Pokušajte ponovo.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-6 text-sm leading-relaxed text-emerald-950 shadow-sm">
        <p className="font-semibold text-emerald-900">Zahtjev je poslat.</p>
        <p className="mt-2">
          Naš tim obrađuje zahtjev ručno — javićemo vam se na telefon ili email vezan za nalog, radi dogovora o uplati i
          aktivaciji. Krediti se dodaju na nalog tek nakon što uplata bude potvrđena.
        </p>
        <p className="mt-3 text-sm">
          Za hitna pitanja:{" "}
          <a href={`mailto:${supportEmail}`} className="font-medium text-emerald-900 underline underline-offset-2">
            {supportEmail}
          </a>
          {supportPhone ? <span className="text-emerald-950"> · {supportPhone}</span> : null}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/handyman/credits">Nazad na kredite</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="ca-fullName">Ime i prezime</Label>
        <Input
          id="ca-fullName"
          name="fullName"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={200}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ca-phone">Telefon</Label>
        <Input
          id="ca-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={40}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ca-city">Grad</Label>
        <Input
          id="ca-city"
          name="city"
          autoComplete="address-level2"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          maxLength={120}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ca-package">Paket</Label>
        <select
          id="ca-package"
          name="packageId"
          required
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {CREDIT_PACKAGES.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.label} — {pkg.priceEur.toFixed(2)} €
            </option>
          ))}
        </select>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-900">Način uplate (opciono)</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "kes"}
              onChange={() => setPaymentMethod("kes")}
              className="h-4 w-4"
            />
            Keš
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "posta"}
              onChange={() => setPaymentMethod("posta")}
              className="h-4 w-4"
            />
            Pošta Crne Gore
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === ""}
              onChange={() => setPaymentMethod("")}
              className="h-4 w-4"
            />
            Još ne znam
          </label>
        </div>
      </fieldset>
      <div className="space-y-2">
        <Label htmlFor="ca-note">Napomena (opciono)</Label>
        <Textarea
          id="ca-note"
          name="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={2000}
          placeholder="Npr. kada možete biti na vezi, ili dodatni kontakt."
        />
      </div>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} size="lg" className="w-full sm:w-auto">
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Šaljem…
          </>
        ) : (
          "Pošalji zahtjev za aktivaciju"
        )}
      </Button>
    </form>
  );
}
