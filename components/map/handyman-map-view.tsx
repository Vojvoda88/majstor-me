"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

export type HandymanMapItem = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
  lat?: number;
  lng?: number;
};

const MapInner = dynamic(
  () => import("./handyman-map-inner").then((m) => m.HandymanMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
        Učitavanje mape...
      </div>
    ),
  }
);

type HandymanMapViewProps = {
  handymen: HandymanMapItem[];
  city?: string | null;
  className?: string;
};

export function HandymanMapView({
  handymen,
  city,
  className = "",
}: HandymanMapViewProps) {
  const withCoords = useMemo(
    () => handymen.filter((h) => h.lat != null && h.lng != null),
    [handymen]
  );

  if (withCoords.length === 0) {
    return (
      <div
        className={`flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 ${className}`}
      >
        Nema majstora sa lokacijom za prikaz na mapi
      </div>
    );
  }

  return (
    <MapInner handymen={withCoords} city={city} className={className} />
  );
}
