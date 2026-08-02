"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

// Raster decoration assets (APNG/WebP) can't be paused by the
// prefers-reduced-motion CSS media query the way CSS animations can — the
// caller must pick the static variant itself. Defaults to false (animated)
// on the server so SSR/first paint matches the common case; corrects on the
// client via useSyncExternalStore, the supported way to read external
// browser state without a setState-in-effect cascade.
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
