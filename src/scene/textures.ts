import * as THREE from "three";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context");
  return { c, ctx };
}

function tex(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

export function makePinTexture() {
  const { c, ctx } = canvas(256, 256);
  ctx.fillStyle = "#0c1018";
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 10; y < 246; y += 11) {
    for (let x = 10; x < 246; x += 11) {
      ctx.fillStyle = "#c9a24a";
      ctx.fillRect(x, y, 4, 4);
    }
  }
  return tex(c);
}

export function makeMarkTexture() {
  const { c, ctx } = canvas(512, 512);
  ctx.fillStyle = "#141a22";
  ctx.fillRect(0, 0, 512, 512);
  const cells: [number, number][] = [
    [118, 118],
    [270, 118],
    [118, 270],
    [270, 270],
  ];
  ctx.fillStyle = "#e8f4fc";
  cells.forEach(([x, y]) => {
    round(ctx, x, y, 124, 124, 22);
    ctx.fill();
  });
  ctx.fillStyle = "#141a22";
  cells.forEach(([x, y]) => {
    round(ctx, x + 28, y + 28, 68, 68, 12);
    ctx.fill();
  });
  return tex(c);
}

export function makePcbTexture() {
  const { c, ctx } = canvas(1024, 1024);
  ctx.fillStyle = "#101c2c";
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.strokeStyle = "#2a5a78";
  ctx.lineWidth = 2;
  for (let i = 0; i < 48; i++) {
    const x = 40 + ((i * 73) % 940);
    const y = 40 + ((i * 137) % 940);
    const x2 = 40 + ((i * 191) % 940);
    const y2 = 40 + ((i * 53) % 940);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.fillStyle = "#c9a24a";
  for (let i = 0; i < 90; i++) {
    const x = 24 + ((i * 97) % 980);
    const y = 24 + ((i * 61) % 980);
    ctx.fillRect(x, y, 6, 6);
  }
  return tex(c);
}

export function makeWheelTexture() {
  const { c, ctx } = canvas(1024, 1024);
  const cx = 512;
  const cy = 512;
  ctx.fillStyle = "#0b1a2c";
  ctx.beginPath();
  ctx.arc(cx, cy, 512, 0, Math.PI * 2);
  ctx.fill();
  const n = 37;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 500, a0, a1);
    ctx.closePath();
    ctx.fillStyle = i === 0 ? "#c47a18" : i % 2 ? "#8c2430" : "#161c26";
    ctx.fill();
  }
  ctx.fillStyle = "#0b1a2c";
  ctx.beginPath();
  ctx.arc(cx, cy, 210, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e0a23a";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, 478, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 226, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#e8f4fc";
  ctx.font = "600 26px IBM Plex Mono, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * 355;
    const y = cy + Math.sin(a) * 355;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(String(i), 0, 0);
    ctx.restore();
  }
  return tex(c);
}

export function makeClockTexture() {
  const { c, ctx } = canvas(1024, 1024);
  const cx = 512;
  const cy = 512;
  ctx.fillStyle = "#0b1a2c";
  ctx.beginPath();
  ctx.arc(cx, cy, 500, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(224,162,58,0.85)";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, 430, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(216,238,248,0.55)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, 210, 0, Math.PI * 2);
  ctx.stroke();

  const romans = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  ctx.fillStyle = "#e0a23a";
  ctx.font = "600 64px Syne, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  romans.forEach((r, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * 340;
    const y = cy + Math.sin(a) * 340;
    ctx.fillText(r, x, y);
  });

  const suits = [
    { i: 1.5, draw: spade },
    { i: 4.5, draw: club },
    { i: 7.5, draw: diamond },
    { i: 10.5, draw: heart },
  ];
  suits.forEach((s) => {
    const a = (s.i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * 270;
    const y = cy + Math.sin(a) * 270;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#e0a23a";
    s.draw(ctx);
    ctx.restore();
  });

  return tex(c);
}

function spade(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.bezierCurveTo(18, -4, 18, 10, 0, 8);
  ctx.bezierCurveTo(-18, 10, -18, -4, 0, -22);
  ctx.fill();
  ctx.fillRect(-3, 8, 6, 16);
}

function heart(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.bezierCurveTo(22, 2, 18, -16, 0, -6);
  ctx.bezierCurveTo(-18, -16, -22, 2, 0, 18);
  ctx.fill();
}

function diamond(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(14, 0);
  ctx.lineTo(0, 22);
  ctx.lineTo(-14, 0);
  ctx.closePath();
  ctx.fill();
}

function club(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(0, -10, 9, 0, Math.PI * 2);
  ctx.arc(-10, 4, 9, 0, Math.PI * 2);
  ctx.arc(10, 4, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-3, 6, 6, 16);
}

