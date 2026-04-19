// Runs in the page (MAIN) world. No chrome.* APIs available here.
// Patches fetch + XHR, detects UPS tracking JSON by URL hint and shape,
// then postMessages the parsed payload to the isolated content script.

import { INTERCEPT_MESSAGE_SOURCE, UpsTrackPayload } from './types';

(() => {
  const FLAG = '__upsRouteMapInjected__';
  const w = window as unknown as Record<string, unknown>;
  if (w[FLAG]) return;
  w[FLAG] = true;

  const looksLikeTrackUrl = (url: string): boolean => {
    if (!url) return false;
    const lower = url.toLowerCase();
    if (!lower.includes('ups.com')) return false;
    return (
      lower.includes('/track/api/') ||
      lower.includes('/track/getstatus') ||
      lower.includes('trackstatus') ||
      lower.includes('webapis.ups.com')
    );
  };

  const isTrackPayload = (data: unknown): data is UpsTrackPayload => {
    if (!data || typeof data !== 'object') return false;
    const td = (data as { trackDetails?: unknown }).trackDetails;
    if (!Array.isArray(td) || td.length === 0) return false;
    const first = td[0];
    if (!first || typeof first !== 'object') return false;
    const f = first as Record<string, unknown>;
    return (
      Array.isArray(f.shipmentProgressActivities) ||
      Array.isArray(f.milestones)
    );
  };

  const post = (payload: UpsTrackPayload, url: string) => {
    try {
      window.postMessage(
        { source: INTERCEPT_MESSAGE_SOURCE, payload, url },
        '*',
      );
    } catch {
      /* swallow */
    }
  };

  const tryParse = (text: string): unknown => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const handleMaybeJson = (text: string, url: string) => {
    const data = tryParse(text);
    if (isTrackPayload(data)) post(data, url);
  };

  // ------------ fetch ------------
  const originalFetch = window.fetch;
  window.fetch = async function (...args: Parameters<typeof fetch>) {
    const input = args[0];
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input && typeof input === 'object' && 'url' in input
            ? (input as Request).url
            : '';
    const response = await originalFetch.apply(this, args);

    // Only inspect JSON responses; gate by URL hint to avoid heavy work.
    try {
      if (looksLikeTrackUrl(url)) {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('json') || ct === '') {
          response
            .clone()
            .text()
            .then((t) => handleMaybeJson(t, url))
            .catch(() => {});
        }
      }
    } catch {
      /* swallow */
    }

    return response;
  };

  // ------------ XHR ------------
  type TrackedXHR = XMLHttpRequest & { __upsUrl?: string };
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    ...rest: unknown[]
  ) {
    (this as TrackedXHR).__upsUrl =
      typeof url === 'string' ? url : url.toString();
    // @ts-expect-error: forward rest args
    return originalOpen.call(this, method, url, ...rest);
  };

  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...args: unknown[]) {
    this.addEventListener('load', function () {
      try {
        const u = (this as TrackedXHR).__upsUrl || '';
        if (!looksLikeTrackUrl(u)) return;
        const text = (this as XMLHttpRequest).responseText;
        if (!text) return;
        handleMaybeJson(text, u);
      } catch {
        /* swallow */
      }
    });
    // @ts-expect-error: forward args
    return originalSend.apply(this, args);
  };
})();
