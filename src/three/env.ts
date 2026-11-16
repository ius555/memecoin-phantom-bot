import * as THREE from 'three';

/**
 * Mediul din care se reflectă lumina în piesele metalice: o cameră simplă cu câteva panouri
 * luminoase, construită din cod (fără imagini HDR descărcate).
 */
function buildEnvScene() {
  const scene = new THREE.Scene();
  // Camera e gri-închis, iar lumina vine din panouri distincte: metalul capătă contrast, nu un bej uniform.
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(40, 24, 40),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 0.29, 0.28), side: THREE.BackSide }),
  );
  room.position.y = 9;
  scene.add(room);
  // tăblia de lemn se oglindește de jos
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.46, 0.4, 0.33) }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.9;
  scene.add(floor);

  const panel = (w: number, h: number, color: THREE.Color, pos: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  // lumina principală, caldă, sus-stânga-față
  panel(11, 8, new THREE.Color(7.5, 7, 6.1), [-9, 15, 8]);
  // plafon luminos
  panel(16, 16, new THREE.Color(1.25, 1.22, 1.16), [2, 20.6, -1]);
  // fereastră rece în dreapta
  panel(8, 11, new THREE.Color(2.6, 2.9, 3.4), [18.5, 7, -3]);
  // umplere din spate și din stânga
  panel(18, 6, new THREE.Color(1.5, 1.45, 1.35), [0, 8, -19]);
  panel(6, 8, new THREE.Color(1.2, 1.15, 1.1), [-19, 5, -6]);
  // panou mare în spatele privitorului: luminează fețele dinspre cameră ale conectorilor
  panel(22, 8, new THREE.Color(1.9, 1.85, 1.75), [4, 8, 19.5]);
  return scene;
}

const cache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

export function makeEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const hit = cache.get(renderer);
  if (hit) return hit;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const scene = buildEnvScene();
  const tex = pmrem.fromScene(scene, 0.035).texture;
  pmrem.dispose();
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
  });
  cache.set(renderer, tex);
  return tex;
}
