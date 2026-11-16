import * as THREE from 'three';
import { BAND_HEX, resistorBands } from '../lib/resistor';
import { Asm, extrudeUp, roundRectPath } from './asm';
import { MAT } from './materials';
import { QUALITY } from './quality';
import { MAT_COLOR, cuttingMatTile, rulerTexture, woodTexture } from './textures';

/** Biroul, covorașul de tăiere și recuzita. Totul e static și construit o singură dată. */

export const DESK_TOP = -3;
export const MAT_SIZE: [number, number] = [450, 300];

const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);

function shadowed<T extends THREE.Object3D>(o: T, cast = true, receive = true): T {
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = cast;
      m.receiveShadow = receive;
    }
  });
  return o;
}

// ───────────────────────── birou + covoraș ─────────────────────────

function buildDeskTop() {
  const wood = woodTexture(QUALITY.name === 'high' ? 1024 : 512);
  const W = 1900;
  const D = 1100;
  const tile = 420;
  const top = wood.clone();
  top.repeat.set(W / tile, D / tile);
  top.needsUpdate = true;
  const side = wood.clone();
  side.repeat.set(W / tile, 40 / tile);
  side.needsUpdate = true;
  const topMat = std({ map: top, roughness: 0.52 });
  const sideMat = std({ map: side, roughness: 0.6, color: 0xe8dcc6 });
  const desk = new THREE.Mesh(new THREE.BoxGeometry(W, 40, D), [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]);
  desk.position.y = DESK_TOP - 20;
  desk.receiveShadow = true;
  return desk;
}

function printed(tex: THREE.Texture, w: number, h: number) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    std({ map: tex, transparent: true, roughness: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
  );
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}

function matLabelTexture(text: string) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 48;
  const g = c.getContext('2d')!;
  g.fillStyle = 'rgba(232,242,245,0.75)';
  g.font = '500 26px "JetBrains Mono Variable", monospace';
  g.textBaseline = 'middle';
  (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '5px';
  g.fillText(text, 4, 25);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function buildMat() {
  const [W, D] = MAT_SIZE;
  const g = new THREE.Group();
  const tile = cuttingMatTile(QUALITY.name === 'high' ? 512 : 256);
  tile.repeat.set(1 / 50, 1 / 50);
  const shape = roundRectPath(new THREE.Shape(), W, D, 12);
  const geo = extrudeUp(shape, 3, DESK_TOP + 0.02, 6);
  const mat = new THREE.Mesh(geo, [std({ map: tile, roughness: 0.88 }), std({ color: MAT_COLOR, roughness: 0.9 })]);
  mat.receiveShadow = true;
  mat.castShadow = true;
  g.add(mat);

  // chenarul tipărit și riglele de pe margini
  const ppm = QUALITY.name === 'high' ? 6 : 4;
  const rulerLen = W - 40;
  const topRuler = printed(rulerTexture(rulerLen, ppm), rulerLen, 9);
  topRuler.position.set(0, 0.05, -D / 2 + 9);
  g.add(topRuler);
  const sideLen = D - 40;
  const sideRuler = printed(rulerTexture(sideLen, ppm), sideLen, 9);
  sideRuler.rotation.z = Math.PI / 2;
  sideRuler.position.set(-W / 2 + 9, 0.05, 0);
  g.add(sideRuler);
  const label = printed(matLabelTexture('LABORATORUL DE ROBOTICĂ  ·  A3  ·  450 × 300 MM'), 128, 6);
  label.position.set(W / 2 - 80, 0.05, D / 2 - 8);
  g.add(label);
  return g;
}

// ───────────────────────── cana ─────────────────────────

function buildMug() {
  const g = new THREE.Group();
  const ceramic = std({ color: 0xf5f2ea, roughness: 0.2 });
  const profile = [
    [0, 0],
    [34, 0],
    [37, 1.6],
    [39.5, 6],
    [40.5, 84],
    [40.8, 88.5],
    [39.6, 90],
    [38.2, 88.8],
    [37.2, 10],
    [34, 5.5],
    [0, 5.5],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 56), ceramic));
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(37.6, 48), std({ color: 0x2a160b, roughness: 0.12 }));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 74;
  g.add(coffee);
  const curve = new THREE.CatmullRomCurve3(
    [
      [38, 70],
      [52, 72],
      [64, 62],
      [67, 46],
      [61, 30],
      [48, 21],
      [38, 22],
    ].map(([x, y]) => new THREE.Vector3(x, y, 0)),
  );
  const handle = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 5.6, 14), ceramic);
  handle.scale.z = 0.72;
  g.add(handle);
  return shadowed(g);
}

