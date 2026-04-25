"use client";

import { useState, useRef } from "react";
import { X, Upload, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_GALLERY_IMAGES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";

type GalleryEditorProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = MAX_IMAGE_SIZE_BYTES / (1024 * 1024);

export function GalleryEditor({ images, onChange }: GalleryEditorProps) {
  const [newUrl, setNewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingLabel, setUploadingLabel] = useState<string | null>(null);
  const [uploadAvailable, setUploadAvailable] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkUploadAvailability = async () => {
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
    if (!trimmed || images.length >= MAX_GALLERY_IMAGES) return;
    try {
      new URL(trimmed);
      if (!images.includes(trimmed)) {
        onChange([...images, trimmed]);
        setNewUrl("");
      }
    } catch {
      setUploadError("Neispravan URL");
      setTimeout(() => setUploadError(null), 3000);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedFiles = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (pickedFiles.length === 0 || images.length >= MAX_GALLERY_IMAGES) return;

    const remainingSlots = Math.max(0, MAX_GALLERY_IMAGES - images.length);
    const files = pickedFiles.slice(0, remainingSlots);
    const ignoredCount = pickedFiles.length - files.length;

    if (ignoredCount > 0) {
      setUploadError(`Možete dodati još ${remainingSlots} slika. Višak je preskočen.`);
      setTimeout(() => setUploadError(null), 3500);
    }

    const invalidType = files.find((file) => !VALID_TYPES.includes(file.type));
    if (invalidType) {
      setUploadError("Dozvoljeni formati: JPEG, PNG, WebP.");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }
    const oversized = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      setUploadError(`Maksimalna veličina ${MAX_SIZE_MB}MB po slici.`);
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadingLabel(null);
    let nextImages = [...images];
    let successCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadingLabel(`Šaljem sliku ${i + 1} od ${files.length}...`);
        const formData = new FormData();
        formData.set("file", file);
        formData.set("type", "gallery");
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.ok && data.url) {
          nextImages = [...nextImages, data.url];
          onChange(nextImages);
          successCount += 1;
        } else {
          setUploadError(data.error || "Upload nije uspio. Koristite URL.");
          if (data.uploadAvailable === false) setUploadAvailable(false);
          break;
        }
      }

      if (successCount > 0 && successCount < files.length) {
        setUploadError(`Uspješno poslato ${successCount}/${files.length} slika.`);
      } else if (successCount > 0) {
        setUploadError(null);
      }
    } catch {
      setUploadError("Greška pri uploadu.");
    } finally {
      setUploading(false);
      setUploadingLabel(null);
    }
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="default"
          className="min-h-[48px] w-full touch-manipulation"
          onClick={() => {
            void checkUploadAvailability();
            fileInputRef.current?.click();
          }}
          disabled={uploading || images.length >= MAX_GALLERY_IMAGES}
        >
          <Upload className="mr-2 h-4 w-4 shrink-0" />
          {uploading ? uploadingLabel ?? "Šaljem slike..." : "Dodaj slike sa telefona ili galerije"}
        </Button>
        <details className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm">
          <summary className="cursor-pointer font-medium text-slate-700">
            Napredno: unos URL-a slike (ako već imate link)
          </summary>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="url"
              placeholder="https://..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addByUrl())}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={addByUrl}
              disabled={!newUrl.trim() || images.length >= MAX_GALLERY_IMAGES}
            >
              <Link2 className="mr-1 h-4 w-4" />
              Dodaj URL
            </Button>
          </div>
        </details>
      </div>
      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
      {uploadAvailable === false && (
        <p className="text-xs text-amber-700">
          Upload nije konfigurisan. Unesite URL slike.
        </p>
      )}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="group relative aspect-square overflow-hidden rounded-xl border bg-slate-50"
            >
              <img
                src={url}
                alt={`Rad ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-500">
        {images.length} / {MAX_GALLERY_IMAGES} slika. JPEG, PNG, WebP do {MAX_SIZE_MB}MB.
      </p>
    </div>
  );
}
