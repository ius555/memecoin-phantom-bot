/**
 * Degetele pe modelul 3D: degete cu aspect realist (piele, încheieturi, unghii), construite procedural,
 * care vin de sub grif (pe partea corzilor subțiri, unde e palma), se arcuiesc și apasă cu VÂRFUL
 * pe coardă – exact cum trebuie ținut degetul. La barré, arătătorul stă culcat peste corzi.
 * Lângă fiecare vârf, un mic semn cu cifra (1–4) în culoarea degetului din diagramele 2D.
 * „X” / „O” deasupra corzilor.
 *
 * Animații:
 * - la apariție, degetele CAD pe rând pe poziție (cu o mică săritură)
 * - la schimbarea acordului, fiecare deget se mută în arc spre noua tastă (ca o mână reală)
 * - degetele care nu mai sunt folosite se ridică și dispar
 */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { ChordShape } from '../../music/chords'
import { layoutChord, type FingerTarget } from './chordLayout'
import { STRING_Y, fretX, neckWidth, stringZ } from './geometry'
import { coloredMaterial, cssColor } from './materials'
import { crossMark, numberBadge, openMark, plainText } from './labels'
import type { ViewId } from './views'

const FALLBACK_COLORS = ['#7a6a58', '#10b981', '#3b82f6', '#f97316', '#d946ef']
/** culoarea pielii și a unghiilor */
const SKIN = '#e2ab88'
const NAIL = '#f3d9ce'

const gauss = (t: number, mu: number, w: number) => Math.exp(-((t - mu) * (t - mu)) / (2 * w * w))

/**
 * Tub cu grosime variabilă de-a lungul unei curbe (pentru un deget: gros la bază, mai subțire spre vârf,
 * cu încheieturile puțin îngroșate). Three.js are doar tuburi cu grosime constantă, așa că îl construim.
 */
function taperedTube(curve: THREE.Curve<THREE.Vector3>, radius: (t: number) => number, tubular = 36, radial = 14): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(tubular, false)
  const pos: number[] = []
  const nor: number[] = []
  const idx: number[] = []
  const P = new THREE.Vector3()
  const n = new THREE.Vector3()
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular
    curve.getPointAt(t, P)
    const r = radius(t)
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * Math.PI * 2
      n.copy(frames.normals[i]).multiplyScalar(Math.cos(v)).addScaledVector(frames.binormals[i], Math.sin(v)).normalize()
      pos.push(P.x + n.x * r, P.y + n.y * r, P.z + n.z * r)
      nor.push(n.x, n.y, n.z)
    }
  }
  for (let i = 0; i < tubular; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j
      const b = a + radial + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setIndex(idx)
  return g
}

/** Grosimea relativă a fiecărui deget (arătătorul și mijlociul mai groase, degetul mic mai subțire). */
const FINGER_SCALE = [1, 1, 1.04, 0.96, 0.84]

interface FingerShape {
  skin: THREE.BufferGeometry
  nail: THREE.BufferGeometry
  label: THREE.Vector3
}

/**
 * Forma unui deget, în coordonate relative la vârf (vârful e în origine).
 * Degetul pornește din palmă, de sub marginea grifului dinspre coarda 1 (−z), urcă în arc
 * (articulațiile) și coboară aproape vertical, apăsând cu VÂRFUL pe coardă. La barré stă culcat peste corzi.
 */
