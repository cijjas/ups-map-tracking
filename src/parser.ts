import {
  ParsedActivity,
  UpsActivity,
  UpsMilestone,
  UpsTrackDetail,
  UpsTrackPayload,
} from './types';

const formatGmtTimestamp = (a: UpsActivity): string | undefined => {
  const d = a.gmtDate;
  const t = a.gmtTime;
  const o = a.gmtOffset;
  if (!d || !t) return undefined;
  if (!/^\d{8}$/.test(d)) return undefined;
  const iso = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${t}${o ?? 'Z'}`;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? iso : undefined;
};

const parseLocalToTimestamp = (
  date?: string,
  time?: string,
): string | undefined => {
  if (!date) return undefined;
  // date like "04/15/2026", time like "12:10 P.M."
  const dm = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dm) return undefined;
  const [, mm, dd, yyyy] = dm;
  let hh = 0;
  let mn = 0;
  if (time) {
    const tm = time.match(/^(\d{1,2}):(\d{2})\s*(A\.?M\.?|P\.?M\.?)?$/i);
    if (tm) {
      hh = parseInt(tm[1], 10) % 12;
      mn = parseInt(tm[2], 10);
      if (tm[3] && /p/i.test(tm[3])) hh += 12;
    }
  }
  const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(mn).padStart(2, '0')}:00`;
  return Number.isFinite(Date.parse(iso)) ? iso : undefined;
};

const sortStable = <T>(
  arr: T[],
  key: (item: T, index: number) => number | undefined,
): T[] => {
  const indexed = arr.map((item, i) => ({
    item,
    i,
    k: key(item, i) ?? Number.NaN,
  }));
  indexed.sort((a, b) => {
    const aHas = !Number.isNaN(a.k);
    const bHas = !Number.isNaN(b.k);
    if (aHas && bHas) return a.k - b.k || a.i - b.i;
    if (aHas) return -1;
    if (bHas) return 1;
    return a.i - b.i;
  });
  return indexed.map((x) => x.item);
};

const fromActivities = (
  activities: UpsActivity[],
  currentLocation?: string,
): ParsedActivity[] => {
  const filtered = activities.filter(
    (a) => typeof a.location === 'string' && a.location.trim().length > 0,
  );
  const withTs = filtered.map((a) => {
    const ts = formatGmtTimestamp(a) ?? parseLocalToTimestamp(a.date, a.time);
    return { a, ts };
  });
  const sorted = sortStable(withTs, (x) =>
    x.ts ? Date.parse(x.ts) : undefined,
  );
  return sorted.map(({ a, ts }) => ({
    rawLocation: a.location!.trim(),
    date: a.date,
    time: a.time,
    timestamp: ts,
    status: a.activityScan || a.milestoneName?.name,
    isCurrent:
      !!currentLocation && a.location?.trim() === currentLocation.trim(),
  }));
};

const fromMilestones = (
  milestones: UpsMilestone[],
  currentLocation?: string,
): ParsedActivity[] => {
  const filtered = milestones.filter(
    (m) => typeof m.location === 'string' && m.location.trim().length > 0,
  );
  const withTs = filtered.map((m) => ({
    m,
    ts: parseLocalToTimestamp(m.date, m.time),
  }));
  const sorted = sortStable(withTs, (x) =>
    x.ts ? Date.parse(x.ts) : undefined,
  );
  return sorted.map(({ m, ts }) => ({
    rawLocation: m.location!.trim(),
    date: m.date,
    time: m.time,
    timestamp: ts,
    status: m.name,
    isCurrent:
      !!m.isCurrent ||
      (!!currentLocation && m.location?.trim() === currentLocation.trim()),
  }));
};

// A "country-only" location string has no comma — e.g. "United States".
// These come from pre-pickup label-creation events and aren't real route
// stops, so we strip them off the front of the list. We only strip leading
// entries; if a country-only scan appears mid-route we keep it.
const dropLeadingCountryOnly = (items: ParsedActivity[]): ParsedActivity[] => {
  let i = 0;
  while (i < items.length && !items[i].rawLocation.includes(',')) i++;
  return i === 0 ? items : items.slice(i);
};

// Collapse consecutive identical locations into the most recent activity at
// that location (so the route reads as one node per stop rather than a stack
// of arrival/departure scans for the same city).
const dedupeConsecutive = (items: ParsedActivity[]): ParsedActivity[] => {
  const out: ParsedActivity[] = [];
  for (const item of items) {
    const prev = out[out.length - 1];
    if (prev && prev.rawLocation.toLowerCase() === item.rawLocation.toLowerCase()) {
      out[out.length - 1] = {
        ...item,
        isCurrent: prev.isCurrent || item.isCurrent,
      };
    } else {
      out.push(item);
    }
  }
  return out;
};

export const parseTrackingPayload = (
  payload: UpsTrackPayload,
): ParsedActivity[] => {
  const detail: UpsTrackDetail | undefined = payload.trackDetails?.[0];
  if (!detail) return [];
  const currentLocation = detail.currentMilestone?.location?.trim() || '';
  let activities: ParsedActivity[] = [];
  if (Array.isArray(detail.shipmentProgressActivities) && detail.shipmentProgressActivities.length > 0) {
    activities = fromActivities(detail.shipmentProgressActivities, currentLocation);
  } else if (Array.isArray(detail.milestones) && detail.milestones.length > 0) {
    activities = fromMilestones(detail.milestones, currentLocation);
  }
  const deduped = dedupeConsecutive(dropLeadingCountryOnly(activities));
  if (deduped.length > 0 && currentLocation) {
    // Ensure exactly one isCurrent flag — the latest matching stop.
    let lastIdx = -1;
    deduped.forEach((p, i) => {
      if (p.rawLocation.toLowerCase() === currentLocation.toLowerCase()) lastIdx = i;
    });
    deduped.forEach((p, i) => (p.isCurrent = i === lastIdx));
  } else if (deduped.length > 0) {
    deduped[deduped.length - 1].isCurrent = true;
  }
  return deduped;
};
