import { WORLD_MAP } from "./world-map-data";

const POINTS = [
	{label: "Ventura, CA", lat: 34.2746, lon: -119.229},
	{label: "Los Angeles, CA", lat: 34.0522, lon: -118.2437},
	{label: "Louisville, KY", lat: 38.2527, lon: -85.7585},
	{label: "Miami, FL", lat: 25.7617, lon: -80.1918},
	{label: "Madrid, ES", lat: 40.4168, lon: -3.7038},
];

const COLOR_LINE = "#1a7d83";
const COLOR_LINE_GLOW = "#59d4c6";
const COLOR_STOP = "#1a7d83";
const COLOR_CURRENT = "#f4b300";
const COLOR_REGION_FILL = "#edf1f5";
const COLOR_REGION_STROKE = "#d3dae3";

const R = 6378137;

type RouteView = {
	vbX: number;
	vbY: number;
	vbW: number;
	vbH: number;
};

type RoutePoint = (typeof POINTS)[number] & {
	worldPos: [number, number];
};

type RouteSegment = {
	from: [number, number];
	to: [number, number];
	length: number;
};

const latLngToPx = (lat: number, lng: number): [number, number] => {
	const mx = ((lng * Math.PI) / 180) * R;
	const my = R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));
	const minX = WORLD_MAP.bbox[0].x;
	const maxX = WORLD_MAP.bbox[1].x;
	const minY = WORLD_MAP.bbox[0].y;
	const maxY = WORLD_MAP.bbox[1].y;
	const px = ((mx - minX) / (maxX - minX)) * WORLD_MAP.width;
	const py = ((maxY - my) / (maxY - minY)) * WORLD_MAP.height;
	return [px, py];
};

const getRouteView = (mapWidth: number, mapHeight: number): RouteView => {
	const lats = POINTS.map((point) => point.lat);
	const lons = POINTS.map((point) => point.lon);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const minLon = Math.min(...lons);
	const maxLon = Math.max(...lons);
	const latSpan = maxLat - minLat;
	const lonSpan = maxLon - minLon;
	const northLat = Math.min(74, maxLat + Math.max(12, latSpan * 0.72));
	const southLat = Math.max(-58, minLat - Math.max(18, latSpan * 1.15));
	const westLon = Math.max(-180, minLon - Math.max(18, lonSpan * 0.1));
	const eastLon = Math.min(180, maxLon + Math.max(24, lonSpan * 0.2));
	const focusLat = (northLat + southLat) / 2;
	const focusLon = (westLon + eastLon) / 2;
	const [left] = latLngToPx(focusLat, westLon);
	const [right] = latLngToPx(focusLat, eastLon);
	const [, top] = latLngToPx(northLat, focusLon);
	const [, bottom] = latLngToPx(southLat, focusLon);
	let vbX = left;
	let vbY = top;
	let vbW = right - left;
	let vbH = bottom - top;
	const targetAspect = mapWidth / mapHeight;
	const currentAspect = vbW / vbH;

	if (currentAspect > targetAspect) {
		const desiredHeight = vbW / targetAspect;
		vbY -= (desiredHeight - vbH) / 2;
		vbH = desiredHeight;
	} else {
		const desiredWidth = vbH * targetAspect;
		vbX -= (desiredWidth - vbW) / 2;
		vbW = desiredWidth;
	}

	const centerX = vbX + vbW / 2;
	const centerY = vbY + vbH / 2;
	const zoomOut = 1.18;
	vbW *= zoomOut;
	vbH *= zoomOut;
	vbX = centerX - vbW / 2;
	vbY = centerY - vbH / 2;

	vbX = Math.max(0, Math.min(vbX, WORLD_MAP.width - vbW));
	vbY = Math.max(0, Math.min(vbY, WORLD_MAP.height - vbH));
	return {vbX, vbY, vbW, vbH};
};

