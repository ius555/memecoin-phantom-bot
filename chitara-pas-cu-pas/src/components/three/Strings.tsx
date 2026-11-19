/**
 * Cele 6 corzi, ca cilindri metalici subțiri (bronz înfășurat pentru 6-5-4, oțel pentru 3-2-1).
 *
 * Vibrația se calculează pe placa video: un mic adaos la shader-ul materialului deplasează
 * punctele corzii între tastă și căluș (modul fundamental + armonica a doua). Pe procesor
 * actualizăm doar 3 numere pe coardă la fiecare cadru – foarte ieftin pe telefon.
 * Coarda care sună se și „aprinde” (emisie caldă).
 *
 * Corzile ascultă canalul de evenimente audio (audio/events.ts): orice notă cântată în aplicație
 * face coarda corespunzătoare să vibreze exact când se aude.
 */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { SCALE, STRING_Y, fretX, stringRadius, stringZ } from './geometry'
import { COLORS } from './materials'
import { winding } from './textures'
import { pegPostPosition } from './GuitarModel'
import { onGuitarEvent } from '../../audio/events'
import { getAudio } from '../../audio/context'

const DECAY = 2.4 // cât de repede se stinge vibrația vizuală (1/s)
const VIS_HZ = 14 // frecvența vibrației desenate (cea reală ar fi prea rapidă pentru ochi)
const X0 = -0.5 // capătul de la prăguș

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

interface StringUniforms {
  uAmp: { value: number }
  uPhase: { value: number }
  uStart: { value: number }
}

/** Material metalic cu deplasare în shader (vibrația) și emisie (strălucirea). */
function stringMaterial(s: number): { mat: THREE.MeshStandardMaterial; uniforms: StringUniforms } {
  const wound = s < 3
  const mat = new THREE.MeshStandardMaterial({
    color: wound ? COLORS.woundString : COLORS.plainString,
    metalness: 1,
    roughness: wound ? 0.42 : 0.22,
    emissive: '#ffd9a0',
    emissiveIntensity: 0,
  })
  if (wound) {
    const t = winding().clone()
    t.needsUpdate = true
    t.repeat.set(1, 420)
    mat.map = t
  }
  const uniforms: StringUniforms = { uAmp: { value: 0 }, uPhase: { value: 0 }, uStart: { value: 0 } }
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uAmp;\nuniform float uPhase;\nuniform float uStart;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        // uv.y = 0 la prăguș, 1 la căluș; vibrează doar porțiunea dintre tastă și căluș
        float u = uv.y;
        if (u > uStart && uAmp > 0.0) {
          float k = (u - uStart) / max(0.0001, 1.0 - uStart);
          transformed.y += uAmp * (sin(3.14159265 * k) * sin(uPhase) + 0.25 * sin(6.2831853 * k) * sin(uPhase * 1.7));
        }`,
      )
  }
  // fiecare coardă are programul ei de shader (uniforme proprii)
  mat.customProgramCacheKey = () => `string-${s}`
  return { mat, uniforms }
}

/** Geometria unei corzi: cilindru culcat de-a lungul gâtului, ușor oblic (corzile se depărtează spre căluș). */
function stringGeometry(s: number): THREE.BufferGeometry {
  const z0 = stringZ(s, X0)
  const z1 = stringZ(s, SCALE)
  const len = Math.hypot(SCALE - X0, z1 - z0)
  const g = new THREE.CylinderGeometry(stringRadius(s), stringRadius(s), len, 6, 64, true)
  g.rotateZ(-Math.PI / 2) // axa cilindrului: de la prăguș (−x) la căluș (+x)
  g.rotateY(-Math.atan2(z1 - z0, SCALE - X0))
  g.translate((X0 + SCALE) / 2, STRING_Y, (z0 + z1) / 2)
  return g
}

export function Strings({ onPluck }: { onPluck?: (s: number) => void }) {
  const invalidate = useThree((s) => s.invalidate)
  const hits = useRef<Hit[][]>([[], [], [], [], [], []])
  const strings = useMemo(() => [0, 1, 2, 3, 4, 5].map((s) => ({ geo: stringGeometry(s), ...stringMaterial(s) })), [])

  useEffect(
    () => () => {
      strings.forEach((x) => {
        x.geo.dispose()
        x.mat.dispose()
      })
    },
    [strings],
  )

  // ascultăm notele cântate și pornim animația
  useEffect(
    () =>
      onGuitarEvent((e) => {
        if (e.type !== 'note') return
        hits.current[e.string] = [...hits.current[e.string].slice(-2), { when: e.when, fret: e.fret, amp: 0.22 + e.velocity * 0.3 }]
        invalidate()
      }),
    [invalidate],
  )

  useFrame(() => {
    const now = audioNow()
    let busy = false
    for (let s = 0; s < 6; s++) {
      const { uniforms, mat } = strings[s]
      // doar ultima lovitură care a început deja contează
      const active = hits.current[s].filter((h) => h.when <= now).pop()
      if (hits.current[s].some((h) => h.when > now)) busy = true
      let amp = 0
      if (active) {
        const t = now - active.when
        amp = active.amp * Math.exp(-DECAY * t)
        if (amp < 0.004) amp = 0
        uniforms.uPhase.value = 2 * Math.PI * VIS_HZ * t
        // porțiunea care vibrează începe la tasta apăsată
        uniforms.uStart.value = active.fret > 0 ? (fretX(active.fret) - X0) / (SCALE - X0) : 0
      }
      uniforms.uAmp.value = amp
      mat.emissiveIntensity = Math.min(1.2, amp * 4.5)
      if (amp > 0) busy = true
    }
    if (busy) invalidate()
  })

  // corzile pe cap, de la prăguș la chei (statice, subțiri)
  const headLines = useMemo(() => [0, 1, 2, 3, 4, 5].map((s) => [new THREE.Vector3(-0.5, STRING_Y - 0.1, stringZ(s, 0)), pegPostPosition(s)]), [])

  function onTap(e: ThreeEvent<MouseEvent>, s: number) {
    // ignorăm "atingerile" care au fost de fapt rotiri ale camerei
    if (e.delta > 8) return
    e.stopPropagation()
    onPluck?.(s)
  }

  return (
    <group>
      {strings.map((x, s) => (
        <mesh key={s} geometry={x.geo} material={x.mat} renderOrder={2} />
      ))}
      {/* toate corzile de pe cap într-un singur obiect (un singur apel de desenare) */}
      <Line points={headLines.flat()} segments color="#bdb6a8" lineWidth={1.3} />
      {/* zone invizibile, mai groase, ca să poți atinge o coardă cu degetul */}
      {[0, 1, 2, 3, 4, 5].map((s) => {
        const z0 = stringZ(s, 0)
        const z1 = stringZ(s, SCALE)
        const angle = Math.atan2(z1 - z0, SCALE)
        return (
          <mesh
            key={`hit${s}`}
            position={[SCALE / 2, STRING_Y, (z0 + z1) / 2]}
            rotation={[0, -angle, 0]}
            onClick={(e) => onTap(e, s)}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <boxGeometry args={[SCALE, 1.2, 0.92]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        )
      })}
    </group>
  )
}
