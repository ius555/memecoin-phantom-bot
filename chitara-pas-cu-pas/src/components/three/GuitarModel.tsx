/**
 * Chitara acustică 3D, stilizată, construită numai din forme simple Three.js:
 * corp (contur Bézier extrudat), gura cu rozeta, grif, taste, prăguș, căluș, cap cu chei.
 * Corzile sunt desenate separat (Strings.tsx), pentru că ele se animă.
 *
 * Stil realist: materiale PBR cu texturi procedurale de lemn (materials.ts, textures.ts).
 *
 * Performanță: toate piesele statice care au același material sunt UNITE într-o singură
 * geometrie (mergeGeometries). Rezultatul: ~14 apeluri de desenare pentru toată chitara,
 * în loc de ~80 – important pe telefon. Geometriile au puține segmente (low-poly).
 */
import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { BODY_DEPTH, BODY_LEN, BODY_START, FRET_COUNT, SCALE, SOUNDHOLE, STRING_Y, TOP_Y, fretX, neckWidth, stringZ } from './geometry'
import { material, type MaterialKey } from './materials'

/** Conturul corpului, în planul (u = de-a lungul, v = de-a curmezișul). */
function bodyShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(0, 9, 4, 14, 10, 14)
  s.bezierCurveTo(15, 14, 17, 11.5, 21, 11.5)
  s.bezierCurveTo(25, 11.5, 28, 19, 36, 19)
  s.bezierCurveTo(45, 19, BODY_LEN, 13, BODY_LEN, 0)
  s.bezierCurveTo(BODY_LEN, -13, 45, -19, 36, -19)
  s.bezierCurveTo(28, -19, 25, -11.5, 21, -11.5)
  s.bezierCurveTo(17, -11.5, 15, -14, 10, -14)
  s.bezierCurveTo(4, -14, 0, -9, 0, 0)
  return s
}

/** Un trapez extrudat (pentru grif și gât), de la x0 la x1, cu lățimi diferite la capete. */
function taperGeometry(x0: number, x1: number, w0: number, w1: number, depth: number): THREE.BufferGeometry {
  const s = new THREE.Shape()
  s.moveTo(x0, -w0 / 2)
  s.lineTo(x1, -w1 / 2)
  s.lineTo(x1, w1 / 2)
  s.lineTo(x0, w0 / 2)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false })
  // forma e în planul XY și se extrudează pe Z; o culcăm în planul XZ, cu grosimea pe Y
  g.rotateX(-Math.PI / 2)
  return g
}

// înclinarea capului spre spate (~13°) și pozițiile cheilor
const HEAD_TILT = 0.22
const HEAD_OFFSET = new THREE.Vector3(-0.5, -0.2, 0)
const PEG_X = [-4.5, -9, -13.5]

type Vec3 = [number, number, number]

/** Colecționează piese (geometrie + transformare) pe chei de material, apoi le unește. */
class PartList {
  parts = new Map<MaterialKey, THREE.BufferGeometry[]>()
  add(material: MaterialKey, geo: THREE.BufferGeometry, pos: Vec3 = [0, 0, 0], rot: Vec3 = [0, 0, 0], scale: Vec3 = [1, 1, 1], parent?: THREE.Matrix4) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(...scale))
    if (parent) m.premultiply(parent)
    let g = geo.clone().applyMatrix4(m)
    if (g.index) g = g.toNonIndexed()
    g.clearGroups()
    // păstrăm doar atributele comune tuturor geometriilor (poziție, normală, uv)
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name)
    const list = this.parts.get(material) ?? []
    list.push(g)
    this.parts.set(material, list)
  }
  build(): { material: MaterialKey; geometry: THREE.BufferGeometry }[] {
    return [...this.parts.entries()].map(([material, list]) => ({ material, geometry: mergeGeometries(list, false)! }))
  }
}

