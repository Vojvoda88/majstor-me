import { ImageResponse } from "next/og";

/** Mala favikon za tab / adresnu traku — čitljiva na 16px (za razliku od skaliranja cjelokupnog PWA artwork-a). */
export const runtime = "edge";
export const size = { width: 48, height: 48 };
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
          background: "linear-gradient(145deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%)",
          borderRadius: 12,
          color: "#ffffff",
          fontSize: 30,
          fontWeight: 800,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          letterSpacing: "-0.06em",
          lineHeight: 1,
        }}
      >
        B
      </div>
    ),
    {
      ...size,
    }
  );
}
