import { CameraControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import CameraControlsImpl from 'camera-controls';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useApp, type ViewPreset } from '../state/app';
import { stage, useStage } from '../state/stage';
import { useFind } from '../sections/boards/find';
import { useLayout } from '../ui/useLayout';

const VIEWS: Record<ViewPreset, { az: number; pol: number; k: number }> = {
  'trei-sferturi': { az: 0.44, pol: 0.84, k: 1 },
  sus: { az: 0, pol: 0.0008, k: 0.9 },
  jos: { az: 0, pol: 0.0008, k: 0.9 },
  fata: { az: 0, pol: 1.36, k: 0.86 },
};

const TAU = Math.PI * 2;
const tmp = new THREE.Vector3();

/** Camera: un deget rotește, două degete fac zoom și mutare; butoanele duc lin la vederile fixe. */
export function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const layout = useLayout();

  const section = useApp((s) => s.section);
  const view = useApp((s) => s.view);
  const nonce = useApp((s) => s.viewNonce);
  const boardId = useApp((s) => s.boardId);
  const selectedId = useApp((s) => s.selectedId);
  const pinout = useApp((s) => s.pinout);
  const labels = useApp((s) => s.labels);
  const autoRotate = useApp((s) => s.autoRotate);
  const playing = useFind((s) => s.phase === 'play');
  const fit = useStage((s) => s.fit);
  const cardBottom = useStage((s) => s.cardBottom);

  // Zona de ecran rămasă liberă după ce scădem panourile interfeței.
  const insets = useMemo(() => {
    const panel = (selectedId !== null || pinout || playing) && section === 'placi';
    if (section !== 'placi') return { l: 0, r: 0, t: 60, b: 20 };
    if (layout.mobile) {
      if (layout.short) return { l: 0, r: 0, t: 52, b: 96 };
      const sheet = selectedId !== null || pinout;
      // sus: cardul plăcii (sau panoul jocului); jos: bara și caruselul, ori foaia deschisă
      const top = playing ? 262 : cardBottom > 0 ? cardBottom + 6 : 62;
      return { l: labels ? 30 : 0, r: labels ? 30 : 0, t: top, b: sheet ? Math.round(layout.h * 0.46) : 158 };
    }
    // telefon pe orizontală: cardul compact în stânga, doar bara de vederi jos
    if (layout.short) return { l: 296, r: panel ? 336 : labels ? 96 : 0, t: 58, b: 60 };
    const side = labels ? 150 : 0;
    // cu panoul din dreapta deschis, placa trebuie să încapă între el și cardul din stânga
    const topDown = view === 'sus' || view === 'jos';
    const left = (panel || topDown) && layout.w < 1900 ? 404 : Math.max(side, layout.w < 1500 ? 150 : 0);
    return { l: left, r: panel ? 392 : topDown ? Math.max(side, 40) : side, t: 76, b: 178 };
  }, [layout, section, selectedId, pinout, labels, playing, view, cardBottom]);

  const distance = useMemo(() => {
    const safeW = Math.max(120, size.width - insets.l - insets.r);
    const safeH = Math.max(120, size.height - insets.t - insets.b);
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fitV = tanV * (safeH / size.height);
    const fitH = tanV * (size.width / size.height) * (safeW / size.width);
    // pe ecrane late lăsăm mai mult birou în jurul plăcii
    return (fit.radius / Math.min(fitV, fitH)) * (layout.mobile ? 1.04 : 1.3);
  }, [size, insets, camera.fov, fit.radius, layout.mobile]);

  const first = useRef(true);
  const idleSince = useRef(0);
  const dragging = useRef(false);

  // limitele camerei
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    stage.controls = c;
    c.minPolarAngle = 0;
    c.maxPolarAngle = Math.PI * 0.485;
    c.smoothTime = 0.28;
    c.draggingSmoothTime = 0.09;
    c.dollySpeed = 0.7;
    c.truckSpeed = 1.6;
    c.setBoundary(new THREE.Box3(new THREE.Vector3(-170, 0, -110), new THREE.Vector3(170, 50, 110)));
    c.touches.one = CameraControlsImpl.ACTION.TOUCH_ROTATE;
    c.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY_TRUCK;
    c.touches.three = CameraControlsImpl.ACTION.TOUCH_TRUCK;
    const start = () => (dragging.current = true);
    const end = () => {
      dragging.current = false;
      idleSince.current = performance.now();
    };
    c.addEventListener('controlstart', start);
    c.addEventListener('controlend', end);
    return () => {
      c.removeEventListener('controlstart', start);
      c.removeEventListener('controlend', end);
      if (stage.controls === c) stage.controls = null;
    };
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.minDistance = 28;
    c.maxDistance = Math.max(distance * 2.4, 760);
  }, [distance]);

  // aplică vederea aleasă
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const v = VIEWS[view];
    const animate = !first.current;
    first.current = false;
    // drumul cel mai scurt pe azimut, oricâte ture a făcut camera
    const az = v.az + TAU * Math.round((c.azimuthAngle - v.az) / TAU);
    if (section !== 'placi') {
      // secțiunile fără placă arată tot biroul
      void c.rotateTo(az + 0.1, 0.92, animate);
      void c.dollyTo(Math.min(c.maxDistance, 720), animate);
      void c.moveTo(0, 0, 10, animate);
      return;
    }
    const targetY = view === 'jos' ? fit.height * 0.6 : fit.height * 0.3 + 3;
    void c.rotateTo(az, v.pol, animate);
    void c.dollyTo(distance * v.k, animate);
    void c.moveTo(0, targetY, 0, animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, nonce, boardId, distance, fit.height, section]);

  // apropie camera de piesa selectată
  const lastSelected = useRef<string | null>(null);
  useEffect(() => {
    const c = ref.current;
    // doar la o schimbare reală de selecție, nu și la montare
    if (!c || lastSelected.current === selectedId) return;
    lastSelected.current = selectedId;
    if (section !== 'placi') return;
    const part = selectedId ? stage.model?.parts.get(selectedId) : null;
    if (part && stage.boardGroup) {
      stage.boardGroup.updateWorldMatrix(true, false);
      tmp.copy(part.anchor).applyMatrix4(stage.boardGroup.matrixWorld);
      void c.moveTo(tmp.x, Math.max(2, tmp.y * 0.6), tmp.z, true);
      void c.dollyTo(Math.max(distance * 0.62, 70), true);
    } else {
      const v = VIEWS[useApp.getState().view];
      void c.moveTo(0, fit.height * 0.3 + 3, 0, true);
      void c.dollyTo(distance * v.k, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // decalajul imaginii, ca placa să stea în mijlocul zonei libere
  const offset = useRef(new THREE.Vector2());
  const applied = useRef({ x: NaN, y: NaN, w: 0, h: 0 });
  useFrame((_, dt) => {
    const c = ref.current;
    const tx = (insets.l - insets.r) / 2;
    const ty = (insets.t - insets.b) / 2;
    const k = 1 - Math.exp(-dt * 7);
    offset.current.x += (tx - offset.current.x) * k;
    offset.current.y += (ty - offset.current.y) * k;
    const ox = Math.round(offset.current.x * 2) / 2;
    const oy = Math.round(offset.current.y * 2) / 2;
    const a = applied.current;
    if (a.x !== ox || a.y !== oy || a.w !== size.width || a.h !== size.height) {
      camera.setViewOffset(size.width, size.height, -ox, -oy, size.width, size.height);
      applied.current = { x: ox, y: oy, w: size.width, h: size.height };
    }
    if (c && autoRotate && !dragging.current && !selectedId && performance.now() - idleSince.current > 1400) {
      void c.rotate(dt * 0.22, 0, false);
    }
  });

  return <CameraControls ref={ref} makeDefault />;
}
