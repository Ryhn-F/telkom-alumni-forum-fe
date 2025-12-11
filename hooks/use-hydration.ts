"use client";

import { useEffect, useState } from "react";

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

export function useStore<T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
  serverValue?: F
): F {
  const result = store(callback) as F;
  const hydrated = useHydration();
  return hydrated ? result : (serverValue as F);
}
