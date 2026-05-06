import { ImageResponse } from "next/og";

export const alt = "Speaker Intelligence — Mindvalley";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GLYPH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 20 20" fill="none">
  <circle cx="6" cy="10" r="1.6" fill="#fff"/>
  <path d="M9.5 6.5a4.6 4.6 0 0 1 0 7" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.95"/>
  <path d="M12.5 4a8 8 0 0 1 0 12" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
  <path d="M15.5 1.8a11.4 11.4 0 0 1 0 16.4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/>
</svg>`;

const glyphDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(GLYPH_SVG)}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b0a14",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            marginBottom: 56,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 56,
              background: "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)",
              boxShadow: "0 12px 48px rgba(168,85,247,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={glyphDataUri} width={120} height={120} alt="" />
          </div>
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
          }}
        >
          Speaker Intelligence
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#a8a4c0",
            marginTop: 20,
            letterSpacing: "-0.005em",
          }}
        >
          Cross-author performance & financial overview · Mindvalley
        </div>
      </div>
    ),
    { ...size },
  );
}
