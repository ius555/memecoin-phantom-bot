/**
 * Chitara acustică 3D, stilizată, construită numai din forme simple Three.js:
 * corp (contur Bézier extrudat), gura cu rozeta, grif, taste, prăguș, căluș, cap cu chei.
 * Corzile sunt desenate separat (Strings.tsx), pentru că ele se animă.
 *
 * Geometriile se creează o singură dată (useMemo) și au puține segmente (low-poly).
 */
import { useMemo } from 'react'
import * as THREE from 'three'
import {
  BODY_DEPTH,
  BODY_LEN,
  BODY_START,
  FRET_COUNT,
  SCALE,
  SOUNDHOLE,
  STRING_Y,
  TOP_Y,
  fretX,
  neckWidth,
  stringZ,
} from './geometry'
import { COLORS, flat, toon } from './materials'

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
function taperGeometry(x0: number, x1: number, w0: number, w1: number, depth: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape()
  s.moveTo(x0, -w0 / 2)
  s.lineTo(x1, -w1 / 2)
  s.lineTo(x1, w1 / 2)
  s.lineTo(x0, w0 / 2)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false })
  // forma e în planul XY și se extrudează pe Z; o întindem în planul XZ, cu grosimea pe Y
  g.rotateX(-Math.PI / 2)
  return g
}

