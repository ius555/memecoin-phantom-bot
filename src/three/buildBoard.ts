import * as THREE from 'three';
import type { BoardSpec, ComponentSpec, PassiveSpec, PcbArt, Vec2 } from '../data/types';
import { instances } from './asm';
import { MAT, PIN_COLORS } from './materials';
import { buildPart, passiveGeometry, type PartDef } from './parts';
import { buildPcbGeometry } from './pcb/geometry';
import { Painter, hashString, offsetPolyline, rng, shade, type Palette } from './pcb/painter';
import { QUALITY, type Quality } from './quality';

export interface PartInstance {
  spec: ComponentSpec;
  def: PartDef;
  /** Grupul piesei, copil al `model.root`, așezat la locul ei de pe placă. */
  object: THREE.Group;
  /** Poziția și orientarea „acasă" (lipită pe placă), în reperul plăcii. */
  home: { position: THREE.Vector3; quaternion: THREE.Quaternion };
  /** Punctul de care se leagă eticheta: centrul feței de sus, în reperul plăcii. */
  anchor: THREE.Vector3;
  /** Gabaritul în reperul plăcii. */
  box: THREE.Box3;
  bottom: boolean;
  /** Marcajele colorate ale pinilor (modul pinout). */
  caps?: THREE.Object3D;
  /** Intervalul din `model.solder` care aparține piesei: [start, count]. */
  solder?: [number, number];
}

export interface BoardModel {
  spec: BoardSpec;
  /** Reper local: centrul PCB-ului în origine, fața de sus la y = 0. */
  root: THREE.Group;
  parts: Map<string, PartInstance>;
  /** Punctele de cositor de pe spate, pentru pinii care trec prin placă. */
  solder: THREE.InstancedMesh | null;
  thickness: number;
  /** Raza sferei care cuprinde placa cu tot cu piese. */
  radius: number;
  /** Înălțimea celei mai înalte piese. */
  height: number;
  setPinout(on: boolean): void;
  /** Aprinde (0…1) LED-ul unei piese. */
  setLed(id: string, level: number): void;
  /** Cel mai apropiat pin de un punct din reperul plăcii, dacă piesa are pini. */
  pinAt(partId: string, local: THREE.Vector3): number;
  dispose(): void;
}

const deg = Math.PI / 180;

function rotate([x, y]: Vec2, rotDeg: number): Vec2 {
  const a = rotDeg * deg;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c - y * s, x * s + y * c];
}

// ───────────────────────── marcaje de pini ─────────────────────────

let capGeo: THREE.BufferGeometry | null = null;
let altGeo: THREE.BufferGeometry | null = null;
const capMat = new THREE.MeshBasicMaterial({ toneMapped: false });

function capGeometry() {
  if (!capGeo) {
    const s = new THREE.Shape();
    const a = 1.17;
    s.moveTo(-a, -a).lineTo(a, -a).lineTo(a, a).lineTo(-a, a).closePath();
    const hole = new THREE.Path();
    const b = 0.5;
    hole.moveTo(-b, -b).lineTo(-b, b).lineTo(b, b).lineTo(b, -b).closePath();
    s.holes.push(hole);
    capGeo = new THREE.ShapeGeometry(s);
    capGeo.rotateX(-Math.PI / 2);
    capGeo.userData.shared = true;
    const t = new THREE.Shape();
    t.moveTo(a, a).lineTo(a - 1.25, a).lineTo(a, a - 1.25).closePath();
    altGeo = new THREE.ShapeGeometry(t);
    altGeo.rotateX(-Math.PI / 2);
    altGeo.translate(0, 0.02, 0);
    altGeo.userData.shared = true;
  }
  return [capGeo, altGeo!] as const;
}

