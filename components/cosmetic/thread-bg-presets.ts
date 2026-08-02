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
};
