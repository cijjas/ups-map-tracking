import { RouteMapRenderer, VECTORMAP_CSS } from './map-renderer';
import { RoutePoint } from './types';

const HOST_ID = 'ups-route-map-host';

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Inline card-style panel that sits inside the UPS tracking page. Inherits
// the page's font via :host and uses a light theme that matches UPS chrome.
const PANEL_CSS = `
:host {
  all: initial;
  display: block;
  font-family: inherit;
  color: #353535;
  margin: 0 0 16px 0;
}
.card {
  background: #ffffff;
  border: 1px solid #e1e4ea;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(15, 20, 30, .04);
  overflow: hidden;
  font-family: inherit;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #eef0f3;
}
.title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: .1px;
  color: #353535;
}
.subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-left: 8px;
  font-weight: 500;
}
.actions { display: inline-flex; gap: 6px; }
.btn {
  background: #ffffff;
  color: #353535;
  border: 1px solid #d4d8de;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn:hover { background: #f5f6f8; border-color: #b8bdc6; }
.btn.primary { background: #0a8080; color: #ffffff; border-color: #0a8080; }
.btn.primary:hover { background: #0c9b9b; border-color: #0c9b9b; }
.btn svg { width: 14px; height: 14px; }

.body {
  display: grid;
  grid-template-columns: 1fr 280px;
  min-height: 0;
  height: 480px;
}
.body[data-collapsed="true"] { display: none; }
.map {
  position: relative;
  background: #ffffff;
  min-height: 0;
}
.map > div { width: 100%; height: 100%; }

.list {
  border-left: 1px solid #eef0f3;
  overflow-y: auto;
  padding: 12px 14px;
  font-size: 12px;
  background: #fafbfc;
}
.list h3 {
  margin: 0 0 8px 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: #6b7280;
  font-weight: 700;
}
.list ol { margin: 0; padding: 0; list-style: none; counter-reset: stop; }
.list li {
  position: relative;
  padding: 8px 0 8px 28px;
  border-top: 1px dashed #e1e4ea;
  counter-increment: stop;
}
.list li:first-child { border-top: none; }
.list li::before {
  content: counter(stop);
  position: absolute;
  left: 0;
  top: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0a8080;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.list li.current::before { background: #ffc400; color: #4a3500; }
.list .loc { font-weight: 600; color: #353535; }
.list .meta { color: #6b7280; margin-top: 2px; }
.list .status { color: #4a4d52; }
.tag {
  display: inline-block;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #fff4d1;
  color: #6b4f00;
  margin-left: 6px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .4px;
  vertical-align: middle;
}

.empty {
  padding: 24px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
  grid-column: 1 / -1;
}
.empty strong { color: #353535; display: block; margin-bottom: 6px; }

@media (max-width: 720px) {
  .body { grid-template-columns: 1fr; grid-template-rows: 1fr 200px; height: 600px; }
  .list { border-left: none; border-top: 1px solid #eef0f3; }
}

/* jsvectormap zoom buttons – tone them down for the light card. */
.jvm-zoom-btn {
  background: #ffffff !important;
  color: #353535 !important;
  border: 1px solid #d4d8de !important;
  border-radius: 4px !important;
  width: 22px !important;
  height: 22px !important;
  line-height: 20px !important;
  font-size: 14px !important;
  box-shadow: 0 1px 2px rgba(0,0,0,.05) !important;
}
.jvm-zoom-btn:hover { background: #f5f6f8 !important; }
`;

const ICON_REFRAME = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9V5a2 2 0 0 1 2-2h4"/>
  <path d="M21 9V5a2 2 0 0 0-2-2h-4"/>
  <path d="M3 15v4a2 2 0 0 0 2 2h4"/>
  <path d="M21 15v4a2 2 0 0 1-2 2h-4"/>
