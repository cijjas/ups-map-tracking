import { AbsoluteFill, Easing, interpolate } from "remotion";

const FONT = '"Helvetica Neue", Arial, sans-serif';

export const EndCard: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [340, 356], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [340, 356], [12, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (opacity <= 0) return null;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          textAlign: "center",
          fontFamily: FONT,
          background: "rgba(255,255,255,0.92)",
          padding: "20px 36px",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(10, 20, 40, 0.18)",
          border: "1px solid #e1e4ea",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            fontSize: 34,
            fontWeight: 800,
            color: "#1f2937",
            letterSpacing: 0.2,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#0a8080",
            }}
          />
          Simple UPS Route Map
        </div>
      </div>
    </AbsoluteFill>
  );
};
