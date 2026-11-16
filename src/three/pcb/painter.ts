import type { Vec2 } from '../../data/types';

/**
 * Desenează fața unui PCB pe canvas, în milimetri, cu axa y în sus.
 * În paralel ține (opțional) o a doua pânză cu rugozitate (canalul G) și metal (canalul B),
 * ca pad-urile aurite să lucească, iar silkscreen-ul să rămână mat.
 *
 * Amprentele pieselor se desenează în două treceri: întâi toate pad-urile, apoi tot
 * silkscreen-ul. Metodele `pad*` și `silk*` știu singure în ce trecere au voie să deseneze.
 */

export type Pass = 'pads' | 'silk';

export interface Palette {
  /** Mască peste cupru (zona de masă). */
  pour: string;
  /** Mască direct pe fibră: golurile dintre trasee. */
  gap: string;
  pad: string;
  silk: string;
  hole: string;
}

export const SILK_FONTS = {
  sans: '"Inter Variable", system-ui, sans-serif',
  mono: '"JetBrains Mono Variable", ui-monospace, monospace',
  serif: '"Fraunces Variable", Georgia, serif',
} as const;

interface Ink {
  color: string;
  rough: number;
  metal: number;
}

export class Painter {
  pass: Pass = 'pads';
  readonly canvas: HTMLCanvasElement;
  readonly pbrCanvas: HTMLCanvasElement | null;
  private ctxs: CanvasRenderingContext2D[] = [];
  private inks: Record<'pour' | 'gap' | 'pad' | 'silk' | 'hole', Ink>;

  constructor(
    readonly w: number,
    readonly h: number,
    readonly ppm: number,
    /** Fața de jos: x oglindit, ca placa să se citească corect după întoarcere. */
    readonly mirror: boolean,
    withPbr: boolean,
    readonly palette: Palette,
  ) {
    const W = Math.round(w * ppm);
    const H = Math.round(h * ppm);
    this.canvas = document.createElement('canvas');
    this.canvas.width = W;
    this.canvas.height = H;
    this.ctxs.push(this.canvas.getContext('2d')!);
    if (withPbr) {
      // Jumătate de rezoluție e de ajuns pentru luciu.
      this.pbrCanvas = document.createElement('canvas');
      this.pbrCanvas.width = Math.max(2, W >> 1);
      this.pbrCanvas.height = Math.max(2, H >> 1);
      this.ctxs.push(this.pbrCanvas.getContext('2d')!);
    } else {
      this.pbrCanvas = null;
    }
    this.ctxs.forEach((c, i) => {
      const k = i === 0 ? ppm : (ppm * c.canvas.width) / W;
      if (mirror) c.setTransform(-k, 0, 0, -k, c.canvas.width, c.canvas.height);
      else c.setTransform(k, 0, 0, -k, 0, c.canvas.height);
      c.lineJoin = 'round';
      c.lineCap = 'round';
    });
    this.inks = {
      pour: { color: palette.pour, rough: 0.34, metal: 0 },
      gap: { color: palette.gap, rough: 0.36, metal: 0 },
      pad: { color: palette.pad, rough: 0.3, metal: 1 },
      silk: { color: palette.silk, rough: 0.85, metal: 0 },
      hole: { color: palette.hole, rough: 0.9, metal: 0 },
    };
  }

  // ───────────────────────── cerneală și transformări ─────────────────────────

  ink(name: keyof Painter['inks'] | Ink): this {
    const k = typeof name === 'string' ? this.inks[name] : name;
    this.ctxs.forEach((c, i) => {
      const s = i === 0 ? k.color : `rgb(0,${Math.round(k.rough * 255)},${Math.round(k.metal * 255)})`;
      c.fillStyle = s;
      c.strokeStyle = s;
    });
    return this;
  }

