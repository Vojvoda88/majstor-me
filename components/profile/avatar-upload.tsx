"use client";

import { useState, useRef } from "react";
import { Camera, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";

type AvatarUploadProps = {
  currentUrl: string | null;
  onChange: (url: string | null) => void;
  userName?: string | null;
};

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = MAX_IMAGE_SIZE_BYTES / (1024 * 1024);

/** Uskladiti s API: neki telefoni šalju prazan type ili `application/octet-stream`. */
function isLikelyUploadableImage(file: File) {
  const t = (file.type || "").toLowerCase();
  if (!t || t === "application/octet-stream") return true;
  if (t === "image/jpg" || t === "image/pjpeg") return true;
  return VALID_TYPES.includes(t);
}

export function AvatarUpload({
  currentUrl,
  onChange,
  userName,
}: AvatarUploadProps) {
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadAvailable, setUploadAvailable] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials =
    userName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!VALID_TYPES.includes(file.type)) {
      setError("Dozvoljeni formati: JPEG, PNG, WebP.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`Maksimalna veličina ${MAX_SIZE_MB}MB.`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("type", "avatar");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Upload nije uspio.");
        if (data.uploadAvailable === false) setUploadAvailable(false);
      }
    } catch {
      setError("Greška pri uploadu.");
    } finally {
      setUploading(false);
    }
  };

  const addByUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      onChange(trimmed);
      setUrlInput("");
    } catch {
      setError("Neispravan URL.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const removeAvatar = () => onChange(null);

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/pjpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-blue-100">
          {currentUrl ? (
            <img
              src={currentUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-blue-600">
              {initials}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="min-h-[44px] touch-manipulation"
              onClick={() => {
                void checkUpload();
                fileInputRef.current?.click();
              }}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <span className="ml-2">Slikaj / odaberi sliku</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeAvatar}
              disabled={!currentUrl}
            >
              Ukloni
            </Button>
          </div>
          <details className="rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-2 text-sm">
            <summary className="cursor-pointer font-medium text-slate-700">Ili URL slike</summary>
            <div className="mt-2 flex gap-2">
              <Input
                type="url"
                placeholder="https://..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addByUrl())}
                className="flex-1 text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={addByUrl}>
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
          </details>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {uploadAvailable === false && (
        <p className="text-xs text-amber-700">
          Upload nije konfigurisan. Koristite URL slike.
        </p>
      )}
    </div>
  );
}