function fingerGeometry(t: FingerTarget): FingerShape {
  const edge = -neckWidth(t.x) / 2 // marginea grifului dinspre coarda 1
  const k = FINGER_SCALE[t.finger] ?? 1
  let pts: THREE.Vector3[]
  if (t.barre) {
    const zT = -t.width / 2
    const zB = t.width / 2
    const d = edge - (t.z + zT)
    pts = [
      new THREE.Vector3(-0.3, -3.5, zT + d - 1.6),
      new THREE.Vector3(-0.2, -1.0, zT + d - 0.75),
      new THREE.Vector3(-0.1, 0.06, zT + d - 0.05),
      new THREE.Vector3(0, 0.02, (zT + zB) / 2),
      new THREE.Vector3(0, 0.02, zB + 0.1),
    ]
  } else {
    const d = edge - t.z
    pts = [
      new THREE.Vector3(-0.45, -3.6, d - 1.6),
      new THREE.Vector3(-0.38, -1.0, d - 0.9),
      new THREE.Vector3(-0.25, 1.35, d * 0.55 - 0.25), // articulația din mijloc, cea mai sus
      new THREE.Vector3(-0.08, 1.2, -0.1),
      new THREE.Vector3(0, 0.12, 0),
    ]
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  // profilul grosimii: bază groasă → vârf subțire, cu încheieturile puțin mai groase, vârful rotunjit
  const radius = (u: number) => {
    let r = (0.47 - 0.11 * u + 0.035 * gauss(u, 0.45, 0.05) + 0.03 * gauss(u, 0.74, 0.045)) * k
    if (u > 0.9) r *= Math.sqrt(Math.max(0, 1 - ((u - 0.9) / 0.1) ** 2)) * 0.75 + 0.25
    return r
  }
  const skin = taperedTube(curve, radius)
  // vârful rotunjit (o semisferă) peste capătul tubului
  const end = curve.getPointAt(1)
  const tan = curve.getTangentAt(1)
  const rTip = radius(0.9)
  const cap = new THREE.SphereGeometry(rTip, 14, 10)
  cap.translate(end.x - tan.x * rTip * 0.9, end.y - tan.y * rTip * 0.9, end.z - tan.z * rTip * 0.9)
  const merged = mergeTwo(skin, cap)

  // unghia: pe spatele ultimei falange (spre exteriorul arcului; la barré, în sus)
  const along = curve.getTangentAt(0.93)
  const ref = t.barre ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0.25, 1)
  const dorsal = ref.sub(along.clone().multiplyScalar(ref.dot(along))).normalize()
  const side = new THREE.Vector3().crossVectors(dorsal, along).normalize()
  const at = curve.getPointAt(0.9)
  const nail = new THREE.SphereGeometry(1, 14, 8)
  const basis = new THREE.Matrix4().makeBasis(side, dorsal, along)
  nail.applyMatrix4(new THREE.Matrix4().makeScale(rTip * 0.78, 0.07, rTip * 1.15))
  nail.applyMatrix4(basis)
  nail.translate(at.x + dorsal.x * radius(0.9) * 0.93, at.y + dorsal.y * radius(0.9) * 0.93, at.z + dorsal.z * radius(0.9) * 0.93)

  // numărul degetului: un mic semn colorat deasupra vârfului
  const label = t.barre ? new THREE.Vector3(0, 0.95, 0) : new THREE.Vector3(0, 2.15, 0.2)
  return { skin: merged, nail, label }
}

