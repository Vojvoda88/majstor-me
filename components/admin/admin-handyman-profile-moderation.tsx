"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { shouldUnoptimizeNextImage } from "@/lib/next-image-unoptimized";

type Reason = "PHONE_NUMBER" | "INAPPROPRIATE_CONTENT";

export function AdminHandymanProfileModeration({
  handymanId,
  initialBio,
  avatarUrl: initialAvatarUrl,
  galleryImages: initialGallery,
}: {
  handymanId: string;
  initialBio: string | null;
  avatarUrl: string | null;
  galleryImages: readonly string[];
}) {
  const router = useRouter();
  const [bio, setBio] = useState(initialBio ?? "");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [galleryRemove, setGalleryRemove] = useState<Set<string>>(() => new Set());
  const [reason, setReason] = useState<Reason>("PHONE_NUMBER");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const gallerySig = initialGallery.join("|");
  useEffect(() => {
    setBio(initialBio ?? "");
    setRemoveAvatar(false);
    setGalleryRemove(new Set());
    setError(null);
    setOk(null);
  }, [initialBio, initialAvatarUrl, gallerySig]);

  const avatarEffective = removeAvatar ? null : initialAvatarUrl;

  const bioTrimInitial = (initialBio ?? "").trim();
  const bioChanged = bio.trim() !== bioTrimInitial;
  const avatarChanged = removeAvatar && !!initialAvatarUrl;
  const galleryChanged = galleryRemove.size > 0;
  const hasChanges = bioChanged || avatarChanged || galleryChanged;

  const toggleGalleryRemove = (url: string) => {
    setGalleryRemove((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!hasChanges) {
      setError("Nema izmjena za snimanje.");
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        reason,
        sendEmail,
      };
      if (bioChanged) {
        body.bio = bio;
      }
      if (avatarChanged) {
        body.removeAvatar = true;
      }
      if (galleryRemove.size > 0) {
        body.removeGalleryUrls = Array.from(galleryRemove);
      }

      const res = await fetch(`/api/admin/handymen/${handymanId}/profile-moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Snimanje nije uspjelo.");
      }
      setOk("Profil je ažuriran; majstor je dobio obavještenje u aplikaciji" + (sendEmail ? " i email." : "."));
      setRemoveAvatar(false);
      setGalleryRemove(new Set());
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Moderacija profila (opis i slike)</CardTitle>
        <p className="text-sm text-[#64748B]">
          Izmijenite opis ili uklonite fotografije koje krše pravila. Majstor dobija obavještenje u aplikaciji s pristojnim
          objašnjenjem; opciono i email.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="admin-hp-bio">Opis profila (bio)</Label>
            <Textarea
              id="admin-hp-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
              className="min-h-[120px] resize-y text-sm"
              placeholder="Opis koji će biti sačuvan na profilu…"
            />
            <p className="text-xs text-[#64748B]">
              Uklonite brojeve telefona ili neprimjeren tekst, zatim sačuvajte. Prazan opis briše bio polje.
            </p>
          </div>

          {(initialAvatarUrl || initialGallery.length > 0) && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-800">Fotografije</p>
              {initialAvatarUrl && (
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-600">Profilna</p>
                    <div className="relative h-28 w-28 overflow-hidden rounded-2xl border bg-slate-100 opacity-100">
                      {avatarEffective ? (
                        <Image
                          src={avatarEffective}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="112px"
                          unoptimized={shouldUnoptimizeNextImage(avatarEffective)}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-500">Uklonjeno</div>
                      )}
                    </div>
                  </div>
                  {!removeAvatar ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => setRemoveAvatar(true)}>
                      Ukloni profilnu
                    </Button>
                  ) : (
                    <Button type="button" variant="secondary" size="sm" onClick={() => setRemoveAvatar(false)}>
                      Poništi uklanjanje profilne
                    </Button>
                  )}
                </div>
              )}

              {initialGallery.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-600">Galerija radova</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {initialGallery.map((url, idx) => {
                      const marked = galleryRemove.has(url);
                      return (
                        <div
                          key={`${url}-${idx}`}
                          className={`relative overflow-hidden rounded-xl border bg-slate-100 ${marked ? "ring-2 ring-amber-500" : ""}`}
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative block aspect-square"
                          >
                            <Image
                              src={url}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="240px"
                              unoptimized={shouldUnoptimizeNextImage(url)}
                            />
                          </a>
                          <div className="border-t border-slate-200 bg-white/95 p-2">
                            <Button
                              type="button"
                              variant={marked ? "secondary" : "outline"}
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => toggleGalleryRemove(url)}
                            >
                              {marked ? "Vrati na profil (odustani)" : "Označi za uklanjanje"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Razlog izmjene (u poruci majstoru)</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="mod-reason"
                  checked={reason === "PHONE_NUMBER"}
                  onChange={() => setReason("PHONE_NUMBER")}
                />
                Kontakt / broj telefona u opisu ili slici
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="mod-reason"
                  checked={reason === "INAPPROPRIATE_CONTENT"}
                  onChange={() => setReason("INAPPROPRIATE_CONTENT")}
                />
                Neprimjeren sadržaj
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            Pošalji istu poruku i na email majstora
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {ok && <p className="text-sm text-emerald-700">{ok}</p>}

          <Button type="submit" disabled={loading || !hasChanges}>
            {loading ? "Snimanje…" : "Sačuvaj izmjene i pošalji obavještenje"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
