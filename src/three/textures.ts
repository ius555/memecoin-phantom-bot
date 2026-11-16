import * as THREE from 'three';
import { rng } from './pcb/painter';

/** Toate texturile sunt desenate pe canvas, din cod. Nimic descărcat. */

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w));
  c.height = Math.max(2, Math.round(h));
  return [c, c.getContext('2d')!] as const;
}

function finish(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

// ───────────────────────── marcaje pe capsule ─────────────────────────

const markCache = new Map<string, THREE.MeshStandardMaterial>();

export interface MarkOpts {
  /** Culoarea capsulei. */
  bg?: string;
  /** Culoarea gravurii. */
  fg?: string;
  /** Punctul de la pinul 1 (colțul stânga-jos). */
  dot?: boolean;
  metal?: boolean;
  rough?: number;
  /** Crestătura de la capătul capsulelor DIP (în stânga). */
  notch?: boolean;
  mono?: boolean;
}

/**
 * Materialul feței de sus a unei capsule, cu textul gravat cu laser.
 * `w` × `l` sunt dimensiunile feței în mm, ca textul să nu iasă deformat.
 */
export function markMaterial(lines: string[] | undefined, w: number, l: number, o: MarkOpts = {}) {
  const key = JSON.stringify([lines, w, l, o]);
  const hit = markCache.get(key);
  if (hit) return hit;

  const ppm = Math.min(48, Math.max(20, 384 / Math.max(w, l)));
  const [c, g] = canvas(w * ppm, l * ppm);
  const W = c.width;
  const H = c.height;
  const bg = o.bg ?? '#161618';
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // zgomot fin, ca suprafața să nu fie perfect uniformă
  const r = rng(lines?.join('').length ?? 7);
  g.globalAlpha = o.metal ? 0.05 : 0.035;
  for (let i = 0; i < 260; i++) {
    g.fillStyle = r() > 0.5 ? '#ffffff' : '#000000';
    if (o.metal) g.fillRect(0, r() * H, W, 1);
    else g.fillRect(r() * W, r() * H, 1.5, 1.5);
  }
  g.globalAlpha = 1;

  const fg = o.fg ?? '#b9bbbd';
  g.fillStyle = fg;
  if (o.dot) {
    g.globalAlpha = 0.8;
    g.beginPath();
    g.arc(0.9 * ppm, H - 0.9 * ppm, Math.min(0.42 * ppm, H * 0.09), 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
  }
  if (o.notch) {
    g.fillStyle = '#0a0a0b';
    g.beginPath();
    g.arc(0, H / 2, Math.min(H * 0.16, 1.1 * ppm), -Math.PI / 2, Math.PI / 2);
    g.fill();
    g.fillStyle = fg;
  }

  if (lines?.length) {
    const fam = o.mono ? '"JetBrains Mono Variable", monospace' : '"Inter Variable", system-ui, sans-serif';
    const padX = (o.notch ? 0.16 : 0.1) * W;
    const availW = W - padX * 2;
    const availH = H * 0.72;
    let size = Math.min(availH / (lines.length * 1.22), 2.6 * ppm);
    g.font = `600 ${size}px ${fam}`;
    const widest = Math.max(...lines.map((s) => g.measureText(s).width));
    if (widest > availW) size *= availW / widest;
    g.font = `600 ${size}px ${fam}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.globalAlpha = 0.92;
    const lh = size * 1.22;
    const y0 = H / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((s, i) => g.fillText(s, W / 2, y0 + i * lh + size * 0.04));
    g.globalAlpha = 1;
  }

  const mat = new THREE.MeshStandardMaterial({
    map: finish(c),
    roughness: o.rough ?? (o.metal ? 0.32 : 0.58),
    metalness: o.metal ? 1 : 0,
  });
  markCache.set(key, mat);
  return mat;
}

// ───────────────────────── strălucirea unui LED ─────────────────────────

let glowTex: THREE.Texture | null = null;
export function glowTexture() {
  if (glowTex) return glowTex;
  const [c, g] = canvas(128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  glowTex = finish(c);
  return glowTex;
}

// ───────────────────────── fața de sus a unui header mamă ─────────────────────────

let socketTex: THREE.Texture | null = null;
/** O celulă de 2,54 mm cu gaura pătrată în pâlnie; se repetă pe toată lungimea. */
export function socketTexture() {
  if (socketTex) return socketTex;
  const [c, g] = canvas(64, 64);
  g.fillStyle = '#1b1b1d';
  g.fillRect(0, 0, 64, 64);
  g.strokeStyle = '#0c0c0d';
  g.lineWidth = 2;
  g.strokeRect(0, 0, 64, 64);
  const grad = g.createRadialGradient(32, 32, 4, 32, 32, 24);
  grad.addColorStop(0, '#000000');
  grad.addColorStop(0.45, '#070707');
  grad.addColorStop(0.5, '#3a3524');
  grad.addColorStop(0.62, '#141414');
  grad.addColorStop(1, '#262628');
  g.fillStyle = grad;
  g.fillRect(14, 14, 36, 36);
  socketTex = finish(c);
  socketTex.wrapS = socketTex.wrapT = THREE.RepeatWrapping;
  return socketTex;
}

// ───────────────────────── birou: lemn deschis ─────────────────────────

/** Lemn deschis (arțar/mesteacăn), repetabil. Acoperă `tile` mm. */
export function woodTexture(size = 1024) {
  const [c, g] = canvas(size, size);
  const r = rng(4242);
  g.fillStyle = '#d9bd92';
  g.fillRect(0, 0, size, size);

  // scânduri pe orizontală
  const planks = 4;
  const ph = size / planks;
  for (let p = 0; p < planks; p++) {
    const tint = (r() - 0.5) * 0.09;
    g.fillStyle = tint > 0 ? `rgba(255,240,210,${tint * 2})` : `rgba(120,80,30,${-tint * 2})`;
    g.fillRect(0, p * ph, size, ph);
    // fibre: linii lungi, ușor ondulate, periodice pe x ca textura să se repete curat
    for (let i = 0; i < 70; i++) {
      const y0 = p * ph + r() * ph;
      const amp = 1 + r() * 5;
      const freq = 1 + Math.floor(r() * 3);
      const phase = r() * Math.PI * 2;
      const dark = r() > 0.35;
      g.strokeStyle = dark ? `rgba(128,84,36,${0.05 + r() * 0.13})` : `rgba(255,242,214,${0.05 + r() * 0.12})`;
      g.lineWidth = 0.6 + r() * 2.2;
      g.beginPath();
      for (let x = 0; x <= size; x += 16) {
        const y = y0 + Math.sin((x / size) * Math.PI * 2 * freq + phase) * amp;
        if (x === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    // rostul dintre scânduri
    g.fillStyle = 'rgba(96,62,26,0.28)';
    g.fillRect(0, p * ph, size, 1.5);
    g.fillStyle = 'rgba(255,245,225,0.25)';
    g.fillRect(0, p * ph + 1.5, size, 1);
    // capătul unei scânduri, decalat de la rând la rând
    const cut = ((p * 0.37 + 0.2) % 1) * size;
    g.fillStyle = 'rgba(96,62,26,0.22)';
    g.fillRect(cut, p * ph, 1.5, ph);
  }
  const t = finish(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ───────────────────────── covoraș de tăiere ─────────────────────────

export const MAT_COLOR = '#67818d';

/** O celulă de 50 × 50 mm din grila covorașului: linii fine la 5 mm și 10 mm, linie groasă la 50 mm. */
export function cuttingMatTile(px = 512) {
  const [c, g] = canvas(px, px);
  g.fillStyle = MAT_COLOR;
  g.fillRect(0, 0, px, px);
  const r = rng(99);
  // textură mată, ușor granulată
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.022)' : 'rgba(0,0,0,0.03)';
    g.fillRect(r() * px, r() * px, 1.6, 1.6);
  }
  const mm = px / 50;
  const line = (pos: number, w: number, a: number) => {
    g.fillStyle = `rgba(226,238,242,${a})`;
    g.fillRect(pos * mm - w / 2, 0, w, px);
    g.fillRect(0, pos * mm - w / 2, px, w);
  };
  const k = px / 512;
  for (let i = 0; i < 50; i += 5) line(i, (i % 10 === 0 ? 1.2 : 1) * k, i % 10 === 0 ? 0.17 : 0.075);
  // linia mai groasă cade pe marginea celulei: jumătate într-o parte, jumătate în cealaltă
  line(0, 2.6 * k, 0.3);
  line(50, 2.6 * k, 0.3);
  // cruciuliță la mijlocul celulei
  g.fillStyle = 'rgba(226,238,242,0.3)';
  g.fillRect(25 * mm - 4 * k, 25 * mm - 0.8 * k, 8 * k, 1.6 * k);
  g.fillRect(25 * mm - 0.8 * k, 25 * mm - 4 * k, 1.6 * k, 8 * k);
  const t = finish(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Rigla tipărită pe marginea covorașului: gradații la 1 mm, cifre la fiecare 10 mm. */
export function rulerTexture(lengthMm: number, ppm: number) {
  const hmm = 9;
  const [c, g] = canvas(lengthMm * ppm, hmm * ppm);
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = 'rgba(232,242,245,0.8)';
  for (let i = 0; i <= lengthMm; i++) {
    const tall = i % 10 === 0 ? 3.2 : i % 5 === 0 ? 2.2 : 1.3;
    g.fillRect(i * ppm - 0.5, c.height - tall * ppm, Math.max(1, ppm * 0.16), tall * ppm);
  }
  g.font = `500 ${2.6 * ppm}px "JetBrains Mono Variable", monospace`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (let i = 10; i < lengthMm; i += 10) g.fillText(String(i / 10), i * ppm, 2.9 * ppm);
  return finish(c);
}

/** Umbră moale „de contact" sub o placă: un dreptunghi estompat. */
export function softShadowTexture() {
  const [c, g] = canvas(256, 256);
  g.clearRect(0, 0, 256, 256);
  // Fără ctx.filter (lipsește în Safari): straturi concentrice translucide dau aceeași estompare.
  for (let i = 0; i < 30; i++) {
    const inset = 14 + i * 2.6;
    g.fillStyle = 'rgba(30,22,10,0.045)';
    g.beginPath();
    g.roundRect(inset, inset, 256 - inset * 2, 256 - inset * 2, 34);
    g.fill();
  }
  return finish(c);
}
