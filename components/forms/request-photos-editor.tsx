"use client";

import { useState, useRef } from "react";
import { X, Upload, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_IMAGES_PER_REQUEST, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";

type RequestPhotosEditorProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
};

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = MAX_IMAGE_SIZE_BYTES / (1024 * 1024);

export function RequestPhotosEditor({ photos, onChange }: RequestPhotosEditorProps) {
  const [newUrl, setNewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadAvailable, setUploadAvailable] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkUpload = async () => {
    if (uploadAvailable !== null) return;
    try {
      const res = await fetch("/api/upload");
      const data = await res.json();
      setUploadAvailable(data.uploadAvailable === true);
    } catch {
      setUploadAvailable(false);
    }
  };

  const addByUrl = () => {
    const trimmed = newUrl.trim();
    if (!trimmed || photos.length >= MAX_IMAGES_PER_REQUEST) return;
    try {
      new URL(trimmed);
      if (!photos.includes(trimmed)) {
        onChange([...photos, trimmed]);
        setNewUrl("");
      }
    } catch {
      setError("Neispravan URL");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || photos.length >= MAX_IMAGES_PER_REQUEST) return;

    if (!VALID_TYPES.includes(file.type)) {
      setError("Dozvoljeni: JPEG, PNG, WebP.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`Maks. ${MAX_SIZE_MB}MB po slici.`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("type", "request");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.ok && data.url) {
        onChange([...photos, data.url]);
      } else {
        setError(data.error || "Koristite URL.");
        if (data.uploadAvailable === false) setUploadAvailable(false);
      }
    } catch {
      setError("Greška pri uploadu.");
    } finally {
      setUploading(false);
    }
  };

  const remove = (idx: number) => onChange(photos.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="default"
          className="min-h-[48px] w-full touch-manipulation"
          onClick={() => {
            void checkUpload();
            fileInputRef.current?.click();
          }}
          disabled={uploading || photos.length >= MAX_IMAGES_PER_REQUEST}
        >
          <Upload className="mr-2 h-4 w-4 shrink-0" />
          {uploading ? "Šaljem..." : "Dodaj sliku (galerija ili kamera)"}
        </Button>
        <details className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm">
          <summary className="cursor-pointer font-medium text-slate-700">
            Napredno: URL slike
          </summary>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="url"
              placeholder="https://..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addByUrl())}
              className="flex-1 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addByUrl}
              disabled={!newUrl.trim() || photos.length >= MAX_IMAGES_PER_REQUEST}
            >
              <Link2 className="mr-1 h-4 w-4" />
              Dodaj URL
            </Button>
          </div>
        </details>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url, idx) => (
            <div key={`${url}-${idx}`} className="group relative h-20 w-20 overflow-hidden rounded-lg border">
              <img src={url} alt={`Slika ${idx + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-500">
        {photos.length} / {MAX_IMAGES_PER_REQUEST} slika (opciono). Pomažu majstorima da bolje procijene.
      </p>
      <p className="text-xs text-amber-700">
        Ne postavljajte slike koje sadrže broj telefona, email, adresu ili profile na društvenim mrežama.
      </p>
    </div>
  );
}