function buildCaps(spec: ComponentSpec, def: PartDef): THREE.Object3D | undefined {
  if (!def.pinSlots || !spec.pins?.length) return undefined;
  const [cg, ag] = capGeometry();
  const g = new THREE.Group();
  const slots = def.pinSlots.at.slice(0, spec.pins.length);
  const main = instances(
    cg,
    capMat,
    slots.map(([x, y]) => ({ x, y: def.pinSlots!.y, z: -y })),
    false,
  );
  const col = new THREE.Color();
  spec.pins.forEach((p, i) => main.setColorAt(i, col.set(PIN_COLORS[p.fn])));
  main.instanceColor!.needsUpdate = true;
  g.add(main);
  const withAlt = spec.pins.map((p, i) => ({ p, i })).filter(({ p }) => p.alt);
  if (withAlt.length) {
    const alt = instances(
      ag,
      capMat,
      withAlt.map(({ i }) => ({ x: slots[i][0], y: def.pinSlots!.y, z: -slots[i][1] })),
      false,
    );
    withAlt.forEach(({ p }, k) => alt.setColorAt(k, col.set(PIN_COLORS[p.alt!])));
    alt.instanceColor!.needsUpdate = true;
    g.add(alt);
  }
  g.visible = false;
  return g;
}

// ───────────────────────── desenul PCB-ului ─────────────────────────

function drawArt(p: Painter, art: PcbArt[] | undefined, side: 'top' | 'bottom') {
  for (const a of art ?? []) {
    if ((a.side ?? 'top') !== side) continue;
    switch (a.t) {
      case 'text':
        p.silkText(a.s, a.at[0], a.at[1], a.size, { rot: a.rot, align: a.align, font: a.font, weight: a.weight });
        break;
      case 'line':
        p.silkLine(a.pts, a.w ?? 0.15);
        break;
      case 'rect':
        if (p.pass !== 'silk') break;
        if (a.fill) p.ink('silk').rect(a.at[0], a.at[1], a.size[0], a.size[1], a.r ?? 0);
        else p.silkRect(a.at[0], a.at[1], a.size[0], a.size[1], a.w ?? 0.15, a.r ?? 0);
        break;
      case 'circle':
        if (p.pass !== 'silk') break;
        if (a.fill) p.ink('silk').circle(a.at[0], a.at[1], a.r);
        else p.ink('silk').strokeCircle(a.at[0], a.at[1], a.r, a.w ?? 0.15);
        break;
      case 'bare':
        if (p.pass === 'pads') p.ink('gap').poly(a.pts);
        break;
      case 'copper':
        if (p.pass !== 'pads') break;
        if (a.w) p.ink('pad').stroke(a.pts, a.w);
        else p.ink('pad').poly(a.pts);
        break;
    }
  }
}

interface Placed {
  spec: ComponentSpec;
  def: PartDef;
}