/** Unește două geometrii (poziții + normale) într-una singură, ca să fie un singur apel de desenare. */
function mergeTwo(a: THREE.BufferGeometry, b: THREE.BufferGeometry): THREE.BufferGeometry {
  const parts = [a.index ? a.toNonIndexed() : a, b.index ? b.toNonIndexed() : b]
  const out = new THREE.BufferGeometry()
  for (const name of ['position', 'normal']) {
    const arrays = parts.map((g) => g.getAttribute(name).array as Float32Array)
    const all = new Float32Array(arrays.reduce((n, x) => n + x.length, 0))
    let o = 0
    for (const x of arrays) {
      all.set(x, o)
      o += x.length
    }
    out.setAttribute(name, new THREE.BufferAttribute(all, 3))
  }
  a.dispose()
  b.dispose()
  return out
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
function easeOutBounce(t: number) {
  const n = 7.5625
  const d = 2.75
  if (t < 1 / d) return n * t * t
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
  return n * (t -= 2.625 / d) * t + 0.984375
}

interface Pose {
  x: number
  y: number
  z: number
  width: number
  scale: number
}

interface Anim {
  kind: 'drop' | 'move' | 'lift'
  from: Pose
  to: Pose
  t0: number
  dur: number
}

function FingerMarker({
  target,
  color,
  delay,
  replayKey,
  decalRotation,
  mirror,
}: {
  target: FingerTarget | null
  color: string
  delay: number
  replayKey: number
  /** rotația cifrei, ca să fie mereu „în picioare” pentru unghiul ales */
  decalRotation: number
  mirror: boolean
}) {
  const invalidate = useThree((s) => s.invalidate)
  const group = useRef<THREE.Group>(null)
  const pose = useRef<Pose | null>(null)
  const anim = useRef<Anim | null>(null)
  const lastTarget = useRef<FingerTarget | null>(null)
  const lastReplay = useRef(replayKey)
  const skinMat = coloredMaterial(SKIN, 0.62)
  const nailMat = coloredMaterial(NAIL, 0.22)
  const badge = numberBadge(String(target?.finger ?? lastTarget.current?.finger ?? ''), color)

  const key = target ? `${target.x.toFixed(2)}|${target.z.toFixed(2)}|${target.width.toFixed(2)}` : 'none'
  // forma degetului pentru ținta curentă (păstrăm ultima formă cât timp degetul se ridică)
  const lastShape = useRef<ReturnType<typeof fingerGeometry> | null>(null)
  const fingerShape = useMemo(() => {
    if (!target) return lastShape.current
    const f = fingerGeometry(target)
    lastShape.current = f
    return f
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    const now = performance.now() / 1000
    // la "arată din nou", degetele cad iar de sus
    const replay = lastReplay.current !== replayKey
    lastReplay.current = replayKey
    const prev = replay ? null : pose.current
    if (target) {
      const to: Pose = { x: target.x, y: target.y, z: target.z, width: target.width, scale: 1 }
      if (!prev || prev.scale < 0.05) {
        // apariție: degetul cade de sus pe tastă
        anim.current = { kind: 'drop', from: { ...to, y: to.y + 12, scale: 1 }, to, t0: now + delay, dur: 0.55 }
        pose.current = { ...to, y: to.y + 12, scale: 0 }
      } else {
        anim.current = { kind: 'move', from: { ...prev }, to, t0: now + delay * 0.25, dur: 0.38 }
      }
      lastTarget.current = target
    } else if (prev && prev.scale > 0) {
      anim.current = { kind: 'lift', from: { ...prev }, to: { ...prev, y: prev.y + 6, scale: 0 }, t0: now, dur: 0.3 }
    }
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, replayKey])

  useFrame(() => {
    const g = group.current
    const a = anim.current
    if (!g) return
    if (a) {
      const now = performance.now() / 1000
      const raw = (now - a.t0) / a.dur
      if (raw < 0) {
        // încă așteptăm (degetele cad pe rând)
        if (a.kind === 'drop') g.visible = false
        invalidate()
        return
      }
      const t = Math.min(1, raw)
      const k = a.kind === 'drop' ? easeOutBounce(t) : easeInOut(t)
      const p: Pose = {
        x: a.from.x + (a.to.x - a.from.x) * k,
        y: a.from.y + (a.to.y - a.from.y) * k + (a.kind === 'move' ? Math.sin(Math.PI * t) * 2.6 : 0),
        z: a.from.z + (a.to.z - a.from.z) * k,
        width: a.from.width + (a.to.width - a.from.width) * k,
        scale: a.kind === 'lift' ? 1 - t : 1,
      }
      pose.current = p
      if (t >= 1) anim.current = null
      invalidate()
    }
    const p = pose.current
    if (!p) {
      g.visible = false
      return
    }
    g.visible = p.scale > 0.02
    g.position.set(p.x, p.y, p.z)
    g.scale.setScalar(Math.max(0.001, p.scale))
  })

  return (
    <group ref={group} visible={false}>
      {fingerShape && <mesh geometry={fingerShape.skin} material={skinMat} renderOrder={3} />}
      {fingerShape && <mesh geometry={fingerShape.nail} material={nailMat} renderOrder={3} />}
      {/* cifra degetului, deasupra vârfului, mereu vizibilă */}
      {fingerShape && (
        <mesh
          position={fingerShape.label}
          rotation={[-Math.PI / 2, 0, decalRotation]}
          scale={[mirror ? -1 : 1, 1, 1]}
          renderOrder={12}
        >
          <circleGeometry args={[0.42, 20]} />
          <meshBasicMaterial map={badge} transparent depthTest={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

export function Fingers({
  shape,
  replayKey,
  themeKey,
  view,
  mirror,
}: {
  shape: ChordShape | undefined
  replayKey: number
  themeKey: string
  view: ViewId
  mirror: boolean
}) {
  const layout = useMemo(() => (shape ? layoutChord(shape) : null), [shape])
  // culorile degetelor vin din tema aplicației (aceleași variabile CSS ca în 2D)
  const colors = useMemo(
    () => [0, 1, 2, 3, 4].map((f) => cssColor(f === 0 ? '--fT' : `--f${f}`, FALLBACK_COLORS[f])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [themeKey],
  )
  const bad = useMemo(() => cssColor('--bad', '#c0462f'), [themeKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const ink = '#1f1f1f' // „O” negru pe fond alb – lizibil în ambele teme
  const muted = useMemo(() => cssColor('--muted', '#6e6152'), [themeKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ordinea în care cad degetele: după numărul degetului (ca în diagrama 2D)
  const present = layout ? layout.fingers.filter(Boolean).map((f) => f!.finger) : []

  return (
    <group>
      {[1, 2, 3, 4].map((f) => (
        <FingerMarker
          key={f}
          target={layout?.fingers[f] ?? null}
          color={colors[f]}
          delay={Math.max(0, present.indexOf(f)) * 0.16}
          replayKey={replayKey}
          // la „Din față” chitara e întoarsă cu 180°, deci întoarcem și cifrele
          decalRotation={view === 'front' ? Math.PI : 0}
          mirror={mirror}
        />
      ))}
      {/* X / O deasupra corzilor, chiar înainte de prăguș */}
      {layout?.marks.map((m, s) =>
        m ? (
          <sprite key={`${s}${m}`} position={[-2.3, STRING_Y + 0.9, stringZ(s, 0) * 1.3]} scale={[1.35, 1.35, 1]} renderOrder={9}>
            <spriteMaterial map={m === 'x' ? crossMark(bad) : openMark(ink)} depthTest={false} transparent />
          </sprite>
        ) : null,
      )}
      {/* numerele tastelor cu puncte, pe marginea dinspre coarda 6, ca să te orientezi */}
      {[1, 3, 5, 7, 9, 12].map((n) => (
        <sprite key={`n${n}`} position={[(fretX(n) + fretX(n - 1)) / 2, 0.2, stringZ(0, fretX(n)) + 2.4]} scale={[1.3, 1.3, 1]}>
          <spriteMaterial map={plainText(String(n), muted)} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
