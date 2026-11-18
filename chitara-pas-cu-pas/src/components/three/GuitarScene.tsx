/**
 * Scena 3D a simulatorului (încărcată "leneș", doar când e nevoie – vezi Guitar3D.tsx).
 *
 * Performanță:
 * - frameloop "demand": se desenează un cadru doar când se mișcă ceva (cameră, animații, sunet)
 * - "never" când simulatorul nu e pe ecran
 * - fără umbre, materiale toon ieftine, rezoluție limitată (dpr ≤ 1,75)
 * - PerformanceMonitor: dacă telefonul nu face față, scădem rezoluția, apoi anunțăm trecerea la 2D
 */
import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { GuitarModel } from './GuitarModel'
import { Strings } from './Strings'
import { CameraRig } from './CameraRig'
import type { ViewId } from './views'
import { useState } from 'react'

export interface GuitarSceneProps {
  view: ViewId
  viewKey: number
  mirror: boolean
  /** randăm doar când simulatorul e vizibil */
  active: boolean
  onPluck?: (stringIndex: number) => void
  /** apelat dacă performanța e constant prea slabă */
  onPerformanceFail?: () => void
  /** apelat dacă se pierde contextul WebGL */
  onContextLost?: () => void
}

export default function GuitarScene({ view, viewKey, mirror, active, onPluck, onPerformanceFail, onContextLost }: GuitarSceneProps) {
  const model = useRef<THREE.Group>(null)
  const [dpr, setDpr] = useState(() => Math.min(1.75, window.devicePixelRatio || 1))

  return (
    <Canvas
      frameloop={active ? 'demand' : 'never'}
      dpr={dpr}
      camera={{ fov: 38, near: 1, far: 800, position: [0, 0, 60] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onContextLost?.()
        })
      }}
      style={{ touchAction: 'none' }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.5))}
        onFallback={() => onPerformanceFail?.()}
      />
      <ambientLight intensity={1.15} />
      <directionalLight position={[25, 60, 45]} intensity={1.7} />
      <directionalLight position={[-30, -20, 30]} intensity={0.35} />
      <group ref={model}>
        <group scale={[mirror ? -1 : 1, 1, 1]}>
          <GuitarModel />
          <Strings onPluck={onPluck} />
        </group>
      </group>
      <CameraRig view={view} viewKey={viewKey} model={model} mirror={mirror} />
    </Canvas>
  )
}
