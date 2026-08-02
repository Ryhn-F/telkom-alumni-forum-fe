"use client";

import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import type { Cosmetic, CosmeticImagePayload } from "@/types";

interface ProfileBannerProps {
  cosmetic?: Cosmetic | null;
}

/** profile_bg is image-capable (unlike thread_bg): it only renders once per
 * pageview, not in a dense feed, so the render-cost tradeoff that keeps
 * thread_bg CSS-only doesn't apply here. Falls back to the original gradient
 * when nothing is equipped. */
export function ProfileBanner({ cosmetic }: ProfileBannerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!cosmetic || cosmetic.render_type !== "image") {
    return <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />;
  }

  const { animated_url, static_url } = cosmetic.payload as CosmeticImagePayload;
  const src = prefersReducedMotion ? static_url : animated_url;

  return (
    <div className="h-24 bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="w-full h-full object-cover" />
    </div>
  );
}
