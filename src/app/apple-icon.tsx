import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#050505",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          width: "100%",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 148,
            height: 148,
            border: "2px solid rgba(255,255,255,0.16)",
            borderRadius: 36,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
          }}
        >
          <div
            style={{
              width: 64,
              height: 46,
              border: "5px solid #ffffff",
              borderRadius: 12,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                border: "5px solid #ffffff",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -10,
                right: 10,
                width: 18,
                height: 6,
                borderRadius: 999,
                background: "#ffffff",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: 1,
            }}
          >
            FOTO
          </div>
          <div
            style={{
              fontSize: 15,
              marginTop: 4,
              letterSpacing: 2,
              opacity: 0.92,
            }}
          >
            PLANNER
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}