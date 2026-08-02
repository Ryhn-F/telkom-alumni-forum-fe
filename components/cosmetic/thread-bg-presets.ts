// thread_bg tint presets, keyed by Cosmetic.payload.preset_key. Values are
// the same light/dark rgba pairs that passed the >=4.5:1 contrast gate
// (both body and meta text) in the /dev/cosmetics harness — see ticket
// "Katalog ring CSS awal + harness preview" (#8) resolution comment.
// Kept low-opacity by design: thread_bg renders behind readable text in a
// dense feed (20+ cards), so it stays a subtle tint, never an image.
export const THREAD_BG_PRESETS: Record<string, { light: string; dark: string }> = {
  "tint-blue": { light: "rgba(37, 99, 235, 0.08)", dark: "rgba(96, 165, 250, 0.14)" },
  "tint-purple": { light: "rgba(147, 51, 234, 0.08)", dark: "rgba(192, 132, 252, 0.14)" },
  "tint-emerald": { light: "rgba(5, 150, 105, 0.08)", dark: "rgba(52, 211, 153, 0.14)" },
  // Added for the thread_bg catalog seed below. Ratios hand-verified against
  // this theme's actual --card/--foreground/--muted-foreground oklch values
  // (converted to sRGB, same relative-luminance formula as contrast.ts) —
  // worst case (amber, muted-foreground text) still clears 5.4:1 on both
  // light and dark, comfortably above the 4.5:1 gate. Amber kept extra low
  // opacity: the harness's own "intentionally bad" example was exactly this
  // hue at higher opacity (0.20/0.28) and failed the gate.
  "tint-crimson": { light: "rgba(220, 38, 38, 0.07)", dark: "rgba(248, 113, 113, 0.13)" },
  "tint-teal": { light: "rgba(13, 148, 136, 0.08)", dark: "rgba(45, 212, 191, 0.14)" },
  "tint-amber": { light: "rgba(217, 119, 6, 0.05)", dark: "rgba(251, 191, 36, 0.10)" },
  "tint-rose": { light: "rgba(225, 29, 72, 0.07)", dark: "rgba(251, 113, 133, 0.13)" },
  "tint-slate": { light: "rgba(51, 65, 85, 0.06)", dark: "rgba(148, 163, 184, 0.12)" },
};