function buildGuitar() {
  const P = new PartList()
  const shape = bodyShape()

  // ---- corpul
  const body = new THREE.ExtrudeGeometry(shape, { depth: BODY_DEPTH, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.6, bevelSegments: 1, curveSegments: 10 })
  body.rotateX(-Math.PI / 2)
  P.add('sides', body, [BODY_START, TOP_Y - BODY_DEPTH, 0])
  // filetul crem de pe margine: un strat întreg sub fața (puțin mai mică) a plăcii
  const rim = new THREE.ShapeGeometry(shape, 10)
  rim.rotateX(-Math.PI / 2)
  P.add('binding', rim, [BODY_START, TOP_Y + 0.61, 0])
  const top = new THREE.ShapeGeometry(shape, 10)
  top.rotateX(-Math.PI / 2)
  P.add('top', top, [BODY_START, TOP_Y + 0.62, 0], [0, 0, 0], [0.985, 1, 0.97])
  // gura și rozeta (verdele salvie al aplicației)
  const flatDown: Vec3 = [-Math.PI / 2, 0, 0]
  P.add('rosette', new THREE.RingGeometry(SOUNDHOLE.r + 0.15, SOUNDHOLE.r + 1.6, 48), [SOUNDHOLE.x, TOP_Y + 0.66, 0], flatDown)
  P.add('hole', new THREE.CircleGeometry(SOUNDHOLE.r + 0.16, 40), [SOUNDHOLE.x, TOP_Y + 0.67, 0], flatDown)
  // placa de protecție, în formă de picătură
  P.add('guard', new THREE.CircleGeometry(3.2, 12), [SOUNDHOLE.x + 3, TOP_Y + 0.65, -SOUNDHOLE.r - 3], [-Math.PI / 2, 0, 0.5], [1, 1.5, 1])
  // căluşul, ştegul și pinii
  P.add('bridge', new THREE.BoxGeometry(3, 0.9, 15), [SCALE + 1.4, TOP_Y + 1.1, 0])
  P.add('bone', new THREE.BoxGeometry(0.35, 0.5, 7.2), [SCALE, STRING_Y - 0.25, 0])
  const pin = new THREE.CylinderGeometry(0.28, 0.24, 0.3, 10)
  for (let s = 0; s < 6; s++) P.add('bone', pin, [SCALE + 2.2, TOP_Y + 1.6, stringZ(s, SCALE) * 1.05])

  // ---- gâtul, grifura, tastele
  const fbEnd = fretX(FRET_COUNT) + 0.8
  P.add('neck', taperGeometry(-0.4, BODY_START + 2, neckWidth(0), neckWidth(BODY_START), 2.2), [0, -2.8, 0])
  P.add('fretboard', taperGeometry(-0.2, fbEnd, neckWidth(0), neckWidth(fbEnd), 0.6), [0, -0.6, 0])
  for (let i = 1; i <= FRET_COUNT; i++) {
    const x = fretX(i)
    P.add('fret', new THREE.CylinderGeometry(0.1, 0.1, neckWidth(x) - 0.1, 8), [x, 0.02, 0], [Math.PI / 2, 0, 0])
  }
  const dot = new THREE.CircleGeometry(0.38, 12)
  for (const n of [3, 5, 7, 9, 15, 17]) P.add('inlay', dot, [(fretX(n) + fretX(n - 1)) / 2, 0.01, 0], flatDown)
  for (const z of [0.9, -0.9]) P.add('inlay', dot, [(fretX(12) + fretX(11)) / 2, 0.01, z], flatDown)
  // prăguşul
  P.add('bone', new THREE.BoxGeometry(0.5, 0.75, neckWidth(0)), [-0.25, 0.15, 0])
  // călcâiul gâtului, unde se lipește de corp
  P.add('neck', new THREE.BoxGeometry(3, 6, neckWidth(BODY_START) - 0.6), [BODY_START + 0.6, -4.8, 0])

  // ---- capul (înclinat), cu axele și cheile
  const head = new THREE.Matrix4().compose(HEAD_OFFSET, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, HEAD_TILT)), new THREE.Vector3(1, 1, 1))
  const hs = new THREE.Shape()
  hs.moveTo(0, -2.4)
  hs.lineTo(-17, -3.9)
  hs.quadraticCurveTo(-19.5, 0, -17, 3.9)
  hs.lineTo(0, 2.4)
  hs.closePath()
  const headstock = new THREE.ExtrudeGeometry(hs, { depth: 1.4, bevelEnabled: false, curveSegments: 6 })
  headstock.rotateX(-Math.PI / 2)
  P.add('headstock', headstock, [0, -1.4, 0], [0, 0, 0], [1, 1, 1], head)
  const post = new THREE.CylinderGeometry(0.3, 0.3, 1.1, 8)
  const shaft = new THREE.CylinderGeometry(0.22, 0.22, 2, 6)
  const button = new THREE.SphereGeometry(1, 14, 10)
  for (const x of PEG_X)
    for (const side of [1, -1]) {
      const z = side * 2.6
      P.add('post', post, [x, 0.5, z], [0, 0, 0], [1, 1, 1], head)
      P.add('post', shaft, [x, -0.6, z + side * 1.9], [Math.PI / 2, 0, 0], [1, 1, 1], head)
      P.add('peg', button, [x, -0.6, z + side * 3.3], [0, 0, 0], [1.2, 0.5, 0.9], head)
    }
  return P.build()
}

export function GuitarModel() {
  const meshes = useMemo(buildGuitar, [])
  return (
    <group>
      {meshes.map(({ material: key, geometry }) => (
        <mesh key={key} geometry={geometry} material={material(key)} />
      ))}
    </group>
  )
}

/** Pozițiile (în coordonatele modelului) ale axelor de pe cap, unde se termină corzile. */
export function pegPostPosition(s: number): THREE.Vector3 {
  // coarda 6, 5, 4 pe partea +z (bas), 1, 2, 3 pe partea −z; coarda 6 și 1 cel mai aproape de prăguș
  const bass = s <= 2
  const idx = bass ? s : 5 - s
  const v = new THREE.Vector3(PEG_X[idx], 1.0, (bass ? 1 : -1) * 2.6)
  v.applyAxisAngle(new THREE.Vector3(0, 0, 1), HEAD_TILT)
  v.add(HEAD_OFFSET)
  return v
}
