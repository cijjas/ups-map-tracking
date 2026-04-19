// Bootstrap module for jsvectormap. Importing this assigns the constructor to
// `globalThis.jsVectorMap` so that the side-effectful map data files (which
// expect a global) can register themselves successfully when imported next.
//
// Module evaluation order matters: this file MUST be imported before any
// `jsvectormap/dist/maps/*.js` import.

// @ts-expect-error – jsvectormap has no published types
import jsVectorMap from 'jsvectormap';

(globalThis as unknown as { jsVectorMap: unknown }).jsVectorMap = jsVectorMap;

export default jsVectorMap as unknown as new (opts: Record<string, unknown>) => {
  destroy: () => void;
  setFocus: (opts: Record<string, unknown>) => void;
};
