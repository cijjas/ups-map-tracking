import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { UpsPage } from "./UpsPage";

export const MyComposition: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const cycleProgress = frame / (durationInFrames - 1);

	const introIn = interpolate(frame, [0, 86], [0, 1], {
		easing: Easing.bezier(0.2, 0.8, 0.2, 1),
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const introOut = interpolate(frame, [222, durationInFrames - 1], [0, 1], {
		easing: Easing.bezier(0.4, 0, 0.2, 1),
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const introProgress = introIn * (1 - introOut);

	const liftIn = interpolate(frame, [78, 142], [0, 1], {
		easing: Easing.bezier(0.16, 1, 0.3, 1),
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const liftOut = interpolate(frame, [214, durationInFrames - 1], [0, 1], {
		easing: Easing.bezier(0.4, 0, 0.2, 1),
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const liftProgress = liftIn * (1 - liftOut);

	const dimIn = interpolate(frame, [82, 126], [0, 1], {
		easing: Easing.bezier(0.32, 0, 0.18, 1),
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const dimOut = interpolate(frame, [208, durationInFrames - 1], [0, 1], {
		easing: Easing.bezier(0.4, 0, 0.2, 1),
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const dimProgress = dimIn * (1 - dimOut);

	const routeTravelProgress = interpolate(frame, [92, 186, durationInFrames - 1], [0.04, 1, 0.04], {
		easing: Easing.bezier(0.28, 0.1, 0.18, 1),
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const travelerVisibility = interpolate(frame, [82, 120, 214, durationInFrames - 1], [0, 1, 1, 0], {
		easing: Easing.bezier(0.32, 0, 0.18, 1),
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const travelerPathProgress =
		0.04 + (routeTravelProgress - 0.04) * travelerVisibility;

	const glowWave = 0.5 + 0.5 * Math.sin(cycleProgress * Math.PI * 6);
	const routeGlow = (0.15 + glowWave * 0.85) * dimProgress;

	const pulseWave = 0.5 + 0.5 * Math.sin(cycleProgress * Math.PI * 8);
	const endpointPulse = pulseWave * travelerVisibility;
	const floatOffset = Math.sin(cycleProgress * Math.PI * 2) * 6;

	return (
		<AbsoluteFill
			style={{
				background:
					"radial-gradient(circle at 18% 12%, #ffffff 0%, #eef3f9 36%, #dde6f1 72%, #d5deea 100%)",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: -120,
					background:
						"radial-gradient(circle at 78% 18%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 22%, rgba(255,255,255,0) 48%)",
				}}
			/>
			<div
				style={{
					position: "absolute",
					width: 520,
					height: 520,
					left: -80,
					top: 420,
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(255,255,255,0.74) 0%, rgba(215,225,238,0.12) 54%, rgba(215,225,238,0) 76%)",
					filter: "blur(18px)",
				}}
			/>
			<div
				style={{
					position: "absolute",
					width: 820,
					height: 820,
					right: -180,
					top: -180,
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(255,255,255,0.96) 0%, rgba(240,245,251,0.36) 42%, rgba(240,245,251,0) 72%)",
					filter: "blur(28px)",
				}}
			/>
			<UpsPage
				introProgress={introProgress}
				liftProgress={liftProgress}
				dimProgress={dimProgress}
				travelerProgress={travelerPathProgress}
				routeGlow={routeGlow}
				endpointPulse={endpointPulse}
				floatOffset={floatOffset}
			/>
		</AbsoluteFill>
	);
};
