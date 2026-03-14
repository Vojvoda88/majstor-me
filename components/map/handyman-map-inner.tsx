"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { HandymanMapItem } from "./handyman-map-view";
import { DEFAULT_COORDS, getCityCoords } from "@/lib/cities";
import "leaflet/dist/leaflet.css";

function FitBounds({ handymen }: { handymen: HandymanMapItem[] }) {
  const map = useMap();
  if (handymen.length === 0) return null;
  const bounds = L.latLngBounds(
    handymen.map((h) => [h.lat!, h.lng!] as [number, number])
  );
  map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
  return null;
}

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  handymen: HandymanMapItem[];
  city?: string | null;
  className?: string;
};

export function HandymanMapInner({ handymen, city, className = "" }: Props) {
  const center = city ? getCityCoords(city) : DEFAULT_COORDS;

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 ${className}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={8}
        className="h-64 w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds handymen={handymen} />
        {handymen.map((h) => (
          <Marker
            key={h.id}
            position={[h.lat!, h.lng!]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-slate-900">{h.name ?? "Majstor"}</p>
                <p className="text-sm text-slate-600">
                  {h.categories[0] ?? "Usluge"}
                  {h.city && ` • ${h.city}`}
                </p>
                <p className="text-sm text-amber-600">
                  ★ {h.ratingAvg.toFixed(1)} ({h.reviewCount} recenzija)
                </p>
                <Link
                  href={`/handyman/${h.id}`}
                  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  Pogledaj profil →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
