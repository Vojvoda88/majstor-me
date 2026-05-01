import { ImageResponse } from "next/og";
import { getSiteUrl } from "@/lib/site-url";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "BrziMajstor.ME - Majstori u Crnoj Gori";
const siteUrl = getSiteUrl().replace(/\/$/, "");

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "linear-gradient(135deg, #0F172A 0%, #1E293B 45%, #2563EB 100%)",
          color: "#F8FAFC",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 0.2,
            opacity: 0.95,
          }}
        >
          <img
            src={`${siteUrl}/brand/brzimajstor-logo-icon-user.png`}
            width={56}
            height={56}
            alt=""
          />
          <span>BrziMajstor.ME</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.06, maxWidth: 980 }}>
            Majstori u Crnoj Gori
          </div>
          <div style={{ fontSize: 30, opacity: 0.9, maxWidth: 1040 }}>
            Zahtjevi za majstore u Crnoj Gori. Besplatno za korisnike.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, opacity: 0.9 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              background: "#22C55E",
            }}
          />
          Besplatna objava zahtjeva
        </div>
      </div>
    ),
    size
  );
}
