"use client";

/**
 * INTERNAL DEV TOOL — wayfinder tiket "Katalog ring CSS awal + harness preview"
 * https://github.com/fardhanrasya/telkom-alumni-forum/issues/8
 *
 * Unlike a typical throwaway prototype, this ticket's own body says the
 * harness "bukan barang sekali pakai" — it's kept as a durable internal
 * tool feeding the later "Kurasi katalog & gate kualitas" ticket (art team
 * uses it to self-check new decoration assets against the contrast gate).
 * So it stays in the repo, gated out of production builds below, rather
 * than moving to a throwaway branch.
 *
 * Shape note: this deviates from the standard 3-variant `?variant=`
 * prototype switcher. The ticket's own deliverable is a *gallery* — all
 * ring candidates visible and animating at once, in dense feed context —
 * because the question is "which of these survive at 40px in a crowded
 * feed", which requires seeing them side by side and simultaneously
 * animated, not toggled one at a time.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHydration } from "@/hooks/use-hydration";
import { blend, contrastRatio, parseRgb } from "./contrast";
import "./cosmetics-harness.css";

if (process.env.NODE_ENV === "production") {
  notFound();
}

const RINGS = [
  { key: "ring-conic-spin", label: "1. Conic spin", note: "conic-gradient, seluruh ring berputar" },
  { key: "ring-pulse-glow", label: "2. Pulse + glow", note: "opacity berdenyut + drop-shadow tipis (bleeds ~3px, bukan ring murni)" },
  { key: "ring-double", label: "3. Cincin ganda", note: "dua ring warna beda, statis" },
  { key: "ring-shimmer", label: "4. Shimmer sweep", note: "gradient linear menyapu, background-position" },
  { key: "ring-dashed", label: "5. Dashed berputar", note: "border dashed asli (bukan mask trick), berputar" },
  { key: "ring-static", label: "6. Gradient statis", note: "tanpa animasi sama sekali" },
  { key: "ring-rainbow", label: "7. Rainbow hue-rotate", note: "conic rainbow + filter hue-rotate" },
];

const AUTHORS = [
  { name: "fardhan", initial: "F" },
  { name: "rasya", initial: "R" },
  { name: "budi", initial: "B" },
  { name: "siti", initial: "S" },
  { name: "anto", initial: "A" },
  { name: "dewi", initial: "D" },
];

const SAMPLE_TEXT =
  "Halo teman-teman, ada yang tau jadwal ujian praktik semester ini kapan? Aku dengar bakal digabung sama kelas sebelah, tapi belum ada pengumuman resmi dari wali kelas.";

type Tint = { name: string; light: string; dark: string; intentionallyBad?: boolean };

const TINTS: Tint[] = [
  { name: "Netral (kontrol)", light: "rgba(0,0,0,0)", dark: "rgba(0,0,0,0)" },
  { name: "Biru Elektrik", light: "rgba(37, 99, 235, 0.08)", dark: "rgba(96, 165, 250, 0.14)" },
  { name: "Ungu Aurora", light: "rgba(147, 51, 234, 0.08)", dark: "rgba(192, 132, 252, 0.14)" },
  { name: "Zamrud", light: "rgba(5, 150, 105, 0.08)", dark: "rgba(52, 211, 153, 0.14)" },
  { name: "Amber Kuat (contoh gagal gate, sengaja)", light: "rgba(217, 119, 6, 0.20)", dark: "rgba(251, 191, 36, 0.28)", intentionallyBad: true },
  { name: "Amber Ekstrem (uji batas)", light: "rgba(180, 83, 9, 0.55)", dark: "rgba(253, 224, 71, 0.65)", intentionallyBad: true },
];

// Rasio 1,25× (dikunci tiket "Kunci spek produksi aset untuk tim seni", #10 —
// menyimpang sengaja dari baseline riset 1,2×/#4 supaya kotak render jadi bilangan bulat)
const DECORATION_BOX_96 = 120;
const DECORATION_BOX_40 = 50;

export default function CosmeticsHarnessPage() {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes only knows resolvedTheme after mount — avoid hydration
  // mismatch by rendering theme-dependent text only once mounted.
  const mounted = useHydration();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedRing, setSelectedRing] = useState(RINGS[0].key);
  const [decorationUrl, setDecorationUrl] = useState<string | null>(null);
  const [applyMask, setApplyMask] = useState(false);

  useEffect(() => {
    return () => {
      if (decorationUrl) URL.revokeObjectURL(decorationUrl);
    };
  }, [decorationUrl]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (decorationUrl) URL.revokeObjectURL(decorationUrl);
    setDecorationUrl(URL.createObjectURL(file));
  }

  return (
    <div className={`min-h-screen bg-background text-foreground p-6 md:p-10 space-y-16 ${reducedMotion ? "simulate-reduced-motion" : ""}`}>
      <header className="sticky top-0 z-20 -mx-6 md:-mx-10 px-6 md:px-10 py-3 bg-background/95 backdrop-blur border-b border-border flex flex-wrap items-center gap-3 justify-between">
        <div>
          <p className="text-xs font-mono text-destructive">PROTOTYPE — hapus sebelum production</p>
          <h1 className="text-lg font-bold">Cosmetics Harness — tiket #8</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
            Simulasikan prefers-reduced-motion
          </label>
          <Button size="sm" variant="outline" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            {mounted && resolvedTheme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </Button>
        </div>
      </header>

      {/* ================= 1. RING GALLERY ================= */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">1. Galeri ring CSS (40px & 96px)</h2>
          <p className="text-sm text-muted-foreground">
            Tema aktif: <strong>{mounted ? resolvedTheme : "…"}</strong>. Efek halus cenderung hilang di ukuran kecil — perhatikan
            mana yang masih terbaca di kolom 40px.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RINGS.map((ring) => (
            <div key={ring.key} className="border border-border rounded-xl p-4 space-y-3 bg-card">
              <p className="text-sm font-semibold">{ring.label}</p>
              <p className="text-xs text-muted-foreground">{ring.note}</p>
              <div className="flex items-end gap-6 pt-2">
                <div className="flex flex-col items-center gap-1">
                  <div className={`cosmetic-ring ${ring.key}`} style={{ width: 40, height: 40 }}>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-red-50 text-red-600 font-bold text-xs">F</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-[10px] text-muted-foreground">feed 40px</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className={`cosmetic-ring ${ring.key}`} style={{ width: 96, height: 96 }}>
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-red-50 text-red-600 font-bold text-2xl">F</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-[10px] text-muted-foreground">profil 96px</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 2. FEED DENSITY ================= */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">2. Konteks feed padat (bukan avatar sendirian)</h2>
          <p className="text-sm text-muted-foreground">
            Enam kartu bertumpuk, tiap avatar pakai ring berbeda — cek beban animasi bersamaan dan drift antar-instance
            (ring yang sama di dua kartu harusnya tetap terlihat, tapi perhatikan apakah fase animasinya nyambung atau
            malah acak).
          </p>
        </div>
        <div className="max-w-xl space-y-3">
          {AUTHORS.map((author, i) => {
            const ring = RINGS[i % RINGS.length];
            return (
              <article key={author.name} className="bg-card border border-border/60 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className={`cosmetic-ring ${ring.key}`} style={{ width: 40, height: 40 }}>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-red-50 text-red-600 font-bold text-xs">{author.initial}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{author.name}</p>
                    <p className="text-xs text-muted-foreground">{ring.label} · 2j lalu</p>
                  </div>
                </div>
                <p className="text-sm text-foreground/90">{SAMPLE_TEXT}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ================= 3. PROFILE HEADER + DECORATION ================= */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">3. Header profil + slot decoration image</h2>
          <p className="text-sm text-muted-foreground">
            Kotak decoration untuk avatar 96px = <strong>{DECORATION_BOX_96}px</strong> (rasio 1,2× dari riset baseline).
            Upload PNG/APNG/WebP untuk lihat overflow-nya beneran, termasuk kalau filenya beranimasi — perilaku
            <code className="mx-1">mask-image</code> pada gambar beranimasi tidak dijamin spec manapun, jadi harus
            dibuktikan di sini, bukan diasumsikan.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-border max-w-xl">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
          <div className="p-6 pt-0 -mt-12">
            <div className="flex items-end gap-4">
              <div className="relative" style={{ width: 96, height: 96 }}>
                {!decorationUrl && (
                  <div className={`cosmetic-ring ${selectedRing}`} style={{ width: 96, height: 96 }}>
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">FR</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                {decorationUrl && (
                  <>
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">FR</AvatarFallback>
                    </Avatar>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={decorationUrl}
                      alt="decoration test"
                      className="absolute pointer-events-none"
                      style={{
                        width: DECORATION_BOX_96,
                        height: DECORATION_BOX_96,
                        maxWidth: "none", // Tailwind Preflight's `img{max-width:100%}` resolves
                        maxHeight: "none", // against the 96px avatar wrapper, stretching this
                        left: (96 - DECORATION_BOX_96) / 2,
                        top: (96 - DECORATION_BOX_96) / 2,
                        maskImage: applyMask
                          ? "radial-gradient(circle, black 78%, transparent 100%)"
                          : undefined,
                        WebkitMaskImage: applyMask
                          ? "radial-gradient(circle, black 78%, transparent 100%)"
                          : undefined,
                      }}
                    />
                  </>
                )}
              </div>
              <div className="pb-2">
                <p className="font-bold">fardhan_rasya</p>
                <p className="text-xs text-muted-foreground">Angkatan 2021</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
              <select
                className="border border-border rounded px-2 py-1 bg-background"
                value={selectedRing}
                onChange={(e) => setSelectedRing(e.target.value)}
                disabled={!!decorationUrl}
              >
                {RINGS.map((r) => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5">
                <input type="file" accept="image/*" onChange={handleFile} />
              </label>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (decorationUrl) URL.revokeObjectURL(decorationUrl);
                  setDecorationUrl("/dev-assets/decoration_smoke-ring_animated.png");
                }}
              >
                Coba: Smoke Ring
              </Button>
              {decorationUrl && (
                <>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={applyMask} onChange={(e) => setApplyMask(e.target.checked)} />
                    Terapkan mask-image (uji edge fade)
                  </label>
                  <Button size="sm" variant="ghost" onClick={() => setDecorationUrl(null)}>Hapus file, balik ke ring</Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-xl border border-border rounded-xl p-3 text-xs text-muted-foreground bg-card">
          Kotak decoration di feed (avatar 40px) = <strong>{DECORATION_BOX_40}px</strong>. Renderer avatar harus
          menyiapkan ruang ini di semua enam permukaan, bahkan sebelum decoration pertama dipakai, supaya tidak ada
          layout shift belakangan.
        </div>
      </section>

      {/* ================= 4. THREAD BG CONTRAST GATE ================= */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">4. Gate kontras tint thread background (≥4.5:1)</h2>
          <p className="text-sm text-muted-foreground">
            Tiap kandidat diukur beneran (getComputedStyle + WCAG relative luminance), bukan ditaksir. Satu kandidat
            sengaja dibuat kuat untuk membuktikan gate ini benar-benar menangkap yang gagal.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TINTS.map((tint) => (
            <div key={tint.name} className="space-y-2">
              <p className="text-sm font-semibold">{tint.name}</p>
              <div className="grid grid-cols-2 gap-2">
                <TintCard tint={tint} mode="light" />
                <TintCard tint={tint} mode="dark" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TintCard({ tint, mode }: { tint: Tint; mode: "light" | "dark" }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const bodyTextRef = useRef<HTMLParagraphElement>(null);
  const mutedTextRef = useRef<HTMLSpanElement>(null);
  const [bodyRatio, setBodyRatio] = useState<number | null>(null);
  const [mutedRatio, setMutedRatio] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!baseRef.current || !overlayRef.current || !bodyTextRef.current || !mutedTextRef.current) return;
    const baseBg = parseRgb(getComputedStyle(baseRef.current).backgroundColor);
    const overlayBg = parseRgb(getComputedStyle(overlayRef.current).backgroundColor);
    const composited = blend(overlayBg, baseBg);
    const bodyColor = parseRgb(getComputedStyle(bodyTextRef.current).color);
    const mutedColor = parseRgb(getComputedStyle(mutedTextRef.current).color);
    setBodyRatio(contrastRatio(composited, [bodyColor[0], bodyColor[1], bodyColor[2]]));
    setMutedRatio(contrastRatio(composited, [mutedColor[0], mutedColor[1], mutedColor[2]]));
  }, [tint, mode]);

  const bodyPasses = bodyRatio !== null && bodyRatio >= 4.5;
  const mutedPasses = mutedRatio !== null && mutedRatio >= 4.5;

  return (
    <div className={mode === "dark" ? "dark" : undefined}>
      <div ref={baseRef} className="relative bg-card border border-border rounded-xl p-3 overflow-hidden">
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: mode === "dark" ? tint.dark : tint.light }}
        />
        <div className="relative flex items-center gap-1.5 mb-1">
          <span ref={mutedTextRef} className="text-[10px] text-muted-foreground">fardhan · 2j lalu</span>
        </div>
        <p ref={bodyTextRef} className="relative text-[11px] text-foreground/90 leading-snug">
          {SAMPLE_TEXT.slice(0, 90)}…
        </p>
        <div className="relative mt-2 flex items-center justify-between gap-1">
          <span className="text-[10px] text-muted-foreground">{mode}</span>
          <div className="flex gap-1">
            {bodyRatio !== null && (
              <Badge variant={bodyPasses ? "secondary" : "destructive"} className="text-[10px]" title="Kontras teks isi (text-foreground/90)">
                isi {bodyRatio.toFixed(2)}:1 {bodyPasses ? "✓" : "✗"}
              </Badge>
            )}
            {mutedRatio !== null && (
              <Badge variant={mutedPasses ? "secondary" : "destructive"} className="text-[10px]" title="Kontras teks sekunder (text-muted-foreground)">
                meta {mutedRatio.toFixed(2)}:1 {mutedPasses ? "✓" : "✗"}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