function paintSide(p: Painter, board: BoardSpec, placed: Placed[], passives: Required<PassiveSpec>[], side: 'top' | 'bottom') {
  const { pcb } = board;
  const { w, h } = pcb;
  const rand = rng(hashString(board.id + side));
  const onSide = (s?: 'top' | 'bottom') => (s ?? 'top') === side;

  p.ink('pour').rect(w / 2, h / 2, w, h);

  // 1. trasee: întâi toate golurile, apoi toate firele — intersecțiile ies curate
  const lines: { pts: Vec2[]; w: number }[] = [];
  for (const t of pcb.traces ?? []) {
    if (!onSide(t.side)) continue;
    const n = t.n ?? 1;
    const pitch = t.pitch ?? 0.45;
    for (let i = 0; i < n; i++) lines.push({ pts: offsetPolyline(t.pts, (i - (n - 1) / 2) * pitch), w: t.w ?? 0.16 });
  }
  const vias: Vec2[] = [];
  // evantaie scurte de trasee în jurul circuitelor integrate
  for (const { spec, def } of placed) {
    if (!onSide(spec.side) || spec.model.kind !== 'chip') continue;
    if (!['bga', 'bga-lid', 'qfn', 'qfp'].includes(spec.model.pkg)) continue;
    const b = def.bounds;
    const sides: [Vec2, Vec2, number][] = [
      [[b.x0, b.y1], [1, 0], b.x1 - b.x0],
      [[b.x0, b.y0], [1, 0], b.x1 - b.x0],
      [[b.x0, b.y0], [0, 1], b.y1 - b.y0],
      [[b.x1, b.y0], [0, 1], b.y1 - b.y0],
    ];
    sides.forEach(([o, d, len], si) => {
      const out: Vec2 = si === 0 ? [0, 1] : si === 1 ? [0, -1] : si === 2 ? [-1, 0] : [1, 0];
      const count = Math.floor(len / 0.95);
      for (let i = 0; i < count; i++) {
        if (rand() < 0.3) continue;
        const s = 0.6 + i * ((len - 1.2) / Math.max(1, count - 1));
        const a: Vec2 = [o[0] + d[0] * s, o[1] + d[1] * s];
        const l1 = 0.7 + rand() * 2.4;
        const l2 = rand() * 1.6;
        const dir = rand() > 0.5 ? 1 : -1;
        const b1: Vec2 = [a[0] + out[0] * l1, a[1] + out[1] * l1];
        const b2: Vec2 = [b1[0] + (out[0] + d[0] * dir) * l2, b1[1] + (out[1] + d[1] * dir) * l2];
        const world = [a, b1, b2].map((q) => {
          const r = rotate(q, spec.rot ?? 0);
          return [spec.at[0] + r[0], spec.at[1] + r[1]] as Vec2;
        });
        lines.push({ pts: world, w: 0.14 });
        vias.push(world[2]);
      }
    });
  }
  p.ink('gap');
  for (const l of lines) p.stroke(l.pts, l.w + 0.3);
  p.ink('pour');
  for (const l of lines) p.stroke(l.pts, l.w);

  // 2. via-uri: cele de la capetele traseelor + câteva presărate
  const extra = Math.round((w * h) / 34);
  for (let i = 0; i < extra; i++) vias.push([1.5 + rand() * (w - 3), 1.5 + rand() * (h - 3)]);
  for (const [x, y] of vias) {
    p.ink('gap').circle(x, y, 0.4);
    p.ink('pour').circle(x, y, 0.29);
    p.ink('gap').circle(x, y, 0.12);
  }

  // 3. pad-uri, apoi silkscreen
  for (const pass of ['pads', 'silk'] as const) {
    p.pass = pass;
    drawArt(p, pcb.art, side);
    for (const { spec, def } of placed) {
      const rot = spec.rot ?? 0;
      if (onSide(spec.side)) {
        if (def.footprint) p.at(spec.at[0], spec.at[1], rot, () => def.footprint!(p), side === 'bottom');
      } else if (def.thru) {
        // pinii care trec prin placă se văd și pe fața opusă
        for (const t of def.thru) {
          const r = rotate(t, rot);
          p.thru(spec.at[0] + r[0], spec.at[1] + r[1], 0.9, 1.7);
        }
      }
      if (pass === 'silk' && spec.ref && onSide(spec.side)) {
        const b = def.bounds;
        const corners = (
          [
            [b.x0, b.y0],
            [b.x1, b.y0],
            [b.x0, b.y1],
            [b.x1, b.y1],
          ] as Vec2[]
        ).map((c) => rotate(c, rot));
        const minX = Math.min(...corners.map((c) => c[0]));
        const maxY = Math.max(...corners.map((c) => c[1]));
        const minY = Math.min(...corners.map((c) => c[1]));
        // indicativul stă deasupra piesei; dacă nu mai e loc pe placă, coboară sub ea
        const above = spec.at[1] + maxY + 1.5 < h;
        const ty = above ? spec.at[1] + maxY + 0.85 : spec.at[1] + minY - 0.85;
        p.silkText(spec.ref, Math.max(0.6, spec.at[0] + minX + 0.2), ty, 0.85, { align: 'left', font: 'mono', weight: 500 });
      }
    }
    for (const ps of passives) {
      if (ps.side !== side) continue;
      const [L, , W] = passiveGeometry(ps.kind).size;
      p.at(ps.at[0], ps.at[1], ps.rot, () => {
        p.pad(-L / 2 + L * 0.16, 0, L * 0.4, W + 0.12);
        p.pad(L / 2 - L * 0.16, 0, L * 0.4, W + 0.12);
      });
    }
    if (pass === 'pads') {
      for (const hole of pcb.holes) if (hole.ring) p.ink('pad').circle(hole.at[0], hole.at[1], hole.ring / 2);
    }
  }
}

