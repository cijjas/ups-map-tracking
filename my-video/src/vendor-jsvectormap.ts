// Bootstrap module for jsvectormap. Importing this:
//   1. evaluates the library, which assigns `window.jsVectorMap`, and
//   2. triggers the side-effectful world map data file so `jsVectorMap.addMap("world", ...)` registers the shape data.
// Module evaluation order matters – keep these two imports in this order.

// @ts-expect-error – jsvectormap has no published types
import jsVectorMap from "jsvectormap";
// Also mirror to globalThis in case an environment lacks `window`.
(globalThis as unknown as { jsVectorMap: unknown }).jsVectorMap = jsVectorMap;
// Side-effect: registers the world map on the global singleton set up above.
import "jsvectormap/dist/maps/world.js";

export default jsVectorMap as unknown as new (opts: Record<string, unknown>) => {
  destroy: () => void;
  setFocus: (opts: Record<string, unknown>) => void;
};
