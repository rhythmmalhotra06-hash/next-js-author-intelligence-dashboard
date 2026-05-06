"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps { text: string; }

const BUBBLE_STYLE: React.CSSProperties = {
  position: "fixed",
  display: "block",
  bottom: "auto",
  width: 240,
  padding: "8px 10px",
  background: "#1e1e2e",
  color: "#fff",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 1.45,
  zIndex: 9999,
  whiteSpace: "normal",
  pointerEvents: "none",
  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
  textAlign: "left",
  textTransform: "none",
  letterSpacing: "normal",
};

export function Tooltip({ text }: TooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function show() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top });
  }

  return (
    <span className="of-tooltip-root">
      <span
        ref={ref}
        className="of-tooltip-trigger"
        aria-label={text}
        onMouseEnter={show}
        onMouseLeave={() => setPos(null)}
      >
        ⓘ
      </span>
      {mounted && pos && createPortal(
        <span
          style={{
            ...BUBBLE_STYLE,
            left: pos.x,
            top: pos.y,
            transform: "translateX(-50%) translateY(calc(-100% - 8px))",
          }}
        >
          {text}
        </span>,
        document.body
      )}
    </span>
  );
}
