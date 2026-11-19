/**
 * Degetele pe modelul 3D – „pernuțe” de deget: câte o bulină lucioasă, ușor bombată (forma vârfului
 * degetului văzut de sus), în culoarea degetului din diagramele 2D, cu contur alb și cifra 1–4 deasupra.
 * Sunt mari, curate și se văd bine pe orice ecran, din orice unghi. La barré, o bară rotunjită peste corzi.
 * „X” / „O” deasupra corzilor, înainte de prăguș.
 *
 * Detalii vizuale (ieftine pe telefon):
 * - o umbră moale pe grif, sub fiecare deget (se micșorează când degetul e sus)
 * - un mic „val” colorat care se lărgește pe grif când degetul apasă coarda
 * - cifra e un sprite: mereu cu fața spre cameră și neoglindită în modul stângaci
 *
 * Animații:
 * - la apariție, degetele CAD pe rând pe poziție (cu o mică săritură)
 * - la schimbarea acordului, fiecare deget se mută în arc spre noua tastă
 * - degetele care nu mai sunt folosite se ridică și dispar
 */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { ChordShape } from '../../music/chords'
import { layoutChord, type FingerTarget } from './chordLayout'
import { STRING_Y, fretX, stringZ } from './geometry'
import { coloredMaterial, cssColor } from './materials'
import { crossMark, fingerDigit, openMark, plainText, softShadow } from './labels'

const FALLBACK_COLORS = ['#7a6a58', '#10b981', '#3b82f6', '#f97316', '#d946ef']

/** Dimensiunile bulinei: puțin alungită de-a lungul grifului, ca vârful unui deget. */
const PAD_RX = 0.88 // de-a lungul grifului (x)
const PAD_RZ = 0.56 // de-a curmezișul corzilor (z)
const PAD_H = 0.4 // cât de bombată e
/** Centrul bulinei e puțin deasupra corzii, astfel încât partea de jos „apasă” coarda. */
const PAD_Y = STRING_Y + 0.08
/** Conturul alb: cât de mare e față de bulină */
const OUTLINE = 0.1

/** Geometriile comune (se creează o singură dată). */
let shared: { dome: THREE.BufferGeometry; ring: THREE.BufferGeometry; disc: THREE.BufferGeometry } | null = null
function geos() {
  if (!shared) {
    shared = {
      // sferă turtită: jumătatea de sus e vizibilă, jumătatea de jos intră între corzi
      dome: new THREE.SphereGeometry(1, 36, 18),
      // inelul „val” de la apăsare
      ring: new THREE.RingGeometry(0.82, 1, 40).rotateX(-Math.PI / 2),
      // discul de umbră
      disc: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    }
  }
  return shared
}

/** Turtirea barei de barré pe z (rotunjirea capetelor) */
const BARRE_Z = PAD_RZ * 0.9

/** Bara de barré: o capsulă culcată peste corzi (lungimea compensează scalarea pe z de la randare). */
function barreGeometry(width: number) {
  const g = new THREE.CapsuleGeometry(1, Math.max(0.01, width / BARRE_Z), 8, 24)
  g.rotateX(Math.PI / 2) // capsula stă de-a lungul lui z (peste corzi)
  return g
}

const outlineMat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.BackSide })

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

