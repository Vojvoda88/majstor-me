import { ImageResponse } from "next/og";

/** Mala favikon za tab / adresnu traku — pojednostavljena verzija brend ikone čitljiva na 16px. */
export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 14,
        }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="3" y="3" width="58" height="58" rx="14" fill="#FFFFFF" />
          <path d="M15 27L32 13L49 27" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 27V47C19 49 20.6 51 23 51H32V23L19 27Z" fill="#0F2E63" />
          <path d="M45 27V47C45 49 43.4 51 41 51H32V23L45 27Z" fill="#2563EB" />
          <path d="M37 22L27 38H33L29 51L43 32H37L46 22H37Z" fill="#F59E0B" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