function pcbMaterial(p: Painter) {
  const map = new THREE.CanvasTexture(p.canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const mat = new THREE.MeshStandardMaterial({ map, roughness: 0.36, metalness: 0 });
  if (p.pbrCanvas) {
    const pbr = new THREE.CanvasTexture(p.pbrCanvas);
    pbr.anisotropy = 4;
    mat.roughnessMap = pbr;
    mat.metalnessMap = pbr;
    mat.roughness = 1;
    mat.metalness = 1;
  }
  return mat;
}

// ───────────────────────── placa întreagă ─────────────────────────

export function buildBoard(spec: BoardSpec, quality: Quality = QUALITY): BoardModel {
  const { pcb } = spec;
  const { w, h } = pcb;
  const root = new THREE.Group();
  root.name = spec.id;
  const own = new Set<THREE.Material>();

  // piesele
  const placed: Placed[] = spec.components.map((c) => ({ spec: c, def: buildPart(c.model) }));

  // pasivele, desfăcute din rânduri
  const passives: Required<PassiveSpec>[] = [];
  for (const ps of spec.passives ?? []) {
    const n = ps.n ?? 1;
    const step = ps.step ?? [0, 0];
    for (let i = 0; i < n; i++) {
      passives.push({
        kind: ps.kind,
        at: [ps.at[0] + step[0] * i, ps.at[1] + step[1] * i],
        rot: ps.rot ?? 0,
        side: ps.side ?? 'top',
        n: 1,
        step: [0, 0],
      });
    }
  }

  // PCB: texturi + geometrie
  const ppm = Math.min(quality.ppm, quality.maxTex / Math.max(w, h));
  const palette: Palette = {
    pour: pcb.color,
    gap: shade(pcb.color, -0.24),
    pad: quality.pbr ? '#ecbb5e' : '#cfa650',
    silk: '#f3f1e8',
    hole: '#14100c',
  };
  const geo = buildPcbGeometry(pcb);
  const t = geo.thickness;
  const topP = new Painter(w, h, ppm, false, quality.pbr, palette);
  const botP = new Painter(w, h, ppm, true, quality.pbr, palette);
  paintSide(topP, spec, placed, passives, 'top');
  paintSide(botP, spec, placed, passives, 'bottom');
  const topMat = pcbMaterial(topP);
  const botMat = pcbMaterial(botP);
  own.add(topMat).add(botMat);
  const pcbGroup = new THREE.Group();
  for (const [g, m] of [
    [geo.top, topMat],
    [geo.bottom, botMat],
    [geo.walls, MAT.fr4Edge],
  ] as const) {
    const mesh = new THREE.Mesh(g, m);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.pcb = true;
    pcbGroup.add(mesh);
  }
  root.add(pcbGroup);

  // așezarea pieselor
  const parts = new Map<string, PartInstance>();
  const flipZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
  const yAxis = new THREE.Vector3(0, 1, 0);
  const joints: { x: number; z: number }[] = [];
  let height = 0;
  let reach = Math.hypot(w, h) / 2;

  for (const { spec: c, def } of placed) {
    const bottom = c.side === 'bottom';
    const rot = c.rot ?? 0;
    const X = c.at[0] - w / 2;
    const Z = -(c.at[1] - h / 2);
    const g = new THREE.Group();
    g.name = c.id;
    g.add(def.object);
    g.position.set(X, bottom ? -t : 0, Z);
    g.quaternion.setFromAxisAngle(yAxis, rot * deg);
    if (bottom) g.quaternion.multiply(flipZ);

    // gabarit în reperul plăcii
    const b = def.bounds;
    const corners = (
      [
        [b.x0, b.y0],
        [b.x1, b.y0],
        [b.x0, b.y1],
        [b.x1, b.y1],
      ] as Vec2[]
    ).map((q) => rotate(bottom ? [-q[0], q[1]] : q, rot));
    const xs = corners.map((q) => q[0]);
    const ys = corners.map((q) => q[1]);
    const box = new THREE.Box3(
      new THREE.Vector3(X + Math.min(...xs), bottom ? -t - b.h : 0, Z - Math.max(...ys)),
      new THREE.Vector3(X + Math.max(...xs), bottom ? -t : b.h, Z - Math.min(...ys)),
    );
    const anchor = new THREE.Vector3((box.min.x + box.max.x) / 2, bottom ? box.min.y : box.max.y, (box.min.z + box.max.z) / 2);
    if (!bottom) height = Math.max(height, b.h);
    for (const cx of [box.min.x, box.max.x]) for (const cz of [box.min.z, box.max.z]) reach = Math.max(reach, Math.hypot(cx, cz));

    const inst: PartInstance = {
      spec: c,
      def,
      object: g,
      home: { position: g.position.clone(), quaternion: g.quaternion.clone() },
      anchor,
      box,
      bottom,
    };

    const caps = buildCaps(c, def);
    if (caps) {
      g.add(caps);
      inst.caps = caps;
    }
    if (def.led) own.add(def.led.lens).add(def.led.glow.material);

    if (def.thru && !bottom) {
      inst.solder = [joints.length, def.thru.length];
      for (const th of def.thru) {
        const r = rotate(th, rot);
        joints.push({ x: X + r[0], z: Z - r[1] });
      }
    }

    // piesele de decor nu primesc id: la atingere se comportă ca PCB-ul
    if (!c.decor) g.traverse((o) => (o.userData.partId = c.id));
    root.add(g);
    parts.set(c.id, inst);
  }

  // punctele de cositor de pe spate
  let solder: THREE.InstancedMesh | null = null;
  if (joints.length) {
    solder = instances(
      solderGeometry(),
      MAT.solder,
      joints.map((j) => ({ x: j.x, y: -t, z: j.z })),
      false,
    );
    solder.userData.pcb = true;
    root.add(solder);
  }

  // pasivele: un InstancedMesh pentru fiecare tip și față
  const groups = new Map<string, Required<PassiveSpec>[]>();
  for (const ps of passives) {
    const key = `${ps.kind}|${ps.side}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ps);
  }
  for (const [key, list] of groups) {
    const [kind, side] = key.split('|') as [PassiveSpec['kind'], 'top' | 'bottom'];
    const pg = passiveGeometry(kind);
    pg.geo.userData.shared = true;
    const im = new THREE.InstancedMesh(pg.geo, pg.mats, list.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);
    const pos = new THREE.Vector3();
    list.forEach((ps, i) => {
      q.setFromAxisAngle(yAxis, ps.rot * deg);
      if (side === 'bottom') q.multiply(flipZ);
      m.compose(pos.set(ps.at[0] - w / 2, side === 'bottom' ? -t : 0, -(ps.at[1] - h / 2)), q, one);
      im.setMatrixAt(i, m);
    });
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = false;
    im.receiveShadow = true;
    im.userData.pcb = true;
    im.computeBoundingSphere();
    root.add(im);
  }

  const inv = new THREE.Matrix4();
  const tmp = new THREE.Vector3();

  return {
    spec,
    root,
    parts,
    solder,
    thickness: t,
    radius: reach,
    height,
    setPinout(on) {
      for (const p of parts.values()) if (p.caps) p.caps.visible = on;
    },
    setLed(id, level) {
      const led = parts.get(id)?.def.led;
      if (!led) return;
      led.lens.emissiveIntensity = level * 3;
      led.glow.visible = level > 0.01;
      led.glow.material.opacity = level * 0.85;
    },
    pinAt(partId, local) {
      const p = parts.get(partId);
      if (!p?.def.pinSlots || !p.spec.pins) return -1;
      inv.compose(p.object.position, p.object.quaternion, p.object.scale).invert();
      tmp.copy(local).applyMatrix4(inv);
      let best = -1;
      let bestD = 2.2 * 2.2;
      p.def.pinSlots.at.forEach(([x, y], i) => {
        if (i >= p.spec.pins!.length) return;
        const d = (tmp.x - x) ** 2 + (tmp.z + y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    },
    dispose() {
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry && !mesh.geometry.userData.shared) mesh.geometry.dispose();
      });
      for (const m of own) {
        const sm = m as THREE.MeshStandardMaterial;
        if (sm === topMat || sm === botMat) {
          sm.map?.dispose();
          sm.roughnessMap?.dispose();
        }
        m.dispose();
      }
    },
  };
}

let solderGeo: THREE.BufferGeometry | null = null;
function solderGeometry() {
  if (!solderGeo) {
    solderGeo = new THREE.CylinderGeometry(0.72, 0.24, 0.8, 10);
    solderGeo.translate(0, -0.4, 0);
    solderGeo.userData.shared = true;
  }
  return solderGeo;
}
