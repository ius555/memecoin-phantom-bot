import * as THREE from 'three';
import type { PcbSpec, Vec2 } from '../../data/types';
import { polyPath, roundRectPath } from '../asm';

/** Conturul plăcii ca formă 2D, cu găurile de montaj decupate. Coordonate în mm, origine stânga-jos. */
export function pcbShape(spec: PcbSpec): THREE.Shape {
  const s = new THREE.Shape();
  if (spec.outline) polyPath(s, spec.outline);
  else roundRectPath(s, spec.w, spec.h, spec.radius ?? 0.01, spec.w / 2, spec.h / 2);
  for (const h of spec.holes) {
    const p = new THREE.Path();
    p.absarc(h.at[0], h.at[1], h.d / 2, 0, Math.PI * 2, true);
    s.holes.push(p);
  }
  return s;
}

function signedArea(pts: THREE.Vector2[]) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

function cleanLoop(pts: THREE.Vector2[], ccw: boolean) {
  const out = pts.filter((p, i) => i === 0 || p.distanceToSquared(pts[i - 1]) > 1e-8);
  if (out.length > 1 && out[0].distanceToSquared(out[out.length - 1]) < 1e-8) out.pop();
  if (signedArea(out) > 0 !== ccw) out.reverse();
  return out;
}

/**
 * Geometria unui PCB: fața de sus, fața de jos și pereții (marginea + interiorul găurilor).
 * Reper local: centrul plăcii în origine, fața de sus la y = 0, fața de jos la y = -t.
 */
export function buildPcbGeometry(spec: PcbSpec) {
  const { w, h } = spec;
  const t = spec.thickness ?? 1.6;
  const shape = pcbShape(spec);

  const flat = new THREE.ShapeGeometry(shape, 10);
  const pos = flat.getAttribute('position');
  const n = pos.count;

  const mk = (y: number, up: boolean) => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(n * 3);
    const nor = new Float32Array(n * 3);
    const uv = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const x = pos.getX(i);
      const yy = pos.getY(i);
      p[i * 3] = x - w / 2;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = -(yy - h / 2);
      nor[i * 3 + 1] = up ? 1 : -1;
      // fața de jos e desenată oglindit (vezi Painter.mirror)
      uv[i * 2] = up ? x / w : 1 - x / w;
      uv[i * 2 + 1] = yy / h;
    }
    const idx = Array.from(flat.index!.array);
    // ShapeGeometry e orientată spre +z; după culcare, triunghiurile privesc în sus.
    if (!up) for (let i = 0; i < idx.length; i += 3) [idx[i], idx[i + 2]] = [idx[i + 2], idx[i]];
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  };

  const top = mk(0, true);
  const bottom = mk(-t, false);
  flat.dispose();

  // pereții
  const P: number[] = [];
  const N: number[] = [];
  const loops = [cleanLoop(shape.getPoints(10), true), ...shape.holes.map((hl) => cleanLoop(hl.getPoints(14), false))];
  for (const loop of loops) {
    const m = loop.length;
    const segN: Vec2[] = loop.map((a, i) => {
      const b = loop[(i + 1) % m];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      return [dy / len, -dx / len];
    });
    const blend = (a: Vec2, b: Vec2): Vec2 => {
      if (a[0] * b[0] + a[1] * b[1] < 0.8) return a;
      const x = a[0] + b[0];
      const y = a[1] + b[1];
      const len = Math.hypot(x, y) || 1;
      return [x / len, y / len];
    };
    for (let i = 0; i < m; i++) {
      const a = loop[i];
      const b = loop[(i + 1) % m];
      const na = blend(segN[i], segN[(i - 1 + m) % m]);
      const nb = blend(segN[i], segN[(i + 1) % m]);
      const A = [a.x - w / 2, -(a.y - h / 2)];
      const B = [b.x - w / 2, -(b.y - h / 2)];
      // două triunghiuri: (A sus, B sus, B jos) și (A sus, B jos, A jos) — orientate spre exterior
      const quad: [number[], number, Vec2][] = [
        [A, 0, na],
        [A, -t, na],
        [B, -t, nb],
        [A, 0, na],
        [B, -t, nb],
        [B, 0, nb],
      ];
      for (const [pt, y, nn] of quad) {
        P.push(pt[0], y, pt[1]);
        N.push(nn[0], 0, -nn[1]);
      }
    }
  }
  const walls = new THREE.BufferGeometry();
  walls.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  walls.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));

  return { top, bottom, walls, thickness: t };
}
