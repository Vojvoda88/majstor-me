/**
 * OG / Twitter — isti brend kao `PublicHeader`: worker ikona + BrziMajstor.ME (boje kao na početnoj).
 * Naslov/podnaslov iz `seo-brand` (isto što hero).
 */
import type { ReactElement } from "react";

/** Tailwind `amber-300` — `.ME` na tamnoj traci kao u headeru (homeTheme). */
const ME_COLOR = "#fcd34d";
const NAME_COLOR = "#f1f5f9";

type Props = {
  /** data:image/png;base64,... worker-cutout */
  markDataUrl: string;
  headline: string;
  subline: string;
  footerTag: string;
};

export function OgShareCard({ markDataUrl, headline, subline, footerTag }: Props): ReactElement {
  /* PNG 299×384 — u headeru ~34px visine; ovdje malo veće za čitljivost */
  const markH = 68;
  const markW = Math.round((299 / 384) * markH);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "44px 52px 48px",
        background: "linear-gradient(145deg, #0a1628 0%, #111f36 42%, #1e3a8f 88%)",
        color: "#F8FAFC",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 18,
        }}
      >
        <img src={markDataUrl} width={markW} height={markH} alt="" />
        <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline" }}>
          <span
            style={{
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: -0.6,
              color: NAME_COLOR,
            }}
          >
            BrziMajstor
          </span>
          <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: -0.6, color: ME_COLOR }}>.ME</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          flex: 1,
          justifyContent: "center",
          paddingTop: 6,
          paddingBottom: 4,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.08,
            maxWidth: 1060,
            letterSpacing: -0.8,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: 25,
            lineHeight: 1.42,
            maxWidth: 1080,
            opacity: 0.94,
            fontWeight: 500,
          }}
        >
          {subline}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 20,
          opacity: 0.9,
          fontWeight: 600,
          maxWidth: 1040,
          lineHeight: 1.35,
        }}
      >
        <div
          style={{
            width: 11,
            height: 11,
            borderRadius: 9999,
            background: "#34D399",
            flexShrink: 0,
          }}
        />
        {footerTag}
      </div>
    </div>
  );
}
