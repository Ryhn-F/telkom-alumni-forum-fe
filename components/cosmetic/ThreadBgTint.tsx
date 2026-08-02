"use client";

import { useTheme } from "next-themes";
import { useHydration } from "@/hooks/use-hydration";
import type { Cosmetic, CosmeticCSSPayload } from "@/types";
import { THREAD_BG_ANIMATED_PRESETS, THREAD_BG_PRESETS } from "./thread-bg-presets";
import "./thread-bg-animated.css";

interface ThreadBgTintProps {
  cosmetic?: Cosmetic | null;
}

/** Absolutely-positioned tint overlay — render inside a `relative` wrapper,
 * behind the card's content (content needs `relative` + z-index too). */
export function ThreadBgTint({ cosmetic }: ThreadBgTintProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useHydration();

  if (!cosmetic || cosmetic.render_type !== "css") return null;
  const { preset_key } = cosmetic.payload as CosmeticCSSPayload;

  if (THREAD_BG_ANIMATED_PRESETS.has(preset_key)) {
    return (
      <div
        className={`absolute inset-0 rounded-2xl pointer-events-none ${preset_key}`}
        aria-hidden="true"
      />
    );
  }

  const preset = THREAD_BG_PRESETS[preset_key];
  if (!preset) return null;

  // Avoid an SSR/client mismatch flash by not picking a theme-dependent
  // color until mounted (same pattern as the /dev/cosmetics harness).
  const color = mounted && resolvedTheme === "dark" ? preset.dark : preset.light;

  return (
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}
