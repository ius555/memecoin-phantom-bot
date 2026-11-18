/**
 * Cele 6 corzi. Fiecare e o linie (Line2, groasă în pixeli, ieftină) cu câteva zeci de puncte,
 * ca să poată vibra: când coarda sună, punctele dintre tastă și căluș oscilează, iar culoarea se aprinde.
 *
 * Corzile ascultă canalul de evenimente audio (audio/events.ts): orice notă cântată în aplicație,
 * de oriunde, face coarda corespunzătoare să vibreze exact când se aude.
 */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import type { Line2 } from 'three-stdlib'
import { SCALE, STRING_Y, fretX, stringZ } from './geometry'
import { COLORS } from './materials'
import { pegPostPosition } from './GuitarModel'
import { onGuitarEvent } from '../../audio/events'
import { getAudio } from '../../audio/context'

const POINTS = 48
const DECAY = 2.4 // cât de repede se stinge vibrația vizuală (1/s)
const VIS_HZ = 14 // frecvența vibrației desenate (cea reală ar fi prea rapidă pentru ochi)

interface Hit {
  when: number
  fret: number
  amp: number
}

/** Timpul audio "vizibil" acum (ținem cont de întârzierea difuzoarelor). */
export function audioNow(): number {
  const ctx = getAudio().ctx
  const lat = (ctx as AudioContext & { outputLatency?: number }).outputLatency ?? ctx.baseLatency ?? 0
  return ctx.currentTime - lat
}

export function Strings({ onPluck }: { onPluck?: (s: number) => void }) {
  const invalidate = useThree((s) => s.invalidate)
  const lines = useRef<(Line2 | null)[]>([])
  const hits = useRef<Hit[][]>([[], [], [], [], [], []])
  const glow = useRef<number[]>([0, 0, 0, 0, 0, 0])

  // punctele de repaus ale fiecărei corzi (de la prăguș la căluș)
  const rest = useMemo(
    () =>
      Array.from({ length: 6 }, (_, s) =>
        Array.from({ length: POINTS }, (_, i) => {
          const x = -0.5 + ((SCALE + 0.5) * i) / (POINTS - 1)
          return new THREE.Vector3(x, STRING_Y, stringZ(s, x))
        }),
      ),
    [],
  )

  // ascultăm notele cântate și pornim animația
  useEffect(
    () =>
      onGuitarEvent((e) => {
        if (e.type !== 'note') return
        hits.current[e.string] = [...hits.current[e.string].slice(-2), { when: e.when, fret: e.fret, amp: 0.25 + e.velocity * 0.35 }]
        invalidate()
      }),
    [invalidate],
  )

  const base = useMemo(() => [0, 1, 2, 3, 4, 5].map((s) => new THREE.Color(s < 3 ? COLORS.woundString : COLORS.plainString)), [])
  const hot = useMemo(() => new THREE.Color('#fff6e3'), [])
  const tmp = useMemo(() => new THREE.Color(), [])
  const flatArr = useMemo(() => new Float32Array(POINTS * 3), [])

  useFrame(() => {
    const now = audioNow()
    let busy = false
    for (let s = 0; s < 6; s++) {
      const line = lines.current[s]
      if (!line) continue
      // doar ultima lovitură care a început deja contează
      const active = hits.current[s].filter((h) => h.when <= now).pop()
      const pending = hits.current[s].some((h) => h.when > now)
      let amp = 0
      let start = 0
      if (active) {
        const t = now - active.when
        amp = active.amp * Math.exp(-DECAY * t)
        if (amp < 0.004) amp = 0
        start = active.fret > 0 ? fretX(active.fret) : 0
        if (amp > 0) {
          const len = SCALE - start
          for (let i = 0; i < POINTS; i++) {
            const p = rest[s][i]
            let dy = 0
            if (p.x > start && p.x < SCALE) {
              const u = (p.x - start) / len
              // modul fundamental (o "burtă" la mijloc) + puțin din al doilea mod
              dy = amp * (Math.sin(Math.PI * u) * Math.sin(2 * Math.PI * VIS_HZ * t) + 0.25 * Math.sin(2 * Math.PI * u) * Math.sin(2 * Math.PI * VIS_HZ * 1.7 * t))
            }
            flatArr[i * 3] = p.x
            flatArr[i * 3 + 1] = p.y + dy
            flatArr[i * 3 + 2] = p.z
          }
          line.geometry.setPositions(flatArr)
          busy = true
        }
      }
      if (!amp && glow.current[s] > 0) {
        // revenire la poziția de repaus
        for (let i = 0; i < POINTS; i++) {
          flatArr[i * 3] = rest[s][i].x
          flatArr[i * 3 + 1] = rest[s][i].y
          flatArr[i * 3 + 2] = rest[s][i].z
        }
        line.geometry.setPositions(flatArr)
      }
      // strălucirea urmează amplitudinea
      const g = Math.min(1, amp * 4)
      glow.current[s] = g
      const mat = line.material
      tmp.copy(base[s]).lerp(hot, g)
      mat.color.copy(tmp)
      mat.linewidth = (s < 3 ? 3.2 - s * 0.35 : 2.2 - (s - 3) * 0.25) * (1 + g * 0.8)
      if (pending) busy = true
    }
    if (busy) invalidate()
  })

  // corzile pe cap, de la prăguș la chei (statice)
  const headLines = useMemo(() => [0, 1, 2, 3, 4, 5].map((s) => [new THREE.Vector3(-0.5, STRING_Y - 0.1, stringZ(s, 0)), pegPostPosition(s)]), [])

  function onTap(e: ThreeEvent<MouseEvent>, s: number) {
    // ignorăm "atingerile" care au fost de fapt rotiri ale camerei
    if (e.delta > 8) return
    e.stopPropagation()
    onPluck?.(s)
  }

  return (
    <group>
      {rest.map((pts, s) => (
        <Line
          key={s}
          ref={(l) => {
            lines.current[s] = l as unknown as Line2 | null
          }}
          points={pts}
          color={s < 3 ? COLORS.woundString : COLORS.plainString}
          lineWidth={s < 3 ? 3.2 - s * 0.35 : 2.2 - (s - 3) * 0.25}
        />
      ))}
      {headLines.map((pts, s) => (
        <Line key={`h${s}`} points={pts} color={s < 3 ? COLORS.woundString : COLORS.plainString} lineWidth={1.4} />
      ))}
      {/* zone invizibile, mai groase, ca să poți atinge o coardă cu degetul */}
      {[0, 1, 2, 3, 4, 5].map((s) => {
        const x0 = 0
        const z0 = stringZ(s, x0)
        const z1 = stringZ(s, SCALE)
        const len = SCALE
        const angle = Math.atan2(z1 - z0, len)
        return (
          <mesh
            key={`hit${s}`}
            position={[len / 2, STRING_Y, (z0 + z1) / 2]}
            rotation={[0, -angle, 0]}
            onClick={(e) => onTap(e, s)}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <boxGeometry args={[len, 0.9, 0.62]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        )
      })}
    </group>
  )
}