export function makePhoneTexture() {
  const { c, ctx } = canvas(512, 1024);
  ctx.fillStyle = "#0a1422";
  ctx.fillRect(0, 0, 512, 1024);

  ctx.fillStyle = "#e8f4fc";
  ctx.font = "500 22px Manrope, sans-serif";
  ctx.fillText("9:41", 28, 48);
  ctx.textAlign = "right";
  ctx.fillText("128.00", 484, 48);
  ctx.textAlign = "left";

  const games = ["Temple", "Majestic", "Fire", "October"];
  games.forEach((g, i) => {
    const x = 36 + i * 118;
    ctx.fillStyle = i % 2 ? "#1a3a5c" : "#16324c";
    round(ctx, x, 78, 100, 100, 18);
    ctx.fill();
    ctx.fillStyle = "#5ec8f0";
    ctx.beginPath();
    ctx.arc(x + 50, 118, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8aa0b8";
    ctx.font = "500 13px Manrope, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(g, x + 50, 168);
  });
  ctx.textAlign = "left";

  const grd = ctx.createLinearGradient(28, 210, 484, 430);
  grd.addColorStop(0, "#1487b8");
  grd.addColorStop(1, "#0d4a72");
  ctx.fillStyle = grd;
  round(ctx, 28, 210, 456, 220, 24);
  ctx.fill();
  ctx.fillStyle = "#e8f4fc";
  ctx.font = "700 44px Syne, sans-serif";
  ctx.fillText("Play on.", 52, 290);
  ctx.font = "500 18px Manrope, sans-serif";
  ctx.fillStyle = "rgba(232,244,252,0.8)";
  ctx.fillText("Pocket odds. Live books.", 52, 328);
  ctx.fillStyle = "#e0a23a";
  ctx.beginPath();
  ctx.arc(400, 320, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#071428";
  ctx.font = "700 22px Syne, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("·", 400, 328);
  ctx.textAlign = "left";

  const cats = ["Sport", "Slots", "Keno", "Live"];
  cats.forEach((name, i) => {
    const x = 36 + i * 118;
    ctx.fillStyle = "#12263c";
    round(ctx, x, 454, 100, 64, 16);
    ctx.fill();
    ctx.fillStyle = "#8aa0b8";
    ctx.font = "600 14px Manrope, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, x + 50, 492);
  });
  ctx.textAlign = "left";

  ctx.fillStyle = "#5ec8f0";
  ctx.font = "600 28px IBM Plex Mono, monospace";
  ctx.fillText("75 456 221.35", 36, 568);

  ctx.fillStyle = "#8aa0b8";
  ctx.font = "500 14px Manrope, sans-serif";
  ctx.fillText("Live & prematch", 36, 610);

  ctx.fillStyle = "#12263c";
  round(ctx, 28, 632, 456, 220, 20);
  ctx.fill();
  ctx.fillStyle = "#e8f4fc";
  ctx.font = "600 16px Manrope, sans-serif";
  ctx.fillText("North United   vs   East City", 52, 680);
  ctx.fillStyle = "#5a738c";
  ctx.font = "500 13px Manrope, sans-serif";
  ctx.fillText("Premiere · 22:00", 52, 706);

  const odds = ["1.24", "4.12", "7.56"];
  odds.forEach((o, i) => {
    const x = 52 + i * 140;
    ctx.fillStyle = "#0c1c32";
    round(ctx, x, 740, 120, 72, 12);
    ctx.fill();
    ctx.fillStyle = "#5ec8f0";
    ctx.font = "600 22px IBM Plex Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(o, x + 60, 784);
  });

  return tex(c);
}

export function makeMarqueeTexture() {
  const { c, ctx } = canvas(1024, 512);
  const g = ctx.createLinearGradient(0, 0, 1024, 512);
  g.addColorStop(0, "#e07a22");
  g.addColorStop(1, "#e0a23a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = "#071428";
  ctx.font = "800 72px Syne, sans-serif";
  ctx.fillText("Play the floor.", 64, 180);
  ctx.font = "500 32px Manrope, sans-serif";
  ctx.fillText("Live sport  ·  virtual  ·  retail", 64, 250);
  ctx.beginPath();
  ctx.arc(860, 200, 70, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(7,20,40,0.2)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(800, 320, 48, 0, Math.PI * 2);
  ctx.fill();
  return tex(c);
}

export function makeKioskTexture() {
  const { c, ctx } = canvas(1024, 640);
  ctx.fillStyle = "#0a1628";
  ctx.fillRect(0, 0, 1024, 640);
  const tiles = [
    ["Sport", "#1487b8"],
    ["Live", "#e07a22"],
    ["Virtual", "#3b8fc8"],
    ["Promo", "#5ec8f0"],
    ["Table", "#c47a18"],
    ["Race", "#1a5a88"],
  ];
  tiles.forEach((tile, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 40 + col * 320;
    const y = 40 + row * 280;
    ctx.fillStyle = tile[1] ?? "#1487b8";
    round(ctx, x, y, 292, 248, 24);
    ctx.fill();
    ctx.fillStyle = "#071428";
    ctx.font = "700 36px Syne, sans-serif";
    ctx.fillText(tile[0] ?? "", x + 28, y + 140);
  });
  return tex(c);
}

export function makePeopleTexture() {
  const { c, ctx } = canvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = "#e0a23a";
  ctx.beginPath();
  ctx.arc(100, 92, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, 210, 52, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(168, 108, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(168, 210, 42, Math.PI, 0);
  ctx.fill();
  return tex(c);
}

function round(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export type TexBag = {
  pin: THREE.CanvasTexture;
  mark: THREE.CanvasTexture;
  pcb: THREE.CanvasTexture;
  wheel: THREE.CanvasTexture;
  clock: THREE.CanvasTexture;
  phone: THREE.CanvasTexture;
  marquee: THREE.CanvasTexture;
  kiosk: THREE.CanvasTexture;
  people: THREE.CanvasTexture;
  dispose: () => void;
};

export function createTextures(): TexBag {
  const pin = makePinTexture();
  const mark = makeMarkTexture();
  const pcb = makePcbTexture();
  const wheel = makeWheelTexture();
  const clock = makeClockTexture();
  const phone = makePhoneTexture();
  const marquee = makeMarqueeTexture();
  const kiosk = makeKioskTexture();
  const people = makePeopleTexture();
  return {
    pin,
    mark,
    pcb,
    wheel,
    clock,
    phone,
    marquee,
    kiosk,
    people,
    dispose() {
      pin.dispose();
      mark.dispose();
      pcb.dispose();
      wheel.dispose();
      clock.dispose();
      phone.dispose();
      marquee.dispose();
      kiosk.dispose();
      people.dispose();
    },
  };
}
