/**
 * Pana animată. Ascultă loviturile de strum (audio/events.ts) și trece peste corzi
 * exact când se aud: în jos (de la coarda 6 spre coarda 1) sau în sus.
 * Loviturile „în gol” (sloturile „-” din modele) o mișcă puțin mai sus, fără să atingă corzile.
 * După câteva secunde fără strum, pana se retrage într-o poziție de repaus.
 */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { onGuitarEvent, type GuitarEvent } from '../../audio/events'
import { STRING_Y, STRUM_X, stringZ } from './geometry'
import { COLORS, coloredMaterial } from './materials'
import { audioNow } from './Strings'

const PICK_OUTLINE = new THREE.MeshBasicMaterial({ color: '#111111', side: THREE.BackSide })

type StrumEvent = Extract<GuitarEvent, { type: 'strum' }>

const LEAD = 0.07 // pana pornește puțin înainte de prima coardă
const OVERSHOOT = 1.3 // cât trece dincolo de ultima coardă (cm)

const Z_LOW = stringZ(0, STRUM_X) + OVERSHOOT // dincolo de coarda 6
const Z_HIGH = stringZ(5, STRUM_X) - OVERSHOOT // dincolo de coarda 1

/** Forma penei: un triunghi cu colțuri rotunjite, extrudat subțire. */
function pickGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, -1.25) // vârful
  s.quadraticCurveTo(1.25, 0.1, 1.05, 0.85)
  s.quadraticCurveTo(0, 1.45, -1.05, 0.85)
  s.quadraticCurveTo(-1.25, 0.1, 0, -1.25)
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.04, bevelSegments: 1, curveSegments: 6 })
  g.center()
  return g
}

export function Pick() {
  const invalidate = useThree((s) => s.invalidate)
  const ref = useRef<THREE.Mesh>(null)
  const events = useRef<StrumEvent[]>([])
  const geo = useMemo(pickGeometry, [])
  // ultima poziție, ca pana să nu "sară" când pornește o lovitură nouă
  const restZ = useRef(Z_LOW + 1.2)

  useEffect(
    () =>
      onGuitarEvent((e) => {
        if (e.type !== 'strum') return
        events.current = [...events.current.filter((x) => x.when > audioNow() - 3), e].sort((a, b) => a.when - b.when)
        invalidate()
      }),
    [invalidate],
  )

  useFrame(() => {
    const m = ref.current
    if (!m) return
    const now = audioNow()
    const list = events.current
    // lovitura curentă: ultima care a început (ținând cont de avans)
    let cur: StrumEvent | null = null
    for (const e of list) if (e.when - LEAD <= now) cur = e
    const pending = list.some((e) => e.when - LEAD > now)

    let z = restZ.current
    let y = STRING_Y + 1.2
    let tilt = 0
    let busy = pending
    if (cur) {
      const down = cur.direction === 'down'
      const strings = cur.strings.length ? cur.strings : down ? [0, 1, 2, 3, 4, 5] : [5, 4, 3]
      const n = strings.length
      const zStart = down ? Z_LOW : Z_HIGH
      const zEnd = down ? Z_HIGH : stringZ(strings[n - 1], STRUM_X) + OVERSHOOT * (down ? -1 : 1)
      // momentele: începe cu LEAD înainte, trece prima coardă la `when`, ultima la when + (n-1)*spread
      const tFirst = cur.when
      const tLast = cur.when + (n - 1) * cur.spread
      const zFirst = stringZ(strings[0], STRUM_X)
      const zLast = stringZ(strings[n - 1], STRUM_X)
      if (now < tFirst) {
        const k = (now - (tFirst - LEAD)) / LEAD
        z = zStart + (zFirst - zStart) * k
      } else if (now < tLast) {
        const k = (now - tFirst) / Math.max(0.001, tLast - tFirst)
        z = zFirst + (zLast - zFirst) * k
      } else {
        const k = Math.min(1, (now - tLast) / 0.08)
        z = zLast + (zEnd - zLast) * k
      }
      const age = now - tLast
      // pana coboară la nivelul corzilor doar cât trece peste ele
      const contact = cur.ghost ? 0 : Math.max(0, 1 - Math.max(0, age) / 0.12)
      y = STRING_Y + 0.15 + (1 - contact) * (cur.ghost ? 1.4 : 0.9)
      tilt = (down ? 1 : -1) * 0.35 * contact
      restZ.current = z
      // după 2,5 s fără lovituri, pana revine încet în repaus
      if (age > 2.5) {
        const k = Math.min(1, (age - 2.5) / 0.6)
        z = z + (Z_LOW + 1.2 - z) * k
        y = y + 0.8 * k
        if (k >= 1) restZ.current = Z_LOW + 1.2
      }
      if (age < 3.2) busy = true
    }
    m.position.set(STRUM_X, y + 0.9, z)
    // vârful penei în jos, spre corzi; fața înclinată spre cameră (ca să se vadă și de sus),
    // plus o mică înclinare în direcția mișcării
    m.rotation.set(tilt - 0.95, 0, 0)
    if (busy) invalidate()
  })

  // pană albă cu contur negru: se vede și peste lemnul deschis, și peste gura neagră a chitarei
  return (
    <mesh ref={ref} geometry={geo} material={coloredMaterial(COLORS.pick, 0.3)} renderOrder={4}>
      <mesh geometry={geo} material={PICK_OUTLINE} scale={[1.1, 1.1, 1.6]} />
    </mesh>
  )
}
