/* Author Intelligence — Brand mark + wordmark
   Two-disc "AI" / overlapping circles motif, evoking insight + flow.
   Renders inline so it can take currentColor + accent props. */

const AILogoMark = ({ size = 28, accent = "var(--mv-brand)", accent2 = "var(--mv-pink)" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flex: "none" }}>
    <circle cx="12" cy="16" r="9" fill={accent} />
    <circle cx="20" cy="16" r="9" fill={accent2} style={{ mixBlendMode: "multiply" }} />
    <circle cx="16" cy="16" r="3.2" fill="#fff" />
  </svg>
);

const AILogoLockup = ({ size = 22, color = "var(--mv-text)", accent, accent2, sub }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
    <AILogoMark size={size + 8} accent={accent} accent2={accent2} />
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <div style={{ fontFamily: "var(--mv-font-display)", fontWeight: 700, fontSize: size, letterSpacing: "-0.02em", color }}>
        Author<span style={{ color: accent || "var(--mv-brand)" }}>Intelligence</span>
      </div>
      {sub ? (
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--mv-text-subtle)", marginTop: 4 }}>
          {sub}
        </div>
      ) : null}
    </div>
  </div>
);

/* Compact glyph-only version for tight spaces */
const AIGlyph = ({ size = 22, accent = "var(--mv-brand)", accent2 = "var(--mv-pink)" }) => (
  <AILogoMark size={size} accent={accent} accent2={accent2} />
);

Object.assign(window, { AILogoMark, AILogoLockup, AIGlyph });