</svg>
`;
const ICON_COLLAPSE = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m18 15-6-6-6 6"/>
</svg>
`;
const ICON_EXPAND = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m6 9 6 6 6-6"/>
</svg>
`;

type State = {
  points: RoutePoint[];
  pendingCount: number;
  collapsed: boolean;
};

const findHostContainer = (): HTMLElement | null => {
  // Preferred: the card body that wraps the estimated-delivery section.
  const sec = document.getElementById('estimatedDeliverySection');
  if (sec) {
    const card = sec.closest('div.ups-card-body');
    if (card instanceof HTMLElement) return card;
  }
  // Fallback: first ups-card-body on the page.
  const fallback = document.querySelector('div.ups-card-body');
  return fallback instanceof HTMLElement ? fallback : null;
};

export class RouteMapPanel {
  private hostEl: HTMLElement;
  private root: ShadowRoot;
  private renderer!: RouteMapRenderer;
  private bodyEl!: HTMLElement;
  private listEl!: HTMLElement;
  private mapInner!: HTMLElement;
  private collapseBtn!: HTMLButtonElement;
  private subtitle!: HTMLElement;
  private state: State = { points: [], pendingCount: 0, collapsed: false };
  private parentObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    this.hostEl = document.createElement('div');
    this.hostEl.id = HOST_ID;
    this.hostEl.style.all = 'initial';
    this.hostEl.style.display = 'block';
    this.root = this.hostEl.attachShadow({ mode: 'open' });
    this.mountShell();
    this.attachToPage();
  }

  private mountShell(): void {
    const style = document.createElement('style');
    style.textContent = PANEL_CSS + '\n' + VECTORMAP_CSS;
    this.root.appendChild(style);

    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'header';

    const titleWrap = document.createElement('div');
    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = 'Package Route';
    this.subtitle = document.createElement('span');
    this.subtitle.className = 'subtitle';
    this.subtitle.textContent = '';
    titleWrap.appendChild(title);
    titleWrap.appendChild(this.subtitle);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const reframeBtn = document.createElement('button');
    reframeBtn.className = 'btn';
    reframeBtn.type = 'button';
    reframeBtn.title = 'Reframe to fit the route';
    reframeBtn.innerHTML = `${ICON_REFRAME}<span>Reframe</span>`;
    reframeBtn.addEventListener('click', () => this.renderer.fit());

    this.collapseBtn = document.createElement('button');
    this.collapseBtn.className = 'btn';
    this.collapseBtn.type = 'button';
    this.collapseBtn.title = 'Collapse';
    this.collapseBtn.innerHTML = `${ICON_COLLAPSE}<span>Hide</span>`;
    this.collapseBtn.addEventListener('click', () => this.toggleCollapsed());

    actions.appendChild(reframeBtn);
    actions.appendChild(this.collapseBtn);
    header.appendChild(titleWrap);
    header.appendChild(actions);

    this.bodyEl = document.createElement('div');
    this.bodyEl.className = 'body';

    const mapEl = document.createElement('div');
    mapEl.className = 'map';
    this.mapInner = document.createElement('div');
    mapEl.appendChild(this.mapInner);

    this.listEl = document.createElement('div');
    this.listEl.className = 'list';

    this.bodyEl.appendChild(mapEl);
    this.bodyEl.appendChild(this.listEl);

    card.appendChild(header);
    card.appendChild(this.bodyEl);
    this.root.appendChild(card);

    this.renderer = new RouteMapRenderer(this.mapInner);
  }

  private attachToPage(): void {
    const tryMount = () => {
      const card = findHostContainer();
      if (!card) return false;
      // Already attached as the immediate next sibling? Nothing to do.
      if (this.hostEl.parentElement && this.hostEl.previousElementSibling === card) {
        return true;
      }
      card.after(this.hostEl);
      return true;
    };

    if (!tryMount()) {
      const obs = new MutationObserver(() => {
        if (tryMount()) {
          /* keep observing in case Angular re-creates the card */
        }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
      this.parentObserver = obs;
    } else {
      // Even when initially mounted, watch for SPA re-renders that drop us.
      const obs = new MutationObserver(() => {
        if (!document.contains(this.hostEl)) tryMount();
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
      this.parentObserver = obs;
    }

    // Re-fit when the panel is resized (e.g. window resize, layout change).
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (!this.state.collapsed) this.renderer.fit();
      });
      this.resizeObserver.observe(this.mapInner);
    }
  }

  setData(points: RoutePoint[], pendingCount: number): void {
    this.state.points = points;
    this.state.pendingCount = pendingCount;
    this.subtitle.textContent = points.length
      ? `${points.length} stop${points.length === 1 ? '' : 's'}${pendingCount ? ` · ${pendingCount} pending…` : ''}`
      : 'Waiting for tracking data…';
    this.renderList();
    if (!this.state.collapsed) {
      requestAnimationFrame(() => this.renderer.render(points));
    }
  }

  toggleCollapsed(): void {
    this.state.collapsed = !this.state.collapsed;
    this.bodyEl.dataset.collapsed = String(this.state.collapsed);
    this.collapseBtn.innerHTML = this.state.collapsed
      ? `${ICON_EXPAND}<span>Show</span>`
      : `${ICON_COLLAPSE}<span>Hide</span>`;
    if (this.state.collapsed) {
      this.renderer.destroy();
    } else {
      requestAnimationFrame(() => this.renderer.render(this.state.points));
    }
  }

  destroy(): void {
    this.parentObserver?.disconnect();
    this.resizeObserver?.disconnect();
    this.renderer.destroy();
    this.hostEl.remove();
  }

  private renderList(): void {
    const { points, pendingCount } = this.state;
    if (points.length === 0) {
      this.listEl.innerHTML = `<h3>Route</h3><div class="empty"><strong>Waiting for tracking data…</strong>The route will appear here automatically.${pendingCount ? `<br><br><span style="color:#b06b00">${pendingCount} stop(s) pending geocoding…</span>` : ''}</div>`;
      return;
    }
    const items = points
      .map((p) => {
        const dt = [p.date, p.time].filter(Boolean).join(' · ');
        const tag = p.isCurrent ? `<span class="tag">Current</span>` : '';
        return `
          <li class="${p.isCurrent ? 'current' : ''}">
            <div class="loc">${escapeHtml(p.label)}${tag}</div>
            ${p.status ? `<div class="status">${escapeHtml(p.status)}</div>` : ''}
            ${dt ? `<div class="meta">${escapeHtml(dt)}</div>` : ''}
          </li>`;
      })
      .join('');
    const pendingNote = pendingCount
      ? `<div class="empty" style="padding:8px 0;text-align:left;color:#b06b00">${pendingCount} more stop(s) pending geocoding…</div>`
      : '';
    this.listEl.innerHTML = `<h3>Route (${points.length} stops)</h3><ol>${items}</ol>${pendingNote}`;
  }
}