export function GuitarModel() {
  const geo = useMemo(() => {
    const shape = bodyShape()
    const body = new THREE.ExtrudeGeometry(shape, {
      depth: BODY_DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.6,
      bevelSize: 0.6,
      bevelSegments: 1,
      curveSegments: 10,
    })
    body.rotateX(-Math.PI / 2)
    // fața corpului (un strat subțire, de altă culoare)
    const top = new THREE.ShapeGeometry(shape, 10)
    top.rotateX(-Math.PI / 2)
    const fbEnd = fretX(FRET_COUNT) + 0.8
    const fretboard = taperGeometry(-0.2, fbEnd, neckWidth(0), neckWidth(fbEnd), 0.6)
    const neck = taperGeometry(-0.4, BODY_START + 2, neckWidth(0), neckWidth(BODY_START), 2.2)
    // capul: o formă puțin evazată, cu vârful rotunjit
    const hs = new THREE.Shape()
    hs.moveTo(0, -2.4)
    hs.lineTo(-17, -3.9)
    hs.quadraticCurveTo(-19.5, 0, -17, 3.9)
    hs.lineTo(0, 2.4)
    hs.closePath()
    const headstock = new THREE.ExtrudeGeometry(hs, { depth: 1.4, bevelEnabled: false, curveSegments: 6 })
    headstock.rotateX(-Math.PI / 2)
    return { body, top, fretboard, neck, headstock }
  }, [])

  // capul e înclinat spre spate (ca la chitarele reale), cu ~13°
  const headTilt = 0.22
  const pegs = [-4.5, -9, -13.5]

  return (
    <group>
      {/* corpul: extrudat în jos de sub fața plăcii */}
      <mesh geometry={geo.body} material={toon(COLORS.sides)} position={[BODY_START, TOP_Y - BODY_DEPTH, 0]} />
      <mesh geometry={geo.top} material={toon(COLORS.top)} position={[BODY_START, TOP_Y + 0.62, 0]} scale={[0.985, 1, 0.97]} />
      {/* gura și rozeta */}
      <mesh material={flat(COLORS.rosette)} position={[SOUNDHOLE.x, TOP_Y + 0.66, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[SOUNDHOLE.r + 0.3, SOUNDHOLE.r + 1.3, 28]} />
      </mesh>
      <mesh material={flat(COLORS.hole)} position={[SOUNDHOLE.x, TOP_Y + 0.67, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[SOUNDHOLE.r, 28]} />
      </mesh>
      {/* placa de protecție (în formă de picătură, lângă gură, pe partea corzilor subțiri) */}
      <mesh material={toon(COLORS.guard)} position={[SOUNDHOLE.x + 3, TOP_Y + 0.65, -SOUNDHOLE.r - 3]} rotation={[-Math.PI / 2, 0, 0.5]} scale={[1, 1.5, 1]}>
        <circleGeometry args={[3.2, 12]} />
      </mesh>
      {/* căluşul + ştegul */}
      <mesh material={toon(COLORS.bridge)} position={[SCALE + 1.4, TOP_Y + 1.1, 0]}>
        <boxGeometry args={[3, 0.9, 15]} />
      </mesh>
      <mesh material={toon(COLORS.bone)} position={[SCALE, STRING_Y - 0.25, 0]}>
        <boxGeometry args={[0.35, 0.5, 7.2]} />
      </mesh>
      {/* pinii căluşului */}
      {[0, 1, 2, 3, 4, 5].map((s) => (
        <mesh key={s} material={toon(COLORS.bone)} position={[SCALE + 2.2, TOP_Y + 1.6, stringZ(s, SCALE) * 1.05]}>
          <cylinderGeometry args={[0.28, 0.28, 0.3, 8]} />
        </mesh>
      ))}

      {/* gâtul și grifura */}
      <mesh geometry={geo.neck} material={toon(COLORS.neck)} position={[0, -2.8, 0]} />
      <mesh geometry={geo.fretboard} material={toon(COLORS.fretboard)} position={[0, -0.6, 0]} />
      {/* barele tastelor */}
      {Array.from({ length: FRET_COUNT }, (_, i) => {
        const x = fretX(i + 1)
        return (
          <mesh key={i} material={toon(COLORS.fret)} position={[x, 0.04, 0]}>
            <boxGeometry args={[0.18, 0.12, neckWidth(x) - 0.1]} />
          </mesh>
        )
      })}
      {/* semnele de poziție */}
      {[3, 5, 7, 9, 15, 17].map((n) => (
        <mesh key={n} material={flat(COLORS.inlay)} position={[(fretX(n) + fretX(n - 1)) / 2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.38, 12]} />
        </mesh>
      ))}
      {[0.9, -0.9].map((z) => (
        <mesh key={z} material={flat(COLORS.inlay)} position={[(fretX(12) + fretX(11)) / 2, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.38, 12]} />
        </mesh>
      ))}
      {/* prăguşul */}
      <mesh material={toon(COLORS.bone)} position={[-0.25, 0.15, 0]}>
        <boxGeometry args={[0.5, 0.75, neckWidth(0)]} />
      </mesh>

      {/* capul, înclinat spre spate, cu cheile */}
      <group position={[-0.5, -0.2, 0]} rotation={[0, 0, headTilt]}>
        <mesh geometry={geo.headstock} material={toon(COLORS.headstock)} position={[0, -1.4, 0]} />
        {pegs.map((x, i) =>
          [1, -1].map((side) => (
            <group key={`${i}${side}`} position={[x, 0, side * 2.6]}>
              {/* axul pe care se înfășoară coarda */}
              <mesh material={toon(COLORS.post)} position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 1.1, 8]} />
              </mesh>
              {/* cheia (butonul) din lateral */}
              <mesh material={toon(COLORS.post)} position={[0, -0.6, side * 1.9]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 2, 6]} />
              </mesh>
              <mesh material={toon(COLORS.peg)} position={[0, -0.6, side * 3.3]} scale={[1.2, 0.5, 0.9]}>
                <sphereGeometry args={[1, 10, 6]} />
              </mesh>
            </group>
          )),
        )}
      </group>
    </group>
  )
}

/** Pozițiile (în coordonatele modelului) ale axelor de pe cap, unde se termină corzile. */
export function pegPostPosition(s: number): THREE.Vector3 {
  // coarda 6, 5, 4 pe partea +z (bas), 1, 2, 3 pe partea −z; coarda 6 și 1 cel mai aproape de prăguș
  const xs = [-4.5, -9, -13.5]
  const bass = s <= 2
  const idx = bass ? s : 5 - s
  const v = new THREE.Vector3(xs[idx], 1.0, (bass ? 1 : -1) * 2.6)
  v.applyAxisAngle(new THREE.Vector3(0, 0, 1), 0.22)
  v.add(new THREE.Vector3(-0.5, -0.2, 0))
  return v
}
