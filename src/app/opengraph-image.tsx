import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HireVanta — Recruitment & Talent Acquisition";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(1200px 600px at 20% -10%, #241a4d, #05060f)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              border: "2px solid #7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            HV
          </div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>HireVanta</div>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          Great Talent. Better Opportunities. Limitless Possibilities.
        </div>
        <div style={{ marginTop: 28, fontSize: 28, color: "#9ca3af", maxWidth: 820 }}>
          Recruitment & talent acquisition for the companies building the future.
        </div>
      </div>
    ),
    { ...size },
  );
}
