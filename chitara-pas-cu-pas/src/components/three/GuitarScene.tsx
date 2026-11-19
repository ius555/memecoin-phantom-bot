/**
 * Scena 3D a simulatorului (încărcată "leneș", doar când e nevoie – vezi Guitar3D.tsx).
 *
 * Performanță:
 * - frameloop "demand": se desenează un cadru doar când se mișcă ceva (cameră, animații, sunet)
 * - "never" când simulatorul nu e pe ecran
 * - fără umbre; materiale PBR cu un mediu de lumină generat o singură dată (RoomEnvironment, fără descărcări)
 * - rezoluție limitată (dpr ≤ 1,75); pe dispozitivele slabe sau când animația merge greu, coborâm la 1×
 * - NU trecem niciodată la 2D din cauza vitezei: modelul rămâne 3D, doar mai simplu desenat
 */
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import * as THREE from 'three'
import { GuitarModel } from './GuitarModel'
import { Strings } from './Strings'
import { CameraRig } from './CameraRig'
import { Fingers } from './Fingers'
import { Pick } from './Pick'
import { STRUM_X } from './geometry'
import type { ChordShape } from '../../music/chords'
import type { ViewId } from './views'
import { useState } from 'react'
import { chordFocus } from './chordLayout'

export interface GuitarSceneProps {
  /** poziția acordului afișat (aceleași date ca diagrama 2D) */
  shape?: ChordShape
  /** crește ca să repornească animația degetelor */
  replayKey: number
  /** se schimbă cu tema (culorile degetelor vin din CSS) */
  themeKey: string
  view: ViewId
  viewKey: number
  mirror: boolean
  /** când se cântă un ritm, camera cuprinde și zona unde lovește pana */
  strumming?: boolean
  /** randăm doar când simulatorul e vizibil */
  active: boolean
  onPluck?: (stringIndex: number) => void
  /** dispozitiv slab: pornim direct cu rezoluție redusă */
  lowQuality?: boolean
  /** apelat dacă se pierde contextul WebGL */
  onContextLost?: () => void
}

export default function GuitarScene({ strumming = false, shape, replayKey, themeKey, view, viewKey, mirror, active, onPluck, lowQuality = false, onContextLost }: GuitarSceneProps) {
  const model = useRef<THREE.Group>(null)
  const focus = useMemo(() => {
    const f = chordFocus(shape)
    if (!strumming) return f
    // includem și gura chitarei, unde trece pana
    const x0 = f.x - f.width / 2
    const x1 = STRUM_X + 5
    return { x: (x0 + x1) / 2, width: (x1 - x0) * 1.02 }
  }, [shape, strumming])
  // rezoluția: maxim 1,75× (pe ecranele foarte dense diferența nu se vede, dar costă mult)
  const [low, setLow] = useState(lowQuality)
  const dpr = low ? 1 : Math.min(1.75, window.devicePixelRatio || 1)
  // pe ecranele dense (și pe dispozitivele slabe) renunțăm la antialiasing – e scump pe telefon
  const [antialias] = useState(() => !lowQuality && (window.devicePixelRatio || 1) < 2)

  return (
    <Canvas
      frameloop={active ? 'demand' : 'never'}
      dpr={dpr}
      camera={{ fov: 38, near: 1, far: 800, position: [0, 0, 60] }}
      gl={{ antialias, alpha: true, powerPreference: 'default', stencil: false }}
      onCreated={({ gl }) => {
        // contextul pierdut se anunță o singură dată; Guitar3D reconstruiește scena
        gl.domElement.addEventListener(
          'webglcontextlost',
          (e) => {
            e.preventDefault()
            onContextLost?.()
          },
          { once: true },
        )
      }}
      style={{ touchAction: 'none' }}
    >
      {!low && <AdaptiveQuality onSlow={() => setLow(true)} />}
      <Lighting />
      <group ref={model}>
        <group scale={[mirror ? -1 : 1, 1, 1]}>
          <GuitarModel />
          <Strings onPluck={onPluck} />
          <Pick />
          <Fingers shape={shape} replayKey={replayKey} themeKey={themeKey} view={view} mirror={mirror} />
        </group>
      </group>
      <CameraRig view={view} viewKey={viewKey} model={model} mirror={mirror} focus={focus} />
    </Canvas>
  )
}

/**
 * Lumina: un mediu de reflexii generat local (o „cameră” virtuală luminoasă) pentru lemnul lăcuit
 * și metale, plus o lumină principală caldă și una de contur. Mediul se generează o singură dată.
 */
function Lighting() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.75
    pmrem.dispose()
    return () => {
      scene.environment = null
      env.dispose()
    }
  }, [gl, scene])
  return (
    <>
      <hemisphereLight args={['#fff4e6', '#3a2a22', 0.55]} />
      <directionalLight position={[30, 70, 50]} intensity={1.6} color="#fff1dc" />
      <directionalLight position={[-40, 10, -30]} intensity={0.5} color="#cfe3ff" />
    </>
  )
}

/**
 * Măsoară cât durează cadrele, dar numai în timpul animațiilor continue (cadre la < 120 ms unul de altul).
 * Cu randarea „la cerere”, pauzele dintre cadre sunt normale și nu înseamnă că telefonul e lent.
 * Dacă animația merge constant sub ~28 cadre/s, coborâm rezoluția (o singură dată). Nu trecem la 2D.
 */
function AdaptiveQuality({ onSlow }: { onSlow: () => void }) {
  const last = useRef(0)
  const samples = useRef<number[]>([])
  useFrame(() => {
    const now = performance.now()
    const dt = now - last.current
    last.current = now
    if (dt <= 0 || dt > 120) return
    samples.current.push(dt)
    if (samples.current.length >= 45) {
      const sorted = [...samples.current].sort((a, b) => a - b)
      const median = sorted[Math.floor(sorted.length / 2)]
      samples.current = []
      if (median > 36) onSlow()
    }
  })
  return null
}
