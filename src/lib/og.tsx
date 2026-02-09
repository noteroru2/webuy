// src/lib/og.tsx – OG UI helper for next/og (no edge runtime)
import React from "react";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const FONT_STACK =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Thai", "Noto Sans", sans-serif';

export type OgViewOptions = {
  /** Optional label above title (e.g. "SERVICE", "PRICE") */
  label?: string;
  /** Optional chips/pills below subtitle */
  chips?: string[];
  /** Footer right text (default: "WEBUY HUB") */
  footerRight?: string;
  /** Footer left: show URL or custom text */
  footerLeft?: string;
};

/**
 * Renders the shared OG card UI: gradient background, title, optional subtitle and chips.
 * Use with renderOgImage() to get ImageResponse.
 */
export function ogView(
  title: string,
  subtitle?: string,
  options: OgViewOptions = {}
) {
  const {
    label,
    chips = [],
    footerRight = "WEBUY HUB",
    footerLeft,
  } = options;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background:
          "linear-gradient(135deg, #0b1220 0%, #111827 60%, #0b1220 100%)",
        color: "white",
        fontFamily: FONT_STACK,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 0.3 }}>
          WEBUY HUB
        </div>
        <div style={{ fontSize: 18, opacity: 0.9 }}>LINE: @webuy</div>
      </div>

      {/* Main */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {label && (
          <div
            style={{
              fontSize: 22,
              opacity: 0.85,
              fontWeight: 800,
            }}
          >
            {label}
          </div>
        )}
        <div
          style={{
            fontSize: label ? 60 : 72,
            fontWeight: 900,
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 26,
              opacity: 0.92,
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        )}
        {chips.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 4,
              flexWrap: "wrap",
            }}
          >
            {chips.map((x) => (
              <div
                key={x}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {x}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 18,
          opacity: 0.75,
        }}
      >
        <div>{footerLeft ?? ""}</div>
        <div>{footerRight}</div>
      </div>
    </div>
  );
}

/**
 * Returns ImageResponse for OG image. Uses Node runtime (no edge) for SSG compatibility.
 */
export function renderOgImage(
  title: string,
  subtitle?: string,
  options: OgViewOptions = {}
): ImageResponse {
  return new ImageResponse(ogView(title, subtitle, options), {
    ...OG_SIZE,
  });
}

/** Clamp text for OG (single line, no overflow). */
export function clampText(s: unknown, maxLen: number): string {
  const t = String(s ?? "").trim().replace(/\s+/g, " ");
  if (!t) return "";
  return t.length > maxLen ? t.slice(0, maxLen - 1).trimEnd() + "…" : t;
}
