import { AbsoluteFill, Easing, interpolate } from "remotion";
import { RouteMap, ROUTE_POINTS } from "./RouteMap";

const FONT = '"Helvetica Neue", Arial, sans-serif';

type Props = {
  frame: number;
  openProgress: number;
  revealProgress: number;
  pulseIntensity: number;
  showCurrentLabel: number;
};

export const Overlay: React.FC<Props> = ({
  frame,
  openProgress,
  revealProgress,
  pulseIntensity,
  showCurrentLabel,
}) => {
  const backdropOpacity = openProgress * 0.55;
  const cardScale = 0.94 + 0.06 * openProgress;
  const cardOpacity = openProgress;

  const titleOpacity = interpolate(frame, [140, 170], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * openProgress;

  const mapOpacity = interpolate(frame, [170, 210], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * openProgress;

  const current = ROUTE_POINTS[ROUTE_POINTS.length - 1];

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: "#0b1220",
          opacity: backdropOpacity,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: cardOpacity,
        }}
      >
        <div
          style={{
            width: 1480,
            height: 820,
            background: "#ffffff",
            borderRadius: 20,
            boxShadow: "0 30px 80px rgba(7, 12, 25, 0.35)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            transform: `scale(${cardScale})`,
            transformOrigin: "center",
            fontFamily: FONT,
          }}
        >
          <div
            style={{
              padding: "22px 32px",
              borderBottom: "1px solid #eef0f3",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: titleOpacity,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#0a8080",
                }}
              />
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#1f2937",
                  letterSpacing: 0.2,
                }}
              >
                View Package Route
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  fontWeight: 600,
                  marginLeft: 4,
                }}
              >
                · {ROUTE_POINTS.length} stops
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#9aa0a8",
                fontWeight: 600,
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              UPS Route Map
            </div>
          </div>

          <div style={{ position: "relative", flex: 1 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: mapOpacity,
              }}
            >
	              <RouteMap
	                glowIntensity={revealProgress}
	                travelerProgress={revealProgress}
	                endpointPulse={pulseIntensity}
	                mapWidth={640}
	                mapHeight={320}
	              />
            </div>

            <CurrentLabel
              opacity={showCurrentLabel}
              label={current.label}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CurrentLabel: React.FC<{ opacity: number; label: string }> = ({
  opacity,
  label,
}) => {
  if (opacity <= 0) return null;
  const translateY = (1 - opacity) * 8;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 36,
        transform: `translate(-50%, ${translateY}px)`,
        background: "#ffffff",
        border: "1px solid #f2c94c",
        boxShadow: "0 10px 30px rgba(255, 196, 0, 0.22)",
        borderRadius: 999,
        padding: "10px 18px",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: FONT,
        opacity,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#ffc400",
          boxShadow: "0 0 0 4px rgba(255, 196, 0, 0.28)",
        }}
      />
      <span style={{ fontSize: 14, fontWeight: 700, color: "#4a3500" }}>
        Current Location
      </span>
      <span style={{ fontSize: 14, color: "#4a4d52", fontWeight: 500 }}>
        · {label}
      </span>
    </div>
  );
};
