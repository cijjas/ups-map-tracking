// Geocodes raw UPS location strings via Nominatim. Caches every result
// (success and miss) in chrome.storage.local keyed by the raw string so the
// same place is never resolved twice. Requests are serialised through a
// 1.1s gap to respect Nominatim's published usage policy.

const CACHE_KEY_PREFIX = 'ups-route-map:geocode:';
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const MIN_GAP_MS = 1100;

export type GeocodeHit = { lat: number; lon: number } | null;

type CacheEntry = { hit: GeocodeHit; resolvedAt: number };

const memCache = new Map<string, GeocodeHit>();

const cacheKey = (loc: string) =>
  `${CACHE_KEY_PREFIX}${loc.trim().toLowerCase()}`;

const readCache = async (loc: string): Promise<GeocodeHit | undefined> => {
  if (memCache.has(loc)) return memCache.get(loc);
  const k = cacheKey(loc);
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(k, (items) => {
        const entry = items?.[k] as CacheEntry | undefined;
        if (entry && typeof entry === 'object') {
          memCache.set(loc, entry.hit);
          resolve(entry.hit);
        } else {
          resolve(undefined);
        }
      });
    } catch {
      resolve(undefined);
    }
  });
};

const writeCache = async (loc: string, hit: GeocodeHit): Promise<void> => {
  memCache.set(loc, hit);
  const k = cacheKey(loc);
  return new Promise((resolve) => {
    try {
      chrome.storage.local.set(
        { [k]: { hit, resolvedAt: Date.now() } satisfies CacheEntry },
        () => resolve(),
      );
    } catch {
      resolve();
    }
  });
};

let queue: Promise<void> = Promise.resolve();
let lastFetchAt = 0;

const fetchNominatim = async (loc: string): Promise<GeocodeHit> => {
  const wait = Math.max(0, lastFetchAt + MIN_GAP_MS - Date.now());
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastFetchAt = Date.now();
  const url = `${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(loc)}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
    const top = data?.[0];
    if (!top?.lat || !top?.lon) return null;
    const lat = parseFloat(top.lat);
    const lon = parseFloat(top.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  } catch {
    return null;
  }
};

export const geocode = async (loc: string): Promise<GeocodeHit> => {
  const trimmed = loc.trim();
  if (!trimmed) return null;
  const cached = await readCache(trimmed);
  if (cached !== undefined) return cached;
  // Serialise: each call adds itself to the queue and only the head fetches.
  let resolveOuter!: (v: GeocodeHit) => void;
  const outer = new Promise<GeocodeHit>((r) => (resolveOuter = r));
  queue = queue.then(async () => {
    // Re-check cache in case a concurrent call already wrote it.
    const again = await readCache(trimmed);
    if (again !== undefined) {
      resolveOuter(again);
      return;
    }
    const hit = await fetchNominatim(trimmed);
    await writeCache(trimmed, hit);
    resolveOuter(hit);
  });
  return outer;
};
