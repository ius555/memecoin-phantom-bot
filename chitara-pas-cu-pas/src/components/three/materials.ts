/**
 * Materiale și culori pentru modelul 3D.
 * Stil "cartoon": MeshToonMaterial cu doar 3 trepte de lumină (ieftin pe telefon, fără umbre).
 * Culorile urmează paleta aplicației: lemn cald, crem, verde salvie.
 */
import * as THREE from 'three'

let gradient: THREE.DataTexture | null = null

/** Textura de 3 trepte care dă aspectul de desen animat. */
function toonGradient(): THREE.DataTexture {
  if (gradient) return gradient
  const data = new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255])
  gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat)
  gradient.minFilter = THREE.NearestFilter
  gradient.magFilter = THREE.NearestFilter
  gradient.needsUpdate = true
  return gradient
}

const cache = new Map<string, THREE.Material>()

/** Material toon (refolosit din cache – un singur material pe culoare). */
export function toon(color: string): THREE.MeshToonMaterial {
  const key = `toon:${color}`
  let m = cache.get(key) as THREE.MeshToonMaterial | undefined
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: toonGradient() })
    cache.set(key, m)
  }
  return m
}

/** Material fără lumină (pentru detalii plate: gura, inlay-uri). */
export function flat(color: string): THREE.MeshBasicMaterial {
  const key = `flat:${color}`
  let m = cache.get(key) as THREE.MeshBasicMaterial | undefined
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color })
    cache.set(key, m)
  }
  return m
}

export const COLORS = {
  top: '#e8b97f', // fața din molid, culoarea mierii
  sides: '#a5643a', // lateralele și spatele din nuc
  binding: '#f3e6cf', // filetul crem de pe margine
  rosette: '#3f6b4a', // rozeta – verdele salvie al aplicației
  hole: '#2a1a10',
  neck: '#9a6136',
  fretboard: '#4a2d1b',
  fret: '#e7e0d0',
  inlay: '#f3e6cf',
  bone: '#f7efdc',
  bridge: '#4a2c18',
  headstock: '#5c3a22',
  peg: '#efe6d3',
  post: '#b9b0a0',
  woundString: '#c9a06a', // corzile groase (bronz)
  plainString: '#ddd8cc', // corzile subțiri (oțel)
  guard: '#6b3f22',
  pick: '#c8643a', // pana – teracotă
}

/** Citește o culoare definită în CSS (ex. culorile degetelor --f1...), ca 3D-ul să urmeze tema. */
export function cssColor(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}
