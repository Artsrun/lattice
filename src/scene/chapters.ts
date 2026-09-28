export const DURATION = 20;

export const SPEED_MIN = 0.25;
export const SPEED_MAX = 2;
export const SPEED_STEP = 0.25;

export type Chapter = {
  id: string;
  label: string;
  kicker: string;
  start: number;
  end: number;
  href: string;
  linkLabel: string;
  linkHref: string;
};

export const CHAPTERS: Chapter[] = [
  {
    id: "lattice",
    label: "Lattice",
    kicker: "The grid",
    start: 0,
    end: 2.6,
    href: "#lattice",
    linkLabel: "Three.js",
    linkHref: "https://threejs.org",
  },
  {
    id: "core",
    label: "Core",
    kicker: "The chip docks",
    start: 2.6,
    end: 5.4,
    href: "#core",
    linkLabel: "WebGL on MDN",
    linkHref: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API",
  },
  {
    id: "play",
    label: "Play",
    kicker: "The wheel",
    start: 5.4,
    end: 8.4,
    href: "#play",
    linkLabel: "React Three Fiber",
    linkHref: "https://r3f.docs.pmnd.rs/getting-started/introduction",
  },
  {
    id: "time",
    label: "Time",
    kicker: "The clock",
    start: 8.4,
    end: 11.2,
    href: "#time",
    linkLabel: "requestAnimationFrame",
    linkHref: "https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame",
  },
  {
    id: "pocket",
    label: "Pocket",
    kicker: "The handset",
    start: 11.2,
    end: 14.2,
    href: "#pocket",
    linkLabel: "Responsive canvas",
    linkHref: "https://threejs.org/manual/en/responsive.html",
  },
  {
    id: "split",
    label: "Split",
    kicker: "The share",
    start: 14.2,
    end: 16.4,
    href: "#split",
    linkLabel: "Web Share API",
    linkHref: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API",
  },
  {
    id: "crew",
    label: "Crew",
    kicker: "The operators",
    start: 16.4,
    end: 18.2,
    href: "#crew",
    linkLabel: "Lots of objects",
    linkHref: "https://threejs.org/manual/en/optimize-lots-of-objects.html",
  },
  {
    id: "floor",
    label: "Floor",
    kicker: "The terminal",
    start: 18.2,
    end: 20,
    href: "#floor",
    linkLabel: "Render on demand",
    linkHref: "https://threejs.org/manual/en/rendering-on-demand.html",
  },
];

export const SHADE: Chapter = {
  id: "shade",
  label: "Shade",
  kicker: "The field",
  start: 0,
  end: 0,
  href: "#shade",
  linkLabel: "The Book of Shaders",
  linkHref: "https://thebookofshaders.com",
};

export const PAGES: Chapter[] = [CHAPTERS[0]!, SHADE, ...CHAPTERS.slice(1)];

type KF = {
  t: number;
  p: [number, number, number];
  l: [number, number, number];
  fov: number;
};

export const KEYFRAMES: KF[] = [
  { t: 0.0, p: [7.6, 5.8, 14.8], l: [1.1, 1.2, 3.0], fov: 46 },
  { t: 1.7, p: [4.8, 3.9, 8.6], l: [0.3, 0.45, 1.4], fov: 42 },
  { t: 3.1, p: [1.7, 2.55, 4.15], l: [0, 0.28, 0.12], fov: 38 },
  { t: 4.55, p: [0.04, 2.28, 2.5], l: [0, 0.14, 0], fov: 32 },
  { t: 5.35, p: [0.2, 6.2, -5.4], l: [0, 0.6, -16.4], fov: 46 },
  { t: 6.9, p: [5.4, 4.5, -13.6], l: [0, 0.35, -18.3], fov: 40 },
  { t: 8.35, p: [0.55, 2.85, -15.2], l: [0, 0.18, -18.3], fov: 34 },
  { t: 10.3, p: [0.0, 1.85, -15.85], l: [0, 0.12, -18.3], fov: 30 },
  { t: 11.5, p: [-1.6, 3.7, -24.2], l: [2.7, 0.95, -32.2], fov: 42 },
  { t: 13.15, p: [1.35, 1.35, -29.0], l: [2.75, 0.52, -32.5], fov: 36 },
  { t: 14.55, p: [0.0, 2.05, -38.8], l: [0, 1.35, -48.4], fov: 48 },
  { t: 16.15, p: [0.0, 1.72, -47.2], l: [0, 1.28, -50.6], fov: 38 },
  { t: 17.55, p: [0.0, 1.68, -57.6], l: [0, 1.28, -62.1], fov: 38 },
  { t: 18.95, p: [0.0, 1.55, -67.6], l: [0, 1.18, -74.2], fov: 40 },
  { t: 20.0, p: [0.0, 1.22, -71.4], l: [0, 1.08, -74.6], fov: 36 },
];

export function wrapTime(t: number) {
  return ((t % DURATION) + DURATION) % DURATION;
}

export function remap(t: number, a: number, b: number) {
  if (b === a) return t >= b ? 1 : 0;
  return Math.min(1, Math.max(0, (t - a) / (b - a)));
}

export function easeInOut(u: number) {
  return u * u * (3 - 2 * u);
}

export function lerp(a: number, b: number, s: number) {
  return a + (b - a) * s;
}

export function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  s: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
}

export function sampleAt(time: number) {
  const t = wrapTime(time);
  const kfs = KEYFRAMES;
  let i = 0;
  while (i < kfs.length - 2 && kfs[i + 1]!.t <= t) i += 1;
  const a = kfs[i]!;
  const b = kfs[i + 1]!;
  const u = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
  const s = easeInOut(Math.min(1, Math.max(0, u)));
  return {
    pos: lerp3(a.p, b.p, s),
    look: lerp3(a.l, b.l, s),
    fov: a.fov + (b.fov - a.fov) * s,
    t,
  };
}

export function chapterAt(time: number): Chapter {
  const t = wrapTime(time);
  for (let i = CHAPTERS.length - 1; i >= 0; i--) {
    const ch = CHAPTERS[i];
    if (ch && t >= ch.start) return ch;
  }
  return CHAPTERS[0]!;
}

export function chapterById(id: string) {
  if (id === SHADE.id) return SHADE;
  return CHAPTERS.find((c) => c.id === id) ?? null;
}

export function loopFade(t: number) {
  const w = wrapTime(t);
  if (w < 0.38) return 1 - w / 0.38;
  if (w > 19.52) return (w - 19.52) / 0.48;
  return 0;
}

export function formatTime(t: number) {
  const w = wrapTime(t);
  const s = Math.floor(w);
  const cs = Math.floor((w - s) * 10);
  return `${String(s).padStart(2, "0")}.${cs}`;
}

export function clampSpeed(s: number) {
  const stepped = Math.round(s / SPEED_STEP) * SPEED_STEP;
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, stepped));
}

export function formatSpeed(s: number) {
  const n = clampSpeed(s);
  return `${n}×`;
}

export function chapterHoldTime(ch: Chapter) {
  return ch.start + (ch.end - ch.start) * 0.42;
}
