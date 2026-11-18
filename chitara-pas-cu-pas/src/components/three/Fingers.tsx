/**
 * Degetele pe modelul 3D: buline colorate (1–4, aceleași culori ca în diagramele 2D),
 * barré-ul ca o bară alungită peste corzi, plus „X” / „O” deasupra corzilor.
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
import { STRING_Y, fretX, stringZ } from './geometry'
import { cssColor, toon } from './materials'
import { crossMark, numberBadge, openMark, plainText } from './labels'
import type { ViewId } from './views'

const FALLBACK_COLORS = ['#7a6a58', '#3f9a5a', '#2f7fc1', '#d77a22', '#a24c8f']
const BEAD_R = 0.5

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
  const bead = useRef<THREE.Mesh>(null)
  const pose = useRef<Pose | null>(null)
  const anim = useRef<Anim | null>(null)
  const lastTarget = useRef<FingerTarget | null>(null)
  const lastReplay = useRef(replayKey)
  const material = toon(color)
  const badge = numberBadge(String(target?.finger ?? lastTarget.current?.finger ?? ''), color)

  const key = target ? `${target.x.toFixed(2)}|${target.z.toFixed(2)}|${target.width.toFixed(2)}` : 'none'

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
    if (bead.current) {
      // bulina se alungește pe z pentru barré
      const stretch = (p.width / 2 + BEAD_R) / BEAD_R
      bead.current.scale.set(1, 0.62, stretch)
    }
  })

  return (
    <group ref={group} visible={false}>
      <mesh ref={bead} material={material}>
        <sphereGeometry args={[BEAD_R, 16, 10]} />
      </mesh>
      {/* cifra degetului, "pictată" pe bulină */}
      <mesh position={[0, BEAD_R * 0.62 + 0.03, 0]} rotation={[-Math.PI / 2, 0, decalRotation]} scale={[mirror ? -1 : 1, 1, 1]} renderOrder={5}>
        <circleGeometry args={[BEAD_R * 0.98, 20]} />
        <meshBasicMaterial map={badge} transparent depthWrite={false} />
      </mesh>
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
  const ink = useMemo(() => cssColor('--primary', '#3f6b4a'), [themeKey]) // eslint-disable-line react-hooks/exhaustive-deps
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
