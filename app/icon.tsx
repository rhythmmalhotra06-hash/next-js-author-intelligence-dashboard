import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const GLYPH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 20 20" fill="none">
  <circle cx="6" cy="10" r="1.6" fill="#fff"/>
  <path d="M9.5 6.5a4.6 4.6 0 0 1 0 7" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.95"/>
  <path d="M12.5 4a8 8 0 0 1 0 12" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
  <path d="M15.5 1.8a11.4 11.4 0 0 1 0 16.4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/>
</svg>`;

const glyphDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(GLYPH_SVG)}`;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={glyphDataUri} width={40} height={40} alt="" />
      </div>
    ),
    { ...size },
  );
}
