"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { Cosmetic, CosmeticCSSPayload, CosmeticImagePayload } from "@/types";
import "./cosmetic-rings.css";

// Locked ratio from the "Kunci spek produksi aset untuk tim seni" ticket
// (#10): decoration render box = avatar size * 1.25, not the earlier 1.2
// baseline, chosen so 40px/96px avatars round to whole-pixel boxes (50/120).
const DECORATION_RATIO = 1.25;

interface CosmeticAvatarProps {
  avatarUrl?: string | null;
  username: string;
  size: number;
  /** The equipped avatar_border cosmetic, if any (ring or decoration sub-type). */
  border?: Cosmetic | null;
  className?: string;
  fallbackClassName?: string;
}

export function CosmeticAvatar({
  avatarUrl,
  username,
  size,
  border,
  className,
  fallbackClassName,
}: CosmeticAvatarProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const initial = (username || "?")[0]?.toUpperCase() || "?";

  const avatarNode = (
    <Avatar className={cn(className)} style={{ width: size, height: size }}>
      <AvatarImage src={avatarUrl || undefined} alt={username} />
      <AvatarFallback className={cn("font-bold", fallbackClassName)}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );

  if (!border || !border.payload) {
    return avatarNode;
  }

  if (border.render_type === "css" && border.sub_type === "ring") {
    const { preset_key } = border.payload as CosmeticCSSPayload;
    return (
      <div
        className={cn("cosmetic-ring", preset_key)}
        style={{ width: size, height: size }}
      >
        {avatarNode}
      </div>
    );
  }

  if (border.render_type === "image" && border.sub_type === "decoration") {
    const { animated_url, static_url } = border.payload as CosmeticImagePayload;
    const src = prefersReducedMotion ? static_url : animated_url;
    const box = Math.round(size * DECORATION_RATIO);
    const offset = (size - box) / 2;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        {avatarNode}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            width: box,
            height: box,
            // Tailwind Preflight's `img{max-width:100%}` resolves against the
            // avatar wrapper (smaller than the decoration box), squashing it
            // without this override — found & fixed in the /dev/cosmetics harness.
            maxWidth: "none",
            maxHeight: "none",
            left: offset,
            top: offset,
          }}
        />
      </div>
    );
  }

  return avatarNode;
}
