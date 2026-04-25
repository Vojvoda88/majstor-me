"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type GalleryLightboxProps = {
  images: string[];
};

export function GalleryLightbox({ images }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = () => setActiveIndex(null);
  const showPrev = () => setActiveIndex((prev) => (prev == null ? 0 : (prev - 1 + images.length) % images.length));
  const showNext = () => setActiveIndex((prev) => (prev == null ? 0 : (prev + 1) % images.length));

  useEffect(() => {
    if (activeIndex == null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((url, idx) => (
          <button
            key={`${url}-${idx}`}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className="relative aspect-square overflow-hidden rounded-lg bg-[#F3F4F6] text-left"
            aria-label={`Otvori sliku ${idx + 1}`}
          >
            <Image src={url} alt={`Rad ${idx + 1}`} fill className="object-cover" sizes="200px" />
          </button>
        ))}
      </div>

      {activeIndex != null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-3 sm:p-6">
          <button
            type="button"
            onClick={close}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
            aria-label="Zatvori galeriju"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={showPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 sm:left-4"
            aria-label="Prethodna slika"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="relative h-[78vh] w-full max-w-4xl">
            <Image
              src={images[activeIndex]}
              alt={`Galerija ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          <button
            type="button"
            onClick={showNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 sm:right-4"
            aria-label="Sljedeća slika"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
}