  /** Rulează `fn` într-un reper local (poziție, rotație în grade, eventual oglindit). */
  at(x: number, y: number, rotDeg: number, fn: () => void, flip = false) {
    for (const c of this.ctxs) {
      c.save();
      c.translate(x, y);
      if (rotDeg) c.rotate((rotDeg * Math.PI) / 180);
      if (flip) c.scale(-1, 1);
    }
    fn();
    for (const c of this.ctxs) c.restore();
  }

  // ───────────────────────── primitive ─────────────────────────

  rect(cx: number, cy: number, w: number, h: number, r = 0) {
    for (const c of this.ctxs) {
      c.beginPath();
      if (r > 0) c.roundRect(cx - w / 2, cy - h / 2, w, h, Math.min(r, w / 2, h / 2));
      else c.rect(cx - w / 2, cy - h / 2, w, h);
      c.fill();
    }
  }

  circle(cx: number, cy: number, r: number) {
    for (const c of this.ctxs) {
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fill();
    }
  }

  poly(pts: Vec2[]) {
    for (const c of this.ctxs) {
      c.beginPath();
      pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.closePath();
      c.fill();
    }
  }

  stroke(pts: Vec2[], lw: number, closed = false) {
    for (const c of this.ctxs) {
      c.lineWidth = lw;
      c.beginPath();
      pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      if (closed) c.closePath();
      c.stroke();
    }
  }

  strokeRect(cx: number, cy: number, w: number, h: number, lw: number, r = 0) {
    for (const c of this.ctxs) {
      c.lineWidth = lw;
      c.beginPath();
      if (r > 0) c.roundRect(cx - w / 2, cy - h / 2, w, h, Math.min(r, w / 2, h / 2));
      else c.rect(cx - w / 2, cy - h / 2, w, h);
      c.stroke();
    }
  }

  strokeCircle(cx: number, cy: number, r: number, lw: number) {
    for (const c of this.ctxs) {
      c.lineWidth = lw;
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.stroke();
    }
  }