// ───────────────────────── LED de 5 mm ─────────────────────────

function buildLed5mm(color = 0xdc2f25) {
  const g = new THREE.Group();
  const lens = std({ color, roughness: 0.1, transparent: true, opacity: 0.78, emissive: color, emissiveIntensity: 0.06 });
  const profile: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(2.9, 0), new THREE.Vector2(2.9, 1), new THREE.Vector2(2.5, 1), new THREE.Vector2(2.5, 6.2)];
  for (let i = 1; i <= 10; i++) {
    const a = (i / 10) * (Math.PI / 2);
    profile.push(new THREE.Vector2(Math.cos(a) * 2.5, 6.2 + Math.sin(a) * 2.5));
  }
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 28), lens);
  body.castShadow = true;
  g.add(body);
  const a = new Asm();
  // nicovala și stâlpul din interior, apoi picioarele (anodul e mai lung)
  a.box(MAT.steelDark, 0.45, 3.4, 1.9, 0, 3.6, 0.85);
  a.box(MAT.steelDark, 0.45, 2.4, 0.9, 0, 3.1, -1.1);
  a.box(MAT.tin, 0.5, 27, 0.5, 0, -13.5, 1.27);
  a.box(MAT.tin, 0.5, 25, 0.5, 0, -12.5, -1.27);
  g.add(a.build());
  return g;
}

// ───────────────────────── rezistență axială ─────────────────────────

const bandMats = new Map<string, THREE.MeshStandardMaterial>();
function bandMat(hex: string) {
  let m = bandMats.get(hex);
  if (!m) bandMats.set(hex, (m = std({ color: hex, roughness: 0.45 })));
  return m;
}

/** Rezistență de 0,25 W culcată pe x, cu benzile corecte pentru valoarea dată. */
export function buildResistor(ohms: number, tolerance = 5) {
  const g = new THREE.Group();
  const bodyMat = bandMat(tolerance <= 2 ? '#7fb2cf' : '#dcc59a');
  const profile = [
    [0, -3.15],
    [0.9, -3.15],
    [1.25, -2.8],
    [1.25, -1.95],
    [1.05, -1.5],
    [1.05, 1.5],
    [1.25, 1.95],
    [1.25, 2.8],
    [0.9, 3.15],
    [0, 3.15],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const a = new Asm();
  a.add(bodyMat, new THREE.LatheGeometry(profile, 20), 0, 0, 0, [0, 0, -Math.PI / 2]);
  a.cyl(MAT.tin, 0.3, 0.3, 62, 0, 0, 0, 'x', 10);
  const bands = resistorBands(ohms, tolerance);
  const n = bands.length;
  // prima bandă stă pe umărul gros, ultima (toleranța) pe umărul opus
  const xs = n === 4 ? [-2.38, -1.05, -0.2, 2.38] : [-2.38, -1.2, -0.45, 0.3, 2.38];
  bands.forEach((b, i) => {
    const fat = i === 0 || i === n - 1;
    a.cyl(bandMat(BAND_HEX[b]), fat ? 1.275 : 1.075, fat ? 1.275 : 1.075, fat ? 0.7 : 0.55, xs[i], 0, 0, 'x', 20);
  });
  g.add(a.build());
  g.position.y = 1.28;
  return g;
}

// ───────────────────────── cablu USB-C alb ─────────────────────────

function buildUsbCable() {
  const g = new THREE.Group();
  const white = std({ color: 0xf1efe8, roughness: 0.42 });
  const r = 1.9;
  const yDesk = DESK_TOP + r;
  const pts: [number, number, number][] = [
    [-560, yDesk, -470],
    [-470, yDesk, -330],
    [-370, yDesk, -250],
    [-300, yDesk, -205],
    [-245, yDesk + 1.2, -168],
    [-215, r, -146],
    [-178, r, -112],
    [-158, r, -62],
    [-170, r, -10],
    [-160, r, 34],
    [-128, r, 46],
  ];
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 120, r, 10), white));

  // mufa: manșon de protecție, corp turnat și vârful metalic
  const end = curve.getPoint(1);
  const tan = curve.getTangent(1).setY(0).normalize();
  const plug = new THREE.Group();
  const a = new Asm();
  a.cyl(white, 2.1, 3.1, 9, 0, 0, 4.5, 'z', 16);
  a.box(white, 12.2, 6.4, 19, 0, 0, 18.5, 2.6);
  plug.add(a.build());
  const tip = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundRectPath(new THREE.Shape(), 8.25, 2.4, 1.2), { depth: 6.6, bevelEnabled: false, curveSegments: 8 }),
    MAT.steel,
  );
  tip.position.z = 28;
  plug.add(tip);
  const tipHole = new THREE.Mesh(new THREE.PlaneGeometry(6.9, 1.2), MAT.dark);
  tipHole.position.z = 34.62;
  plug.add(tipHole);
  plug.position.copy(end).setY(3.3);
  plug.rotation.y = Math.atan2(tan.x, tan.z);
  g.add(plug);
  return shadowed(g);
}

