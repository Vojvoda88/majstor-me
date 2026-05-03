/**
 * OG / Twitter preview — hero naslov/podnaslov iz `seo-brand`, logo iz diska (data URL).
 */
import type { ReactElement } from "react";

type Props = {
  /** data:image/png;base64,... */
  logoDataUrl: string;
  headline: string;
  subline: string;
  footerTag: string;
};

export function OgShareCard({ logoDataUrl, headline, subline, footerTag }: Props): ReactElement {
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
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <img src={logoDataUrl} width={280} height={75} alt="" />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          flex: 1,
          justifyContent: "center",
          paddingTop: 8,
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
