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
          "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
          <h3 className="text-lg font-semibold text-slate-900">Filteri</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Zatvori"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] sm:p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Grad</label>
            <select
              value={cityFilter}
              onChange={(e) => onCityChange(e.target.value)}
              className="input-premium select-premium"
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
            <label className="mb-2 block text-sm font-medium text-gray-700">Sortiraj</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "rating" | "reviews")}
              className="min-h-[48px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
            >
              <option value="rating">Po ocjeni</option>
              <option value="reviews">Po broju recenzija</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Prikaz</label>
            <div className="flex min-h-[48px] rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="h-5 w-5" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("map")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  viewMode === "map" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <MapPin className="h-5 w-5" />
                Mapa
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Brzi linkovi</p>
            <div className="flex flex-wrap gap-2">
              {HOMEPAGE_CITIES.slice(0, 6).map((c) => (
                <Link
                  key={c.slug}
                  href={`/${slug}-${c.slug}`}
                  onClick={onClose}
                  className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
          >
            Primijeni
          </button>
        </div>
      </div>
    </>
  );
}
