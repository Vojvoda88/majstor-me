"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Copy, Check } from "lucide-react";

const schema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
}).refine((d) => (d.email && d.email.length > 0) || (d.phone && d.phone.length >= 6), {
  message: "Unesite email ili telefon (min. 6 cifara)",
});

type FormData = z.infer<typeof schema>;

export function InviteHandymanForm({ requestId }: { requestId?: string }) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", phone: "" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setInviteLink(null);
    try {
      const res = await fetch("/api/invite-handyman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email || undefined,
          phone: data.phone || undefined,
          requestId: requestId || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Greška");
        return;
      }
      setInviteLink(json.data?.inviteLink ?? null);
    } catch {
      setError("Greška pri slanju");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Pozovi majstora
        </CardTitle>
        <CardDescription>
          Pošaljite link majstoru da se registruje na BrziMajstor.ME. Ako unesete email, možemo ga obavijestiti (kada je email servis spreman).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <Label htmlFor="email">Email (opciono)</Label>
            <Input
              id="email"
              type="email"
              placeholder="majstor@primjer.me"
              {...register("email")}
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefon (opciono)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="069 123 456"
              {...register("phone")}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Šaljem..." : "Pošalji poziv"}
          </Button>
        </form>
        {inviteLink && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Link za majstora:</p>
            <p className="mb-2 break-all text-xs text-slate-600">{inviteLink}</p>
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? " Kopirano!" : " Kopiraj link"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
