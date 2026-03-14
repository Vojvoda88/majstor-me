"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_GALLERY_IMAGES } from "@/lib/constants";

type GalleryEditorProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

export function GalleryEditor({ images, onChange }: GalleryEditorProps) {
  const [newUrl, setNewUrl] = useState("");

  const addImage = () => {
    const trimmed = newUrl.trim();
    if (!trimmed || images.length >= MAX_GALLERY_IMAGES) return;
    try {
      new URL(trimmed);
      if (!images.includes(trimmed)) {
        onChange([...images, trimmed]);
        setNewUrl("");
      }
    } catch {
      // Invalid URL
    }
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://example.com/slika.jpg"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addImage}
          disabled={!newUrl.trim() || images.length >= MAX_GALLERY_IMAGES}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
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
        {images.length} / {MAX_GALLERY_IMAGES} slika. Unesite URL slike.
      </p>
    </div>
  );
}
