// PROTOTYPE — wayfinder tiket "Katalog ring CSS awal + harness preview"
// WCAG 2.x contrast ratio helpers. Pure functions, no deps.

type Rgb = [number, number, number, number]; // r, g, b, a (0-1)

// Chrome resolves getComputedStyle() using whatever color space the value
// was declared in — this theme uses oklch, so computed colors come back as
// "oklab(...)" / "lab(...)" strings, NOT "rgb()". Regexing rgb() alone
// silently failed on those and produced garbage [0,0,0,1] for everything.
// Canvas 2D's color parser understands the full CSS Color 4 space and
// always reads back plain 0-255 RGBA, so let the browser do the
// normalization instead of re-implementing oklab/lab math by hand.
let sharedCtx: CanvasRenderingContext2D | null = null;

export function parseRgb(cssColor: string): Rgb {
  if (!sharedCtx) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    sharedCtx = canvas.getContext("2d", { willReadFrequently: true });
  }
  const ctx = sharedCtx;
  if (!ctx) return [0, 0, 0, 1];
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = cssColor;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

// Alpha-composite fg over bg, both in 0-255 rgb + 0-1 alpha.
export function blend(fg: Rgb, bg: Rgb): [number, number, number] {
  const a = fg[3];
  return [
    fg[0] * a + bg[0] * (1 - a),
    fg[1] * a + bg[1] * (1 - a),
    fg[2] * a + bg[2] * (1 - a),
  ];
}

function relLuminance([r, g, b]: [number, number, number]): number {
  const srgb = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

export function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const la = relLuminance(a) + 0.05;
  const lb = relLuminance(b) + 0.05;
  return la > lb ? la / lb : lb / la;
}
