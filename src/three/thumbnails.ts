import * as THREE from 'three';
import type { BoardSpec } from '../data/types';
import { buildBoard } from './buildBoard';
import { makeEnvironment } from './env';
import type { Quality } from './quality';

/**
 * Miniaturile din carusel: fiecare placă e construită la rezoluție mică, randată o singură dată
 * într-un canvas separat și păstrată ca imagine. Costă zero în timpul rulării.
 */

const THUMB_QUALITY: Quality = { name: 'low', ppm: 7, maxTex: 768, pbr: false, shadowMap: 512, maxDpr: 1 };
const W = 320;
const H = 224;

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;

function setup() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);
  scene = new THREE.Scene();
  scene.environment = makeEnvironment(renderer);
  scene.environmentIntensity = 0.85;
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0xa98b5e, 0.5));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.4);
  key.position.set(-140, 320, 120);
  scene.add(key);
  camera = new THREE.PerspectiveCamera(26, W / H, 5, 3000);
}

export function renderThumbnail(spec: BoardSpec): string {
  if (!renderer) setup();
  const model = buildBoard(spec, THUMB_QUALITY);
  scene!.add(model.root);
  const half = (26 * Math.PI) / 360;
  const dist = (model.radius / Math.tan(Math.min(half, Math.atan(Math.tan(half) * (W / H))))) * 1.02;
  const az = 0.42;
  const pol = 0.82;
  camera!.position.set(Math.sin(az) * Math.sin(pol) * dist, Math.cos(pol) * dist, Math.cos(az) * Math.sin(pol) * dist);
  camera!.lookAt(0, model.height * 0.25, 0);
  renderer!.render(scene!, camera!);
  const url = renderer!.domElement.toDataURL('image/png');
  scene!.remove(model.root);
  model.dispose();
  return url;
}

export function disposeThumbnailRenderer() {
  if (!renderer) return;
  scene?.environment?.dispose();
  renderer.dispose();
  renderer.forceContextLoss();
  renderer = null;
  scene = null;
  camera = null;
}
