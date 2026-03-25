import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
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
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 420,
            height: 420,
            border: "2px solid rgba(255,255,255,0.16)",
            borderRadius: 72,
            background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
          }}
        >
          <div
            style={{
              fontSize: 46,
              letterSpacing: 18,
              marginBottom: 18,
              opacity: 0.92,
            }}
          >
            FOTO
          </div>
          <div
            style={{
              width: 180,
              height: 128,
              border: "10px solid #ffffff",
              borderRadius: 24,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 30,
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                border: "10px solid #ffffff",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -22,
                right: 24,
                width: 54,
                height: 18,
                borderRadius: 999,
                background: "#ffffff",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: 2,
              lineHeight: 1,
            }}
          >
            FOTOGRAFARTE
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 5,
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