type Props = {
	glowIntensity: number;
	travelerProgress: number;
	endpointPulse: number;
	mapWidth: number;
	mapHeight: number;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const getTravelerPosition = (
	progress: number,
	segments: RouteSegment[],
	points: RoutePoint[],
	totalRouteLength: number,
): [number, number] => {
	const clamped = clamp01(progress);
	let remaining = totalRouteLength * clamped;

	for (const segment of segments) {
		if (remaining <= segment.length) {
			const t = segment.length === 0 ? 0 : remaining / segment.length;
			return [
				segment.from[0] + (segment.to[0] - segment.from[0]) * t,
				segment.from[1] + (segment.to[1] - segment.from[1]) * t,
			];
		}

		remaining -= segment.length;
	}

	return points[points.length - 1].worldPos;
};

export const RouteMap: React.FC<Props> = ({
	glowIntensity,
	travelerProgress,
	endpointPulse,
	mapWidth,
	mapHeight,
}) => {
	const view = getRouteView(mapWidth, mapHeight);
	const {vbX, vbY, vbW, vbH} = view;
	const points: RoutePoint[] = POINTS.map((point) => ({
		...point,
		worldPos: latLngToPx(point.lat, point.lon),
	}));
	const segments: RouteSegment[] = points.slice(0, -1).map((point, index) => {
		const from = point.worldPos;
		const to = points[index + 1].worldPos;
		const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
		return {from, to, length};
	});
	const totalRouteLength = segments.reduce(
		(total, segment) => total + segment.length,
		0,
	);
	const backgroundScale = vbW / 1400;
	const worldUnitsPerPixel = Math.max(vbW / mapWidth, vbH / mapHeight);
	const travelerPos = getTravelerPosition(
		travelerProgress,
		segments,
		points,
		totalRouteLength,
	);
	const glowOpacity = 0.1 + glowIntensity * 0.18;
	const travelerVisible = travelerProgress > 0.02;

	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				background:
					"linear-gradient(180deg, rgba(251,253,255,1) 0%, rgba(245,248,251,1) 100%)",
			}}
		>
			<svg
				viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
				preserveAspectRatio="xMidYMid slice"
				style={{width: "100%", height: "100%", display: "block"}}
			>
				<g opacity={0.98}>
					{Object.entries(WORLD_MAP.paths).map(([code, path]) => (
						<path
							key={code}
							d={path.d}
							fill={COLOR_REGION_FILL}
							stroke={COLOR_REGION_FILL}
							strokeWidth={1 * backgroundScale}
							strokeLinejoin="round"
							fillRule="evenodd"
						/>
					))}
					{Object.entries(WORLD_MAP.paths).map(([code, path]) => (
						<path
							key={`outline-${code}`}
							d={path.d}
							fill="none"
							stroke={COLOR_REGION_STROKE}
							strokeWidth={0.6 * backgroundScale}
							strokeLinejoin="round"
							strokeOpacity={0.85}
						/>
					))}
				</g>

				<g>
					{segments.map((segment, index) => (
						<line
							key={`glow-${index}`}
							x1={segment.from[0]}
							y1={segment.from[1]}
							x2={segment.to[0]}
							y2={segment.to[1]}
							stroke={COLOR_LINE_GLOW}
							strokeWidth={14 * worldUnitsPerPixel}
							strokeLinecap="round"
							strokeOpacity={glowOpacity}
						/>
					))}
					{segments.map((segment, index) => (
						<line
							key={`line-${index}`}
							x1={segment.from[0]}
							y1={segment.from[1]}
							x2={segment.to[0]}
							y2={segment.to[1]}
							stroke={COLOR_LINE}
							strokeWidth={5 * worldUnitsPerPixel}
							strokeLinecap="round"
							strokeOpacity={0.96}
						/>
					))}
					{segments.map((segment, index) => (
						<line
							key={`line-highlight-${index}`}
							x1={segment.from[0]}
							y1={segment.from[1]}
							x2={segment.to[0]}
							y2={segment.to[1]}
							stroke={COLOR_LINE_GLOW}
							strokeWidth={7 * worldUnitsPerPixel}
							strokeLinecap="round"
							strokeOpacity={0.06 + glowIntensity * 0.16}
						/>
					))}
				</g>

				<g>
					{points.map((point, index) => {
						const isDestination = index === points.length - 1;
						const isCurrent = index === points.length - 2;
						return (
							<g key={point.label}>
								{isCurrent ? (
									<circle
										cx={point.worldPos[0]}
										cy={point.worldPos[1]}
										r={(14 + endpointPulse * 7) * worldUnitsPerPixel}
										fill={COLOR_CURRENT}
										fillOpacity={0.08 + endpointPulse * 0.08}
									/>
								) : null}
								<circle
									cx={point.worldPos[0]}
									cy={point.worldPos[1]}
									r={(isCurrent || isDestination ? 8 : 6.5) * worldUnitsPerPixel}
									fill={
										isCurrent
											? COLOR_CURRENT
											: isDestination
												? "#d0d7e1"
												: COLOR_STOP
									}
									stroke="#ffffff"
									strokeWidth={3 * worldUnitsPerPixel}
								/>
							</g>
						);
					})}
				</g>

				{travelerVisible ? (
					<g>
						<circle
							cx={travelerPos[0]}
							cy={travelerPos[1]}
							r={18 * worldUnitsPerPixel}
							fill={COLOR_LINE_GLOW}
							fillOpacity={0.12 + glowIntensity * 0.08}
						/>
						<circle
							cx={travelerPos[0]}
							cy={travelerPos[1]}
							r={10.5 * worldUnitsPerPixel}
							fill={COLOR_LINE_GLOW}
							fillOpacity={0.22 + glowIntensity * 0.14}
						/>
						<circle
							cx={travelerPos[0]}
							cy={travelerPos[1]}
							r={4.8 * worldUnitsPerPixel}
							fill="#ffffff"
						/>
					</g>
				) : null}
			</svg>
		</div>
	);
};

export const ROUTE_POINTS = POINTS;
