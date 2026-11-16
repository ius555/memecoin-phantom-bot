import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, lazy, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useApp } from '../state/app';
import { stage } from '../state/stage';
import { makeEnvironment } from '../three/env';
import { setOutlineResolution } from '../three/outline';
import { buildDeskSet } from '../three/props';
import { QUALITY } from '../three/quality';
import { CameraRig } from './CameraRig';

const BoardsScene = lazy(() => import('../sections/boards/BoardsScene'));

const BACKDROP = '#e3d6bf';

function SceneSetup() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const size = useThree((s) => s.size);

  useEffect(() => {
    stage.renderer = gl;
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.02;
    scene.environment = makeEnvironment(gl);
    scene.environmentIntensity = 0.85;
    scene.background = new THREE.Color(BACKDROP);
    scene.fog = new THREE.Fog(BACKDROP, 1000, 2600);
  }, [gl, scene]);

  useEffect(() => {
    setOutlineResolution(size.width, size.height);
  }, [size]);

  return null;
}

function Desk() {
  const desk = useMemo(() => buildDeskSet(), []);
  return <primitive object={desk} />;
}

function Lights() {
  const s = QUALITY.shadowMap;
  return (
    <>
      <hemisphereLight args={['#fff4e0', '#a98b5e', 0.5]} />
      <directionalLight
        position={[-190, 340, 170]}
        intensity={2.35}
        color="#fff0d8"
        castShadow
        shadow-mapSize={[s, s]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.4}
        shadow-radius={QUALITY.name === 'high' ? 5 : 3}
      >
        <orthographicCamera attach="shadow-camera" args={[-430, 430, 330, -330, 80, 900]} />
      </directionalLight>
      <directionalLight position={[240, 110, -180]} intensity={0.4} color="#dce8ff" />
    </>
  );
}

/** Scena comună tuturor secțiunilor: birou, covoraș, lumini, cameră. Conținutul secțiunii se încarcă leneș. */
export default function Stage() {
  const section = useApp((s) => s.section);
  return (
    <Canvas
      className="!absolute inset-0"
      shadows="percentage"
      dpr={[1, QUALITY.maxDpr]}
      camera={{ fov: 30, near: 6, far: 6000, position: [150, 190, 260] }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      onPointerMissed={() => {
        const app = useApp.getState();
        if (app.selectedId) app.select(null);
        if (app.touchId) app.setTouch(null);
      }}
    >
      <SceneSetup />
      <Lights />
      <Desk />
      <CameraRig />
      <Suspense fallback={null}>{section === 'placi' && <BoardsScene />}</Suspense>
    </Canvas>
  );
}
