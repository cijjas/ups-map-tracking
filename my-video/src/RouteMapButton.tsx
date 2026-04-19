import { Easing, interpolate } from "remotion";

const FONT = '"Helvetica Neue", Arial, sans-serif';

const MapIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 20 3 17V4l6 3" />
    <path d="m9 20 6-3" />
    <path d="m15 17 6 3V7l-6-3" />
    <path d="M9 7v13" />
    <path d="M15 4v13" />
  </svg>
);

type Props = {
  frame: number;
  opacity: number;
};

export const RouteMapButton: React.FC<Props> = ({ frame, opacity }) => {
  const appearScale = interpolate(frame, [60, 80], [0.7, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const clickPulse = interpolate(
    frame,
    [116, 120, 124],
    [1, 0.92, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scale = appearScale * clickPulse;

  return (
    <div
      style={{
        position: "absolute",
        right: 96,
        bottom: 72,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        opacity,
        fontFamily: FONT,
        filter: "drop-shadow(0 12px 32px rgba(10, 128, 128, 0.22))",
      }}
    >
      <button
        style={{
          background: "#0a8080",
          color: "#ffffff",
          border: "none",
          padding: "16px 24px",
          borderRadius: 999,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 0.3,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
        }}
      >
        <MapIcon />
        Route Map
      </button>
    </div>
  );
};
