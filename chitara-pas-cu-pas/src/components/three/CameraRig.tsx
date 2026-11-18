/**
 * Camera și controlul cu degetul (OrbitControls), plus tranziția lină între unghiuri.
 *
 * - modelul se rotește (slerp) spre orientarea unghiului ales, camera se apropie/îndepărtează lin
 * - cu degetul: rotire (1 deget), zoom (ciupire), mutare (2 degete) – cu limite, ca să nu pierzi chitara
 */
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { VIEWS, type ViewId } from './views'

const DURATION = 0.8 // secunde

/** Easing "ease-in-out" cubic */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function CameraRig({
  view,
  viewKey,
  model,
  mirror,
  focus,
}: {
  view: ViewId
  /** se schimbă când utilizatorul apasă din nou pe același unghi (reîncadrare) */
  viewKey: number
  model: React.RefObject<THREE.Group | null>
  mirror: boolean
  /** zona de grif de încadrat (pentru unghiurile apropiate); se ignoră la „Din față” */
  focus: { x: number; width: number }
}) {
  const { camera, invalidate, size } = useThree()
  const controls = useRef<OrbitControlsImpl | null>(null)
  const anim = useRef<{
    t0: number
    fromQ: THREE.Quaternion
    toQ: THREE.Quaternion
    fromCam: THREE.Vector3
    toCam: THREE.Vector3
    fromTarget: THREE.Vector3
    toTarget: THREE.Vector3
  } | null>(null)
  const first = useRef(true)
  // centrul în jurul căruia limităm mutarea (pan)
  const center = useRef(new THREE.Vector3())

  useEffect(() => {
    const g = model.current
    const c = controls.current
    if (!g || !c) return
    const def = VIEWS[view]
    const [rx, ry, rz, order] = def.rotation
    const d2r = THREE.MathUtils.degToRad
    // pentru stângaci, și înclinarea laterală se oglindește
    const toQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(d2r(rx), d2r(mirror ? -ry : ry), d2r(rz), order))
    // punctul de focus, transformat cu noua rotație (și oglindit pentru stângaci)
    const close = view !== 'front'
    const fx = close ? focus.x : def.focus[0]
    const f = new THREE.Vector3(fx * (mirror ? -1 : 1), def.focus[1], def.focus[2]).applyQuaternion(toQ)
    const toTarget = f
    // distanța la care lățimea dorită umple ecranul (ținând cont că pe telefon ecranul e îngust)
    const cam = camera as THREE.PerspectiveCamera
    const halfTan = Math.tan(d2r(cam.fov / 2))
    const fitWidth = close ? Math.max(focus.width, 17) * (view === 'player' ? 0.95 : 1) : def.fitWidth
    const distance = Math.max(fitWidth / 2 / (halfTan * Math.max(0.5, size.width / size.height)), 16)
    const toCam = f.clone().add(new THREE.Vector3(0, 0, distance))
    center.current.copy(new THREE.Vector3(32 * (mirror ? -1 : 1), 0, 0).applyQuaternion(toQ))
    if (first.current) {
      // prima afișare: fără animație
      g.quaternion.copy(toQ)
      camera.position.copy(toCam)
      c.target.copy(toTarget)
      c.update()
      first.current = false
      invalidate()
      return
    }
    anim.current = {
      t0: performance.now(),
      fromQ: g.quaternion.clone(),
      toQ,
      fromCam: camera.position.clone(),
      toCam,
      fromTarget: c.target.clone(),
      toTarget,
    }
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, viewKey, mirror, camera, model, invalidate, focus.x, focus.width])

  useFrame(() => {
    const a = anim.current
    const g = model.current
    const c = controls.current
    if (!a || !g || !c) return
    const t = Math.min(1, (performance.now() - a.t0) / 1000 / DURATION)
    const k = ease(t)
    g.quaternion.slerpQuaternions(a.fromQ, a.toQ, k)
    camera.position.lerpVectors(a.fromCam, a.toCam, k)
    c.target.lerpVectors(a.fromTarget, a.toTarget, k)
    c.update()
    if (t >= 1) anim.current = null
    invalidate()
  })

  // limităm mutarea: punctul privit nu poate pleca prea departe de chitară
  function clampTarget() {
    const c = controls.current
    if (!c) return
    const max = 45
    const d = c.target.clone().sub(center.current)
    if (d.length() > max) {
      const fix = d.setLength(d.length() - max)
      c.target.sub(fix)
      camera.position.sub(fix)
    }
  }

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping={false}
      minDistance={14}
      maxDistance={170}
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI - 0.05}
      rotateSpeed={0.7}
      zoomSpeed={0.9}
      screenSpacePanning
      onChange={clampTarget}
      onStart={() => (anim.current = null)}
    />
  )
}
