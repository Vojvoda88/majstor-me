"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, List, MapPin } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  cityFilter: string;
  onCityChange: (v: string) => void;
  sortBy: "rating" | "reviews";
  onSortChange: (v: "rating" | "reviews") => void;
  viewMode: "list" | "map";
  onViewModeChange: (v: "list" | "map") => void;
  slug: string;
};

export function MobileFilterSheet({
  open,
  onClose,
  cityFilter,
  onCityChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  slug,
}: Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-xl border-t border-[#E5E7EB] bg-white shadow-[0_-16px_48px_rgba(15,23,42,0.12)] transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E7EDF5] bg-white px-5 py-5">
          <h3 className="text-[20px] font-semibold text-[#0F172A]">Filteri</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            aria-label="Zatvori"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-6 p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]">
          <div>
            <label className="mb-3 block text-[16px] font-semibold text-[#0F172A]">Grad</label>
            <select
              value={cityFilter}
              onChange={(e) => onCityChange(e.target.value)}
              className="h-14 w-full rounded-2xl border border-[#DCE6F2] bg-[#F8FBFF] px-4 text-[16px] text-[#0F172A]"
            >
              <option value="">Svi gradovi</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-3 block text-[16px] font-semibold text-[#0F172A]">Sortiraj</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "rating" | "reviews")}
              className="h-14 w-full rounded-2xl border border-[#DCE6F2] bg-[#F8FBFF] px-4 text-[16px] text-[#0F172A]"
            >
              <option value="rating">Po ocjeni</option>
              <option value="reviews">Po broju recenzija</option>
            </select>
          </div>
          <div>
            <label className="mb-3 block text-[16px] font-semibold text-[#0F172A]">Prikaz</label>
            <div className="flex h-14 overflow-hidden rounded-2xl border border-[#DCE6F2] bg-[#F8FBFF] p-1">
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                className={`flex flex-1 items-center justify-center gap-2 text-[15px] font-medium transition ${
                  viewMode === "list"
                    ? "rounded-xl bg-[#2563EB] text-white"
                    : "text-[#475569] hover:bg-white"
                }`}
              >
                <List className="h-5 w-5" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("map")}
                className={`flex flex-1 items-center justify-center gap-2 text-[15px] font-medium transition ${
                  viewMode === "map"
                    ? "rounded-xl bg-[#2563EB] text-white"
                    : "text-[#475569] hover:bg-white"
                }`}
              >
                <MapPin className="h-5 w-5" />
                Mapa
              </button>
            </div>
          </div>
          <div>
            <label className="mb-3 block text-[16px] font-semibold text-[#0F172A]">Brzi gradovi</label>
            <div className="flex flex-wrap gap-3">
              {HOMEPAGE_CITIES.slice(0, 8).map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${slug}?city=${encodeURIComponent(c.name)}`}
                  onClick={onClose}
                  className={`rounded-full border px-4 py-2.5 text-[15px] font-medium transition ${
                    cityFilter === c.name
                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                      : "border-[#DCE6F2] bg-[#F8FBFF] text-[#0F172A] hover:bg-white"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-[#2563EB] py-4 text-[17px] font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
          >
            Primijeni
          </button>
        </div>
      </div>
    </>
  );
}
