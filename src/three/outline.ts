import * as THREE from 'three';

/**
 * Contur pentru piesa evidențiată: o „cochilie" desenată pe fețele din spate, împinsă în afară
 * cu o grosime constantă în pixeli. Folosește normale netezite, ca muchiile cutiilor să nu se rupă.
 */

const resolution = new THREE.Vector2(1, 1);
export function setOutlineResolution(w: number, h: number) {
  resolution.set(w, h);
}

export function makeOutlineMaterial(color: THREE.ColorRepresentation, thickness = 2.5) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uThickness: { value: thickness },
      uResolution: { value: resolution },
    },
    vertexShader: /* glsl */ `
      attribute vec3 smoothNormal;
      uniform float uThickness;
      uniform vec2 uResolution;
      void main() {
        vec4 p = vec4(position, 1.0);
        vec3 n = smoothNormal;
        #ifdef USE_INSTANCING
          p = instanceMatrix * p;
          n = mat3(instanceMatrix) * n;
        #endif
        vec4 clip = projectionMatrix * modelViewMatrix * p;
        vec3 vn = normalize(normalMatrix * n);
        vec2 dir = (projectionMatrix * vec4(vn, 0.0)).xy;
        float len = length(dir);
        dir = len > 1e-5 ? dir / len : vec2(0.0);
        clip.xy += dir * uThickness * 2.0 / uResolution * clip.w;
        gl_Position = clip;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(uColor, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

function ensureSmoothNormals(geo: THREE.BufferGeometry) {
  if (geo.getAttribute('smoothNormal')) return;
  const pos = geo.getAttribute('position');
  const nor = geo.getAttribute('normal');
  if (!nor) geo.computeVertexNormals();
  const normal = geo.getAttribute('normal');
  const acc = new Map<string, { n: THREE.Vector3; seen: Set<string> }>();
  const key = (i: number) => `${Math.round(pos.getX(i) * 200)},${Math.round(pos.getY(i) * 200)},${Math.round(pos.getZ(i) * 200)}`;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const k = key(i);
    let e = acc.get(k);
    if (!e) acc.set(k, (e = { n: new THREE.Vector3(), seen: new Set() }));
    v.fromBufferAttribute(normal, i);
    // fiecare direcție de normală contează o singură dată, indiferent de câte triunghiuri o repetă
    const nk = `${Math.round(v.x * 20)},${Math.round(v.y * 20)},${Math.round(v.z * 20)}`;
    if (!e.seen.has(nk)) {
      e.seen.add(nk);
      e.n.add(v);
    }
  }
  const out = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const n = acc.get(key(i))!.n;
    v.copy(n).normalize();
    out[i * 3] = v.x;
    out[i * 3 + 1] = v.y;
    out[i * 3 + 2] = v.z;
  }
  geo.setAttribute('smoothNormal', new THREE.BufferAttribute(out, 3));
}

/**
 * Creează conturul unui obiect (toate mesh-urile din el). Rezultatul se adaugă ca frate/copil
 * și se arată/ascunde cu `.visible`. Geometriile sunt partajate cu originalul.
 */
export function createOutline(source: THREE.Object3D, material: THREE.ShaderMaterial): THREE.Group {
  const group = new THREE.Group();
  group.userData.outline = true;
  source.updateWorldMatrix(true, true);
  const inv = new THREE.Matrix4().copy(source.matrixWorld).invert();
  source.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.visible || o.userData.outline) return;
    const mat = mesh.material as THREE.Material;
    if (Array.isArray(mesh.material) || (mat as THREE.MeshBasicMaterial).isMeshBasicMaterial) return;
    // planele cu text și marcajele de pini nu au volum: nu le conturăm
    if ((mesh.geometry as THREE.PlaneGeometry).type === 'PlaneGeometry' || mesh.geometry.type === 'CircleGeometry' || mesh.geometry.type === 'RingGeometry') return;
    ensureSmoothNormals(mesh.geometry);
    let clone: THREE.Mesh;
    const im = mesh as THREE.InstancedMesh;
    if (im.isInstancedMesh) {
      const c = new THREE.InstancedMesh(mesh.geometry, material, im.count);
      c.instanceMatrix = im.instanceMatrix;
      clone = c;
    } else {
      clone = new THREE.Mesh(mesh.geometry, material);
    }
    clone.matrixAutoUpdate = false;
    clone.matrix.multiplyMatrices(inv, mesh.matrixWorld);
    clone.raycast = () => {};
    clone.frustumCulled = false;
    clone.userData.outline = true;
    group.add(clone);
  });
  return group;
}
