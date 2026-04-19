import {Img, interpolate, staticFile} from "remotion";
import {ROUTE_POINTS, RouteMap} from "./RouteMap";

const FONT =
	'"SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';
const UPS_BROWN = "#3b2418";
const UPS_GOLD = "#f4b300";
const TEAL = "#1a7d83";
const UPS_LOGO = staticFile("logo.svg");

const ROUTE_STAGES = [
	{
		label: "Ventura, CA",
		status: "Picked up",
		meta: "Apr 17, 08:05",
		isCurrent: false,
	},
	{
		label: "Los Angeles, CA",
		status: "Departed origin",
		meta: "Apr 17, 14:22",
		isCurrent: false,
	},
	{
		label: "Louisville, KY",
		status: "Hub sort",
		meta: "Apr 18, 20:10",
		isCurrent: false,
	},
	{
		label: "Miami, FL",
		status: "Departed facility",
		meta: "Apr 19, 09:42",
		isCurrent: true,
	},
	{
		label: "Madrid, ES",
		status: "Arrival scan pending",
		meta: "Estimated Apr 20",
		isCurrent: false,
	},
] as const;

type Props = {
	introProgress: number;
	liftProgress: number;
	dimProgress: number;
	travelerProgress: number;
	routeGlow: number;
	endpointPulse: number;
	floatOffset: number;
};

