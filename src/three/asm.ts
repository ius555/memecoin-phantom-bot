import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _s = new THREE.Vector3(1, 1, 1);
const _p = new THREE.Vector3();

export type Rot = [number, number, number];

/**
 * Asamblor de piese: adună geometrii simple și le contopește câte una pe material,
 * astfel încât o piesă întreagă costă doar câteva draw call-uri.
 *
 * Reper local al unei piese: x spre dreapta, y în sus (y = 0 e suprafața PCB-ului),
 * z spre privitor („fața" piesei / gura conectorului e la +z).
 */
export class Asm {
  private buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  private extras: THREE.Object3D[] = [];

  add(mat: THREE.Material, geo: THREE.BufferGeometry, x = 0, y = 0, z = 0, rot?: Rot): this {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    for (const name of Object.keys(g.attributes)) {
      if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
    }
    if (!g.getAttribute('uv')) {
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.getAttribute('position').count * 2), 2));
    }
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    g.morphAttributes = {};
    if (rot) _q.setFromEuler(_e.set(rot[0], rot[1], rot[2]));
    else _q.identity();
    g.applyMatrix4(_m.compose(_p.set(x, y, z), _q, _s));
    let b = this.buckets.get(mat);
    if (!b) this.buckets.set(mat, (b = []));
    b.push(g);
    return this;
  }

  /** Cutie centrată în (x, y, z). `r` = raza muchiilor rotunjite. */
  box(mat: THREE.Material, w: number, h: number, d: number, x = 0, y = 0, z = 0, r = 0, rot?: Rot): this {
    const rr = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
    const g = rr > 0.01 ? new RoundedBoxGeometry(w, h, d, 2, rr) : new THREE.BoxGeometry(w, h, d);
    return this.add(mat, g, x, y, z, rot);
  }

  /** Cilindru centrat în (x, y, z), cu axa pe `axis`. */
  cyl(
    mat: THREE.Material,
    rTop: number,
    rBot: number,
    h: number,
    x = 0,
    y = 0,
    z = 0,
    axis: 'x' | 'y' | 'z' = 'y',
    seg = 20,
  ): this {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);
    const rot: Rot | undefined = axis === 'x' ? [0, 0, -Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : undefined;
    return this.add(mat, g, x, y, z, rot);
  }

  /** Adaugă un obiect gata făcut (plan texturat, InstancedMesh etc.). */
  extra(obj: THREE.Object3D): this {
    this.extras.push(obj);
    return this;
  }

  build(): THREE.Group {
    const group = new THREE.Group();
    for (const [mat, geos] of this.buckets) {
      const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    for (const e of this.extras) group.add(e);
    return group;
  }
}

// ───────────────────────── forme 2D și extrudări ─────────────────────────

export function roundRectPath<T extends THREE.Path>(path: T, w: number, h: number, r: number, cx = 0, cy = 0): T {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const rr = Math.min(r, w / 2, h / 2);
  path.moveTo(x + rr, y);
  path.lineTo(x + w - rr, y);
  path.absarc(x + w - rr, y + rr, rr, -Math.PI / 2, 0, false);
  path.lineTo(x + w, y + h - rr);
  path.absarc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2, false);
  path.lineTo(x + rr, y + h);
  path.absarc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI, false);
  path.lineTo(x, y + rr);
  path.absarc(x + rr, y + rr, rr, Math.PI, Math.PI * 1.5, false);
  return path;
}

export function polyPath<T extends THREE.Path>(path: T, pts: [number, number][]): T {
  pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
  path.closePath();
  return path;
}

/**
 * Extrudează o formă din planul XY de-a lungul lui Z. Rezultatul ocupă z ∈ [zFront - depth, zFront],
 * adică fața formei ajunge la `zFront` (gura conectorului).
 */
export function extrudeZ(shape: THREE.Shape, depth: number, zFront: number, curveSegments = 8) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments });
  g.translate(0, 0, zFront - depth);
  return g;
}

/** Extrudează o formă din plan orizontal în sus: forma e dată în (x, y_sus = -z), înălțime `h` de la `y0`. */
export function extrudeUp(shape: THREE.Shape, h: number, y0 = 0, curveSegments = 10) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  return g;
}

/** Plan orizontal cu fața în sus, cu textura orientată „nordul în sus" (v crește spre -z). */
export function topPlane(w: number, l: number, y: number, mat: THREE.Material, x = 0, z = 0) {
  const g = new THREE.PlaneGeometry(w, l);
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  m.receiveShadow = true;
  return m;
}

/** InstancedMesh din poziții + scări opționale. */
export function instances(
  geo: THREE.BufferGeometry,
  mat: THREE.Material | THREE.Material[],
  items: { x: number; y: number; z: number; ry?: number; sx?: number; sy?: number; sz?: number }[],
  shadows = true,
) {
  const im = new THREE.InstancedMesh(geo, mat, items.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  items.forEach((it, i) => {
    q.setFromEuler(e.set(0, it.ry ?? 0, 0));
    m.compose(p.set(it.x, it.y, it.z), q, s.set(it.sx ?? 1, it.sy ?? 1, it.sz ?? 1));
    im.setMatrixAt(i, m);
  });
  im.instanceMatrix.needsUpdate = true;
  im.castShadow = shadows;
  im.receiveShadow = shadows;
  im.computeBoundingSphere();
  im.computeBoundingBox();
  return im;
}
