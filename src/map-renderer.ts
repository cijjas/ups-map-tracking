import JsVectorMap from './vendor-jsvectormap';
// Side-effect import: registers the world map on the global jsVectorMap set
// up by the bootstrap above. Order matters – do not move this above.
import 'jsvectormap/dist/maps/world.js';
// @ts-expect-error – CSS loaded as text by esbuild plugin
import vectorCss from 'jsvectormap/dist/jsvectormap.css';
import { RoutePoint } from './types';

export const VECTORMAP_CSS = vectorCss as string;

const COLOR_LINE = '#0a8080';
const COLOR_STOP = '#0a8080';
const COLOR_CURRENT = '#ffc400';
const COLOR_REGION_FILL = '#eef0f3';
const COLOR_REGION_STROKE = '#d4d8de';
const COLOR_REGION_HOVER = '#e1e4ea';

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

type Tooltip = { text(value: string, isHtml?: boolean): void };
type MapInstance = {
  destroy: () => void;
  setFocus: (opts: Record<string, unknown>) => void;
};

export class RouteMapRenderer {
  private map: MapInstance | null = null;
  private points: RoutePoint[] = [];
  constructor(private readonly container: HTMLElement) {}

  render(points: RoutePoint[]): void {
    this.destroy();
    this.points = points;
    if (points.length === 0) return;

    const markers = points.map((p, i) => ({
      name: String(i),
      coords: [p.lat, p.lon],
      style: p.isCurrent
        ? {
            initial: {
              fill: COLOR_CURRENT,
              stroke: '#7a5a00',
              strokeWidth: 2,
              r: 9,
            },
            hover: { fill: '#ffd84d', cursor: 'pointer' },
          }
        : {
            initial: {
              fill: COLOR_STOP,
              stroke: '#ffffff',
              strokeWidth: 1.5,
              r: 6,
            },
            hover: { fill: '#0c9b9b', cursor: 'pointer' },
          },
    }));

    const lines: Array<{ from: string; to: string }> = [];
    for (let i = 0; i < points.length - 1; i++) {
      lines.push({ from: String(i), to: String(i + 1) });
    }

    this.map = new JsVectorMap({
      selector: this.container,
      map: 'world',
      backgroundColor: '#ffffff',
      draggable: true,
      zoomOnScroll: true,
      zoomButtons: true,
      zoomMax: 12,
      zoomMin: 1,
      // Disable animation – its setInterval keeps calling _applyTransform on
      // a torn-down map after a re-render, throwing a stream of errors.
      zoomAnimate: false,
      regionStyle: {
        initial: {
          fill: COLOR_REGION_FILL,
          stroke: COLOR_REGION_STROKE,
          strokeWidth: 0.4,
          fillOpacity: 1,
        },
        hover: { fillOpacity: 1, fill: COLOR_REGION_HOVER, cursor: 'grab' },
      },
      markers,
      lines,
      lineStyle: {
        stroke: COLOR_LINE,
        strokeWidth: 2.5,
        strokeOpacity: 0.9,
      },
      markerStyle: {
        initial: {
          fill: COLOR_STOP,
          stroke: '#ffffff',
          strokeWidth: 1.5,
          r: 6,
        },
        hover: { cursor: 'pointer', fill: '#0c9b9b' },
      },
      onMarkerTooltipShow(_event: unknown, tooltip: Tooltip, idx: number) {
        const p = points[idx];
        if (!p) return;
        const head = `<div style="font-weight:700;margin-bottom:2px">${escapeHtml(p.label)}</div>`;
        const status = p.status
          ? `<div style="opacity:.95">${escapeHtml(p.status)}</div>`
          : '';
        const dt =
          p.date || p.time
            ? `<div style="opacity:.75;margin-top:2px">${escapeHtml(p.date ?? '')}${p.time ? ' · ' + escapeHtml(p.time) : ''}</div>`
            : '';
        tooltip.text(
          `<div style="font-size:12px;line-height:1.4;padding:2px 4px">${head}${status}${dt}</div>`,
          true,
        );
      },
    } as Record<string, unknown>) as unknown as MapInstance;

    this.fit();
  }

  fit(): void {
    if (!this.map || this.points.length === 0) return;
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;
    for (const p of this.points) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lon < minLon) minLon = p.lon;
      if (p.lon > maxLon) maxLon = p.lon;
    }
    const lat = (minLat + maxLat) / 2;
    const lon = (minLon + maxLon) / 2;
    const span = Math.max(maxLat - minLat, (maxLon - minLon) / 2, 5);
    const scale = Math.min(6, Math.max(1.1, 90 / span));
    requestAnimationFrame(() => {
      if (!this.map) return;
      try {
        this.map.setFocus({ coords: [lat, lon], scale, animate: false });
      } catch {
        /* swallow */
      }
    });
  }

  destroy(): void {
    if (this.map) {
      try {
        this.map.destroy();
      } catch {
        /* swallow */
      }
      this.map = null;
    }
    this.container.innerHTML = '';
  }
}