export const UpsPage: React.FC<Props> = ({
	introProgress,
	liftProgress,
	dimProgress,
	travelerProgress,
	routeGlow,
	endpointPulse,
	floatOffset,
}) => {
	const browserScale = interpolate(introProgress, [0, 1], [0.79, 1.02], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const browserTranslateY = interpolate(introProgress, [0, 1], [34, -56], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const browserTranslateX = interpolate(introProgress, [0, 1], [-10, 18], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const browserRotateX = interpolate(introProgress, [0, 1], [13, 6.5], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const browserRotateY = interpolate(introProgress, [0, 1], [-15, -6], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const browserRotateZ = interpolate(introProgress, [0, 1], [-3.4, -0.9], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const contentScrollY = interpolate(liftProgress, [0, 0.34, 1], [0, -78, -118], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				perspective: 2400,
				perspectiveOrigin: "50% 44%",
				fontFamily: FONT,
			}}
		>
			<div
				style={{
					width: 1440,
					height: 860,
					borderRadius: 34,
					overflow: "hidden",
					background: "#f4f5f7",
					border: "1px solid rgba(255,255,255,0.94)",
					boxShadow:
						"0 60px 160px rgba(18, 32, 54, 0.24), 0 16px 36px rgba(18, 32, 54, 0.12)",
					transform: `translate3d(${browserTranslateX}px, ${browserTranslateY + floatOffset}px, 0px) rotateX(${browserRotateX - dimProgress * 1.2}deg) rotateY(${browserRotateY + dimProgress * 2.8}deg) rotateZ(${browserRotateZ + dimProgress * 0.5}deg) scale(${browserScale})`,
					transformStyle: "preserve-3d",
				}}
			>
				<BrowserChrome />
				<UpsHeader />
				<div
					style={{
						position: "relative",
						height: 738,
						background:
							"linear-gradient(180deg, #f7f8fb 0%, #f1f3f7 58%, #edf0f4 100%)",
						overflow: "hidden",
					}}
				>
					<div
						style={{
							position: "absolute",
							inset: 0,
							background:
								"radial-gradient(circle at 18% 0%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0) 42%)",
						}}
					/>

						<div
							style={{
								position: "absolute",
								inset: 0,
								transform: `translateY(${contentScrollY + dimProgress * 12}px)`,
								filter: `blur(${dimProgress * 4}px) saturate(${1 - dimProgress * 0.18})`,
								opacity: 1 - dimProgress * 0.24,
							}}
						>
						<div style={{position: "absolute", left: 52, top: 34, width: 1256}}>
							<OverviewCard />
						</div>
						<div style={{position: "absolute", left: 52, top: 220, width: 1256}}>
							<JourneyStrip />
						</div>
						<div
							style={{
								position: "absolute",
								left: 52,
								top: 664,
								width: 1256,
								height: 1,
								background:
									"linear-gradient(90deg, rgba(215,222,232,0) 0%, rgba(215,222,232,0.9) 14%, rgba(215,222,232,0.9) 86%, rgba(215,222,232,0) 100%)",
							}}
						/>
					</div>

					<div
						style={{
							position: "absolute",
							inset: 0,
							background: `rgba(14, 20, 32, ${dimProgress * 0.16})`,
						}}
					/>

					<div style={{position: "absolute", left: 52, top: 316, width: 1256}}>
						<PackageRouteCard
							liftProgress={liftProgress}
							travelerProgress={travelerProgress}
							routeGlow={routeGlow}
							endpointPulse={endpointPulse}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

const BrowserChrome: React.FC = () => {
	return (
		<div
			style={{
				height: 48,
				padding: "0 20px",
				display: "flex",
				alignItems: "center",
				gap: 14,
				background: "rgba(243, 245, 248, 0.96)",
				borderBottom: "1px solid rgba(206, 213, 223, 0.92)",
			}}
		>
			<div style={{display: "flex", gap: 8}}>
				{["#ff5f57", "#febc2e", "#28c840"].map((color) => (
					<div
						key={color}
						style={{
							width: 12,
							height: 12,
							borderRadius: "50%",
							background: color,
						}}
					/>
				))}
			</div>
			<div
				style={{
					flex: 1,
					height: 30,
					borderRadius: 999,
					background: "rgba(255,255,255,0.92)",
					border: "1px solid rgba(214, 220, 228, 1)",
					display: "flex",
					alignItems: "center",
					padding: "0 14px",
					fontSize: 13,
					color: "#5d6777",
					letterSpacing: 0.1,
				}}
			>
				<span style={{marginRight: 8, opacity: 0.46}}>lock</span>
				ups.com/track?tracknum=1Z999AA10123456784
			</div>
		</div>
	);
};

const UpsHeader: React.FC = () => {
	return (
		<div
			style={{
				height: 74,
				background: UPS_BROWN,
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: "0 34px",
				color: "#ffffff",
			}}
		>
			<div style={{display: "flex", alignItems: "center", gap: 22}}>
				<Img
					src={UPS_LOGO}
					alt="UPS"
					style={{
						width: 44,
						height: 52,
						objectFit: "contain",
						filter: "drop-shadow(0 10px 18px rgba(0, 0, 0, 0.18))",
					}}
				/>
				<div style={{display: "flex", gap: 24, fontSize: 15, opacity: 0.82}}>
					<span>Shipping</span>
					<span>Tracking</span>
					<span>Support</span>
					<span>Business</span>
				</div>
			</div>
			<div
				style={{
					padding: "8px 14px",
					borderRadius: 999,
					background: "rgba(255,255,255,0.08)",
					fontSize: 13,
					fontWeight: 700,
					letterSpacing: 0.4,
					textTransform: "uppercase",
				}}
			>
				In transit
			</div>
		</div>
	);
};

const OverviewCard: React.FC = () => {
	return (
		<div
			style={{
				background: "rgba(255,255,255,0.95)",
				border: "1px solid rgba(224, 228, 235, 1)",
				borderRadius: 28,
				padding: "30px 34px",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "flex-start",
				boxShadow: "0 10px 30px rgba(16, 24, 40, 0.04)",
			}}
		>
			<div>
				<div
					style={{
						fontSize: 12,
						fontWeight: 700,
						textTransform: "uppercase",
						letterSpacing: 1.2,
						color: "#7d8796",
					}}
				>
					Tracking number
				</div>
				<div
					style={{
						marginTop: 10,
						fontSize: 38,
						lineHeight: 1,
						fontWeight: 700,
						color: "#1a2433",
						letterSpacing: -0.9,
					}}
				>
					1Z 999 AA1 01 2345 6784
				</div>
				<div
					style={{
						marginTop: 16,
						display: "flex",
						alignItems: "center",
						gap: 12,
						color: "#5c6677",
						fontSize: 16,
					}}
				>
					<span>Expected delivery</span>
					<span style={{fontWeight: 700, color: UPS_BROWN}}>Monday, April 20</span>
					<span
						style={{
							padding: "6px 12px",
							borderRadius: 999,
							background: "#eef7ef",
							color: "#2d6a3a",
							fontWeight: 700,
							fontSize: 13,
						}}
					>
						On schedule
					</span>
				</div>
			</div>
			<div style={{display: "flex", gap: 14}}>
				<MetaPill label="Origin" value="Ventura, CA" />
				<MetaPill label="Current" value="Miami, FL" />
				<MetaPill label="Destination" value="Madrid, ES" />
			</div>
		</div>
	);
};

const MetaPill: React.FC<{label: string; value: string}> = ({label, value}) => {
	return (
		<div
			style={{
				width: 156,
				padding: "14px 16px",
				borderRadius: 20,
				background: "#f6f8fb",
				border: "1px solid rgba(229, 233, 239, 1)",
			}}
		>
			<div
				style={{
					fontSize: 11,
					textTransform: "uppercase",
					letterSpacing: 1,
					fontWeight: 700,
					color: "#8b94a3",
				}}
			>
				{label}
			</div>
			<div
				style={{
					marginTop: 6,
					fontSize: 15,
					fontWeight: 700,
					color: "#1f2937",
				}}
			>
				{value}
			</div>
		</div>
	);
};

const JourneyStrip: React.FC = () => {
	return (
		<div
			style={{
				background: "rgba(255,255,255,0.93)",
				border: "1px solid rgba(224, 228, 235, 1)",
				borderRadius: 24,
				padding: "18px 22px",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				boxShadow: "0 8px 24px rgba(16, 24, 40, 0.03)",
			}}
		>
			<div style={{display: "flex", alignItems: "center", gap: 24}}>
				<JourneyBadge title="Package route" value="Live view available" accent />
				<JourneyBadge title="Stops" value="5 checkpoints" />
				<JourneyBadge title="Current" value="Miami, FL" />
			</div>
			<div style={{display: "flex", alignItems: "center", gap: 16}}>
				<div
					style={{
						width: 220,
						height: 6,
						borderRadius: 999,
						background: "linear-gradient(90deg, #1a7d83 0%, #f4b300 66%, #dce3eb 66%, #dce3eb 100%)",
					}}
				/>
				<div
					style={{
						fontSize: 13,
						fontWeight: 700,
						color: "#6e7786",
						textTransform: "uppercase",
						letterSpacing: 0.5,
					}}
				>
					In transit
				</div>
			</div>
		</div>
	);
};

const JourneyBadge: React.FC<{
	title: string;
	value: string;
	accent?: boolean;
}> = ({title, value, accent = false}) => {
	return (
		<div
			style={{
				padding: "10px 14px",
				borderRadius: 18,
				border: accent
					? "1px solid rgba(26, 125, 131, 0.18)"
					: "1px solid rgba(229, 233, 239, 1)",
				background: accent ? "rgba(26, 125, 131, 0.08)" : "#f8fafc",
				minWidth: accent ? 220 : 170,
			}}
		>
			<div
				style={{
					fontSize: 11,
					fontWeight: 700,
					textTransform: "uppercase",
					letterSpacing: 1,
					color: accent ? "#1a7d83" : "#8b94a3",
				}}
			>
				{title}
			</div>
			<div
				style={{
					marginTop: 5,
					fontSize: 15,
					fontWeight: 700,
					color: "#1f2937",
				}}
			>
				{value}
			</div>
		</div>
	);
};

type PackageRouteCardProps = {
	liftProgress: number;
	travelerProgress: number;
	routeGlow: number;
	endpointPulse: number;
};

const PackageRouteCard: React.FC<PackageRouteCardProps> = ({
	liftProgress,
	travelerProgress,
	routeGlow,
	endpointPulse,
}) => {
	const liftY = interpolate(liftProgress, [0, 1], [0, -92], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const liftZ = interpolate(liftProgress, [0, 1], [0, 200], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const tiltX = interpolate(liftProgress, [0, 1], [0, 4.5], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const tiltY = interpolate(liftProgress, [0, 1], [0, -1.5], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const scale = interpolate(liftProgress, [0, 1], [1, 1.045], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const routePanelHeight = interpolate(liftProgress, [0, 1], [288, 364], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const sidebarWidth = interpolate(liftProgress, [0, 1], [290, 246], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const mapWidth = 1208 - sidebarWidth;

	const origin = ROUTE_POINTS[0];
	const destination = ROUTE_POINTS[ROUTE_POINTS.length - 1];

	return (
		<div
			style={{
				position: "relative",
				borderRadius: 40,
				transformStyle: "preserve-3d",
				transform: `translate3d(0px, ${liftY}px, ${liftZ}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`,
				transformOrigin: "50% 54%",
				filter:
					"drop-shadow(0 24px 46px rgba(16, 24, 40, 0.12)) drop-shadow(0 64px 120px rgba(16, 24, 40, 0.2))",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: 0,
					borderRadius: 36,
					background:
						"radial-gradient(circle at 50% 42%, rgba(255,255,255,0.72) 0%, rgba(86,173,170,0.06) 52%, rgba(86,173,170,0) 76%)",
					filter: "blur(20px)",
					opacity: liftProgress * 0.62,
					transform: "translateZ(-1px)",
				}}
			/>
			<div
				style={{
					background:
						"linear-gradient(180deg, rgba(255,255,255,0.985) 0%, rgba(249,250,252,0.985) 100%)",
					border: "1px solid rgba(223, 228, 236, 0.98)",
					borderRadius: 32,
					padding: "22px 24px 24px",
					boxShadow:
						"0 2px 0 rgba(255,255,255,0.68) inset, 0 18px 42px rgba(16, 24, 40, 0.06)",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						position: "absolute",
						inset: 0,
						background:
							"linear-gradient(140deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0.12) 100%)",
						pointerEvents: "none",
					}}
				/>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: 18,
						position: "relative",
					}}
				>
					<div>
						<div
							style={{
								fontSize: 12,
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: 1.2,
								color: "#7d8796",
							}}
						>
							Package route
						</div>
						<div
							style={{
								marginTop: 8,
								fontSize: 30,
								lineHeight: 1,
								fontWeight: 700,
								letterSpacing: -0.6,
								color: "#1c2736",
							}}
						>
							From {origin.label} to {destination.label}
						</div>
					</div>
					<div style={{display: "flex", alignItems: "center", gap: 12}}>
						<Tag label="5 checkpoints" tone="neutral" />
						<Tag label="Live route" tone="accent" />
					</div>
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: `${mapWidth}px ${sidebarWidth}px`,
						height: routePanelHeight,
						border: "1px solid rgba(226, 231, 238, 1)",
						borderRadius: 28,
						overflow: "hidden",
						position: "relative",
						background: "#ffffff",
					}}
				>
					<div
						style={{
							position: "relative",
							background:
								"linear-gradient(180deg, #f9fbfd 0%, #f3f6f9 100%)",
							borderRight: "1px solid rgba(234, 238, 243, 1)",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								position: "absolute",
								inset: 0,
								background:
									"radial-gradient(circle at 76% 18%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 34%)",
							}}
						/>
						<RouteMap
							glowIntensity={routeGlow}
							travelerProgress={travelerProgress}
							endpointPulse={endpointPulse}
							mapWidth={mapWidth}
							mapHeight={routePanelHeight}
						/>
						<div
							style={{
								position: "absolute",
								left: 18,
								bottom: 18,
								padding: "10px 14px",
								borderRadius: 999,
								border: "1px solid rgba(222, 228, 236, 1)",
								background: "rgba(255,255,255,0.92)",
								backdropFilter: "blur(8px)",
								display: "flex",
								alignItems: "center",
								gap: 14,
								fontSize: 12,
								fontWeight: 700,
								color: "#6e7786",
								textTransform: "uppercase",
								letterSpacing: 0.4,
							}}
						>
							<LegendDot color={TEAL} />
							Origin
							<LegendDot color={UPS_GOLD} />
							Current
							<LegendDot color="#d0d7e1" />
							Destination
						</div>
					</div>
					<RouteSidebar />
				</div>
			</div>
		</div>
	);
};

const LegendDot: React.FC<{color: string}> = ({color}) => {
	return (
		<span
			style={{
				width: 9,
				height: 9,
				borderRadius: "50%",
				background: color,
				boxShadow:
					color === UPS_GOLD ? "0 0 0 4px rgba(244, 179, 0, 0.12)" : "none",
			}}
		/>
	);
};

const RouteSidebar: React.FC = () => {
	return (
		<div
			style={{
				background: "#fafbfc",
				padding: "16px 16px 14px",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div
				style={{
					fontSize: 11,
					fontWeight: 700,
					textTransform: "uppercase",
					letterSpacing: 0.9,
					color: "#7d8796",
					marginBottom: 10,
				}}
			>
				Route (5 stops)
			</div>
			<div style={{display: "flex", flexDirection: "column"}}>
				{ROUTE_STAGES.map((stage, index) => (
					<RouteStopItem
						key={stage.label}
						index={index + 1}
						label={stage.label}
						status={stage.status}
						meta={stage.meta}
						isCurrent={stage.isCurrent}
						isFirst={index === 0}
					/>
				))}
			</div>
		</div>
	);
};

const RouteStopItem: React.FC<{
	index: number;
	label: string;
	status: string;
	meta: string;
	isCurrent: boolean;
	isFirst: boolean;
}> = ({index, label, status, meta, isCurrent, isFirst}) => {
	return (
		<div
			style={{
				display: "flex",
				gap: 12,
				padding: "12px 0",
				borderTop: isFirst ? "none" : "1px dashed rgba(225, 228, 234, 1)",
			}}
		>
			<div
				style={{
					width: 22,
					height: 22,
					borderRadius: "50%",
					background: isCurrent ? UPS_GOLD : TEAL,
					color: isCurrent ? "#4a3500" : "#ffffff",
					fontSize: 11,
					fontWeight: 800,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
					boxShadow: isCurrent ? "0 0 0 5px rgba(244, 179, 0, 0.12)" : "none",
				}}
			>
				{index}
			</div>
			<div style={{minWidth: 0}}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						fontSize: 15,
						fontWeight: 700,
						color: "#243041",
					}}
				>
					{label}
					{isCurrent ? <CurrentTag /> : null}
				</div>
				<div
					style={{
						marginTop: 4,
						fontSize: 13,
						fontWeight: 600,
						color: "#4f5a6a",
					}}
				>
					{status}
				</div>
				<div style={{marginTop: 4, fontSize: 12, color: "#7d8796"}}>{meta}</div>
			</div>
		</div>
	);
};

const CurrentTag: React.FC = () => {
	return (
		<span
			style={{
				padding: "2px 7px",
				borderRadius: 999,
				background: "#fff4d1",
				color: "#8b6400",
				fontSize: 10,
				fontWeight: 800,
				textTransform: "uppercase",
				letterSpacing: 0.5,
			}}
		>
			Current
		</span>
	);
};

const Tag: React.FC<{label: string; tone: "accent" | "neutral"}> = ({
	label,
	tone,
}) => {
	return (
		<div
			style={{
				padding: "8px 14px",
				borderRadius: 999,
				fontSize: 13,
				fontWeight: 700,
				letterSpacing: 0.2,
				background:
					tone === "accent"
						? "rgba(26, 125, 131, 0.12)"
						: "rgba(244, 246, 249, 1)",
				color: tone === "accent" ? TEAL : "#6b7484",
				border:
					tone === "accent"
						? "1px solid rgba(26, 125, 131, 0.18)"
						: "1px solid rgba(229, 233, 239, 1)",
			}}
		>
			{label}
		</div>
	);
};