// ───────────────────────── sondele multimetrului ─────────────────────────

function buildProbe(color: number, cablePts: [number, number, number][]) {
  const g = new THREE.Group();
  const body = std({ color, roughness: 0.48 });
  // profilul mânerului, de-a lungul axei: vârful e spre -y
  const profile = [
    [0, 0],
    [2.0, 0],
    [3.2, 6],
    [3.6, 20],
    [6.2, 22],
    [6.2, 24.5],
    [4.2, 26.5],
    [4.6, 34],
    [4.8, 70],
    [4.2, 84],
    [3.0, 92],
    [2.0, 100],
    [0, 100],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const probe = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.LatheGeometry(profile, 24), body);
  probe.add(handle);
  // nervurile de pe mâner
  const a = new Asm();
  for (let i = 0; i < 6; i++) a.cyl(body, 5.0, 5.0, 1.6, 0, 40 + i * 5, 0, 'y', 24);
  // vârful metalic
  a.cyl(MAT.steel, 1.0, 1.0, 17, 0, -8.5, 0, 'y', 12);
  a.cyl(MAT.steel, 1.0, 0.15, 4.5, 0, -19.2, 0, 'y', 12);
  probe.add(a.build());
  // culcată pe covoraș: axa pe -x (vârful spre stânga), sprijinită pe gardă
  probe.rotation.z = -Math.PI / 2;
  probe.position.y = 6.2;
  g.add(probe);
  // cablul pleacă din coada sondei (x = 100)
  const curve = new THREE.CatmullRomCurve3(
    [[100, 6.2, 0], [118, 4.4, 0], ...cablePts].map((p) => new THREE.Vector3(...(p as [number, number, number]))),
    false,
    'centripetal',
  );
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 1.7, 8), body));
  return shadowed(g);
}

// ───────────────────────── ansamblul ─────────────────────────

export function buildDeskSet(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'birou';
  root.add(buildDeskTop());
  root.add(buildMat());

  const mug = buildMug();
  mug.position.set(196, 0, -108);
  mug.rotation.y = -0.9;
  root.add(mug);

  // LED roșu, culcat, cu picioarele spre privitor
  const led = buildLed5mm();
  led.rotation.z = -Math.PI / 2 + 0.1; // sprijinit pe guler și pe vârfurile picioarelor
  const ledWrap = new THREE.Group();
  ledWrap.add(led);
  ledWrap.rotation.y = 2.5;
  ledWrap.position.set(-78, 2.95, 88);
  root.add(shadowed(ledWrap));

  // rezistențe împrăștiate
  const res: [number, number, number, number, number][] = [
    [220, 5, -128, 74, 0.35],
    [10000, 5, -150, 104, -0.5],
    [4700, 1, 26, 112, 0.12],
  ];
  for (const [ohms, tol, x, z, ry] of res) {
    const r = buildResistor(ohms, tol);
    r.position.x = x;
    r.position.z = z;
    r.rotation.y = ry;
    root.add(shadowed(r));
  }

  root.add(buildUsbCable());

  // sondele: vârfurile spre placă, cablurile ies de pe birou prin dreapta
  const yd = DESK_TOP + 1.7;
  const red = buildProbe(0xc8281f, [
    [160, 1.7, 14],
    [205, 1.7, 30],
    [262, yd + 2, 20],
    [330, yd, -30],
    [420, yd, -40],
    [560, yd, 30],
    [760, yd, 60],
  ]);
  red.position.set(74, 0, 62);
  red.rotation.y = -0.34;
  root.add(red);
  const black = buildProbe(0x1c1c1e, [
    [160, 1.7, -8],
    [215, 1.7, -4],
    [262, yd + 2, 20],
    [340, yd, 60],
    [450, yd, 50],
    [600, yd, 110],
    [760, yd, 120],
  ]);
  black.position.set(96, 0, 92);
  black.rotation.y = -0.16;
  root.add(black);

  return root;
}