function FingerPad({
  target,
  color,
  delay,
  replayKey,
}: {
  target: FingerTarget | null
  color: string
  delay: number
  replayKey: number
}) {
  const invalidate = useThree((s) => s.invalidate)
  const group = useRef<THREE.Group>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const ripple = useRef<THREE.Mesh>(null)
  const pose = useRef<Pose | null>(null)
  const anim = useRef<Anim | null>(null)
  const rippleT0 = useRef<number | null>(null)
  const lastTarget = useRef<FingerTarget | null>(null)
  const lastReplay = useRef(replayKey)
  const { dome, ring, disc } = geos()

  const padMat = coloredMaterial(color, 0.26)
  const rippleMat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }), [color])
  const shadowMat = useMemo(() => new THREE.MeshBasicMaterial({ map: softShadow(), transparent: true, opacity: 0, depthWrite: false }), [])
  useEffect(() => () => rippleMat.dispose(), [rippleMat])
  useEffect(() => () => shadowMat.dispose(), [shadowMat])

  const shown = target ?? lastTarget.current
  const digit = fingerDigit(String(shown?.finger ?? ''))
  const isBarre = !!shown?.barre
  const barreW = shown?.barre ? shown.width : 0
  const barreGeo = useMemo(() => (barreW > 0 ? barreGeometry(barreW) : null), [barreW])
  useEffect(() => () => barreGeo?.dispose(), [barreGeo])

  const key = target ? `${target.x.toFixed(2)}|${target.z.toFixed(2)}|${target.width.toFixed(2)}` : 'none'

  useEffect(() => {
    const now = performance.now() / 1000
    // la „arată din nou”, degetele cad iar de sus
    const replay = lastReplay.current !== replayKey
    lastReplay.current = replayKey
    const prev = replay ? null : pose.current
    if (target) {
      const to: Pose = { x: target.x, y: PAD_Y, z: target.z, width: target.width, scale: 1 }
      if (!prev || prev.scale < 0.05) {
        // apariție: degetul cade de sus pe tastă
        anim.current = { kind: 'drop', from: { ...to, y: to.y + 10 }, to, t0: now + delay, dur: 0.55 }
        pose.current = { ...to, y: to.y + 10, scale: 0 }
      } else {
        anim.current = { kind: 'move', from: { ...prev }, to, t0: now + delay * 0.25, dur: 0.38 }
      }
      lastTarget.current = target
    } else if (prev && prev.scale > 0) {
      anim.current = { kind: 'lift', from: { ...prev }, to: { ...prev, y: prev.y + 5, scale: 0 }, t0: now, dur: 0.3 }
    }
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, replayKey])

  useFrame(() => {
    const g = group.current
    const a = anim.current
    if (!g) return
    const now = performance.now() / 1000
    if (a) {
      const raw = (now - a.t0) / a.dur
      if (raw < 0) {
        // încă așteptăm (degetele cad pe rând)
        if (a.kind === 'drop') {
          g.visible = false
          if (shadow.current) shadow.current.visible = false
        }
        invalidate()
        return
      }
      const t = Math.min(1, raw)
      const k = a.kind === 'drop' ? easeOutBounce(t) : easeInOut(t)
      pose.current = {
        x: a.from.x + (a.to.x - a.from.x) * k,
        y: a.from.y + (a.to.y - a.from.y) * k + (a.kind === 'move' ? Math.sin(Math.PI * t) * 2.2 : 0),
        z: a.from.z + (a.to.z - a.from.z) * k,
        width: a.from.width + (a.to.width - a.from.width) * k,
        scale: a.kind === 'lift' ? 1 - t : 1,
      }
      if (t >= 1) {
        anim.current = null
        // degetul a ajuns pe coardă: pornește „valul”
        if (a.kind !== 'lift') rippleT0.current = now
      }
      invalidate()
    }
    const p = pose.current
    if (!p) {
      g.visible = false
      return
    }
    const visible = p.scale > 0.02
    g.visible = visible
    g.position.set(p.x, p.y, p.z)
    g.scale.setScalar(Math.max(0.001, p.scale))

    // umbra: stă pe grif, mai mică și mai slabă cu cât degetul e mai sus
    const sh = shadow.current
    if (sh) {
      const h = Math.max(0, p.y - PAD_Y)
      const near = Math.max(0, 1 - h / 10)
      sh.visible = visible
      sh.position.set(p.x, 0.04, p.z)
      const grow = 1 + h * 0.06
      sh.scale.set(PAD_RX * 3.2 * grow, 1, (p.width + PAD_RZ * 3) * grow)
      shadowMat.opacity = 0.75 * near * p.scale
    }

    // „valul” de la apăsare: un inel colorat care se lărgește și dispare
    const r = ripple.current
    if (r) {
      const t0 = rippleT0.current
      if (t0 === null) r.visible = false
      else {
        const t = (now - t0) / 0.6
        if (t >= 1) {
          r.visible = false
          rippleT0.current = null
        } else {
          r.visible = visible
          const s = 0.9 + 1.4 * easeInOut(t)
          r.position.set(p.x, 0.06, p.z)
          r.scale.set(PAD_RX * s, 1, (p.width / 2 + PAD_RZ) * s)
          rippleMat.opacity = 0.55 * (1 - t)
          invalidate()
        }
      }
    }
  })

  return (
    <>
      <mesh ref={shadow} geometry={disc} material={shadowMat} visible={false} renderOrder={2} />
      <mesh ref={ripple} geometry={ring} material={rippleMat} visible={false} renderOrder={2} />
      <group ref={group} visible={false}>
        {isBarre && barreGeo ? (
          <>
            {/* bara de barré, cu contur alb */}
            <mesh geometry={barreGeo} material={padMat} scale={[PAD_RX * 0.78, PAD_H, BARRE_Z]} renderOrder={3} />
            <mesh
              geometry={barreGeo}
              material={outlineMat}
              scale={[PAD_RX * 0.78 + OUTLINE, PAD_H + OUTLINE, BARRE_Z + OUTLINE * 0.4]}
              renderOrder={3}
            />
          </>
        ) : (
          <>
            <mesh geometry={dome} material={padMat} scale={[PAD_RX, PAD_H, PAD_RZ]} renderOrder={3} />
            <mesh geometry={dome} material={outlineMat} scale={[PAD_RX + OUTLINE, PAD_H + OUTLINE, PAD_RZ + OUTLINE]} renderOrder={3} />
          </>
        )}
        {/* cifra degetului, deasupra bulinei, mereu vizibilă și cu fața spre cameră */}
        <sprite position={[0, PAD_H + 0.15, 0]} scale={[1.2, 1.2, 1]} renderOrder={12}>
          <spriteMaterial map={digit} transparent depthTest={false} depthWrite={false} />
        </sprite>
      </group>
    </>
  )
}

export function Fingers({ shape, replayKey, themeKey }: { shape: ChordShape | undefined; replayKey: number; themeKey: string }) {
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
        <FingerPad
          key={f}
          target={layout?.fingers[f] ?? null}
          color={colors[f]}
          delay={Math.max(0, present.indexOf(f)) * 0.16}
          replayKey={replayKey}
        />
      ))}
      {/* X / O deasupra corzilor, chiar înainte de prăguș */}
      {layout?.marks.map((m, s) =>
        m ? (
          <sprite key={`${s}${m}`} position={[-2.3, STRING_Y + 0.9, stringZ(s, 0) * 1.42]} scale={[1.08, 1.08, 1]} renderOrder={9}>
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