  /** Text cu înălțimea literei `size` (mm). Se citește corect și pe fața oglindită. */
  text(
    s: string,
    x: number,
    y: number,
    size: number,
    o: { rot?: number; align?: CanvasTextAlign; font?: keyof typeof SILK_FONTS; weight?: number; spacing?: number } = {},
  ) {
    const rot = ((o.rot ?? 0) * Math.PI) / 180;
    for (const c of this.ctxs) {
      c.save();
      c.translate(x, y);
      c.rotate(this.mirror ? -rot : rot);
      // Fontul e desenat la 100 px și micșorat prin transformare: evită rotunjirile la mărimi mici.
      const k = size / 100;
      c.scale(this.mirror ? -k : k, -k);
      c.font = `${o.weight ?? 600} 100px ${SILK_FONTS[o.font ?? 'sans']}`;
      c.textAlign = o.align ?? 'center';
      c.textBaseline = 'middle';
      if (o.spacing) (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${o.spacing * 100}px`;
      c.fillText(s, 0, 4);
      c.restore();
    }
  }

  // ───────────────────────── pad-uri (trecerea „pads") ─────────────────────────

  pad(cx: number, cy: number, w: number, h: number, r = 0.08) {
    if (this.pass !== 'pads') return;
    this.ink('pad').rect(cx, cy, w, h, r);
  }

  padCircle(cx: number, cy: number, r: number) {
    if (this.pass !== 'pads') return;
    this.ink('pad').circle(cx, cy, r);
  }

  /** Gaură metalizată pentru un pin through-hole: inel + gaură. */
  thru(cx: number, cy: number, drill = 1.0, ring = 1.75, square = false) {
    if (this.pass !== 'pads') return;
    this.ink('pad');
    if (square) this.rect(cx, cy, ring, ring, 0.1);
    else this.circle(cx, cy, ring / 2);
    this.ink('hole').circle(cx, cy, drill / 2);
  }

  /** Un rând de pad-uri SMD, centrat în (cx, cy), întins pe x. */
  padRow(cx: number, cy: number, n: number, pitch: number, w: number, h: number) {
    if (this.pass !== 'pads') return;
    const x0 = cx - ((n - 1) * pitch) / 2;
    for (let i = 0; i < n; i++) this.pad(x0 + i * pitch, cy, w, h);
  }

  /** Pad-uri pe cele patru laturi (QFN / QFP). `ex`/`ey` = distanța centrelor față de centru. */
  padQuad(nPerSide: number, pitch: number, ex: number, ey: number, padLen: number, padW: number) {
    if (this.pass !== 'pads') return;
    const o = ((nPerSide - 1) * pitch) / 2;
    for (let i = 0; i < nPerSide; i++) {
      const t = -o + i * pitch;
      this.pad(t, -ey, padW, padLen, 0.05);
      this.pad(t, ey, padW, padLen, 0.05);
      this.pad(-ex, t, padLen, padW, 0.05);
      this.pad(ex, t, padLen, padW, 0.05);
    }
  }

  // ───────────────────────── silkscreen (trecerea „silk") ─────────────────────────

  silkRect(cx: number, cy: number, w: number, h: number, lw = 0.15, r = 0) {
    if (this.pass !== 'silk') return;
    this.ink('silk').strokeRect(cx, cy, w, h, lw, r);
  }

  silkLine(pts: Vec2[], lw = 0.15, closed = false) {
    if (this.pass !== 'silk') return;
    this.ink('silk').stroke(pts, lw, closed);
  }

  silkDot(cx: number, cy: number, r = 0.2) {
    if (this.pass !== 'silk') return;
    this.ink('silk').circle(cx, cy, r);
  }

  silkText(s: string, x: number, y: number, size: number, o: Parameters<Painter['text']>[4] = {}) {
    if (this.pass !== 'silk') return;
    this.ink('silk').text(s, x, y, size, o);
  }

  /** Colțuri de contur (ca în jurul capsulelor BGA/QFN). */
  silkCorners(w: number, h: number, len = 0.8, lw = 0.15) {
    if (this.pass !== 'silk') return;
    const x = w / 2;
    const y = h / 2;
    for (const [sx, sy] of [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ] as Vec2[]) {
      this.silkLine(
        [
          [sx * (x - len), sy * y],
          [sx * x, sy * y],
          [sx * x, sy * (y - len)],
        ],
        lw,
      );
    }
  }
}

// ───────────────────────── utilitare ─────────────────────────

/** Generator pseudo-aleator determinist (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mută o linie frântă lateral cu distanța `d` (îmbinări în unghi), pentru trasee paralele. */
export function offsetPolyline(pts: Vec2[], d: number): Vec2[] {
  if (d === 0) return pts;
  const out: Vec2[] = [];
  const n = pts.length;
  const normal = (a: Vec2, b: Vec2): Vec2 => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return [-dy / len, dx / len];
  };
  for (let i = 0; i < n; i++) {
    const n0 = i > 0 ? normal(pts[i - 1], pts[i]) : null;
    const n1 = i < n - 1 ? normal(pts[i], pts[i + 1]) : null;
    let nx: number;
    let ny: number;
    if (n0 && n1) {
      const mx = n0[0] + n1[0];
      const my = n0[1] + n1[1];
      const ml = Math.hypot(mx, my) || 1;
      const cos = (mx / ml) * n0[0] + (my / ml) * n0[1];
      const k = 1 / Math.max(cos, 0.35);
      nx = (mx / ml) * k;
      ny = (my / ml) * k;
    } else {
      [nx, ny] = (n0 ?? n1)!;
    }
    out.push([pts[i][0] + nx * d, pts[i][1] + ny * d]);
  }
  return out;
}

/** Amestecă o culoare hex cu alb (t > 0) sau negru (t < 0). */
export function shade(hex: string, t: number): string {
  const v = parseInt(hex.slice(1), 16);
  const ch = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) =>
    Math.round(t >= 0 ? c + (255 - c) * t : c * (1 + t)),
  );
  return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
