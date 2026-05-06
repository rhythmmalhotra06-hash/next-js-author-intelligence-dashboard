import React from "react";

type Props = {
  size?: number;
  radius?: number;
  shadow?: boolean;
};

export function BrandMark({ size = 32, radius, shadow = true }: Props) {
  const r = radius ?? Math.round(size * 0.3125);
  const glyph = Math.round(size * 0.625);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)",
        boxShadow: shadow ? "0 2px 8px rgba(168,85,247,0.2)" : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={glyph}
        height={glyph}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="6" cy="10" r="1.6" fill="#fff" />
        <path d="M9.5 6.5a4.6 4.6 0 0 1 0 7" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.95" />
        <path d="M12.5 4a8 8 0 0 1 0 12" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        <path d="M15.5 1.8a11.4 11.4 0 0 1 0 16.4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
      </svg>
    </div>
  );
}
