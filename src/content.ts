// Isolated-world content script. Receives intercepted UPS payloads from the
// MAIN-world injector via window.postMessage, geocodes the stops, and feeds
// the resulting RoutePoints to the overlay UI.

import { geocode } from './geocoder';
import { RouteMapPanel } from './overlay';
import { parseTrackingPayload } from './parser';
import {
  INTERCEPT_MESSAGE_SOURCE,
  ParsedActivity,
  RoutePoint,
  UpsTrackPayload,
} from './types';

const INSTANCE_FLAG = '__upsRouteMapContentLoaded__';

const labelFor = (raw: string): string => raw;

const buildPoints = async (
  parsed: ParsedActivity[],
  onPartial: (points: RoutePoint[], pending: number) => void,
): Promise<RoutePoint[]> => {
  const points: RoutePoint[] = [];
  // Pre-resolve per unique location to short-circuit repeats inside this batch.
  const unique = new Map<string, ParsedActivity[]>();
  for (const a of parsed) {
    const key = a.rawLocation.toLowerCase();
    const arr = unique.get(key) ?? [];
    arr.push(a);
    unique.set(key, arr);
  }
  let pending = parsed.length;
  // Resolve in parallel through the geocoder's internal queue (which still
  // serialises actual network calls). Cached entries resolve immediately.
  const results = await Promise.all(
    parsed.map(async (a) => ({ a, hit: await geocode(a.rawLocation) })),
  );
  for (const { a, hit } of results) {
    pending -= 1;
    if (!hit) continue;
    points.push({
      rawLocation: a.rawLocation,
      label: labelFor(a.rawLocation),
      lat: hit.lat,
      lon: hit.lon,
      date: a.date,
      time: a.time,
      timestamp: a.timestamp,
      status: a.status,
      isCurrent: a.isCurrent,
    });
    onPartial([...points], Math.max(0, pending));
  }
  return points;
};

const init = async (): Promise<void> => {
  const w = window as unknown as Record<string, unknown>;
  if (w[INSTANCE_FLAG]) return;
  w[INSTANCE_FLAG] = true;

  // Defer overlay mount until DOM exists – we run at document_start.
  const ensureBody = (): Promise<void> =>
    document.body
      ? Promise.resolve()
      : new Promise((resolve) => {
          const obs = new MutationObserver(() => {
            if (document.body) {
              obs.disconnect();
              resolve();
            }
          });
          obs.observe(document.documentElement, { childList: true, subtree: true });
        });
  await ensureBody();

  const overlay = new RouteMapPanel();
  overlay.setData([], 0);

  let token = 0;
  const handlePayload = async (payload: UpsTrackPayload) => {
    const myToken = ++token;
    const parsed = parseTrackingPayload(payload);
    if (parsed.length === 0) return;
    const points = await buildPoints(parsed, (partial, pending) => {
      if (myToken !== token) return;
      overlay.setData(partial, pending);
    });
    if (myToken !== token) return;
    overlay.setData(points, 0);
  };

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data as { source?: string; payload?: UpsTrackPayload };
    if (!data || data.source !== INTERCEPT_MESSAGE_SOURCE) return;
    if (!data.payload) return;
    handlePayload(data.payload).catch(() => {
      /* swallow */
    });
  });
};

init().catch(() => {
  /* swallow */
});
