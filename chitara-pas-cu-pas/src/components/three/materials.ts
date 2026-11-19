/**
 * Materialele chitarei 3D – realiste (PBR: MeshStandardMaterial), cu texturi procedurale de lemn,
 * metal pentru taste și chei, os pentru prăguș și ștegul. Reflexiile vin dintr-un mediu de lumină
 * generat local (RoomEnvironment, vezi GuitarScene), deci nu se descarcă nimic.
 * Fiecare material se creează o singură dată și se refolosește.
 */
import * as THREE from 'three'
import { mahogany, rosette, rosewood, spruce, tortoise } from './textures'

export const COLORS = {
  woundString: '#c9a06a', // corzile groase (bronz)
  plainString: '#e4e2dc', // corzile subțiri (oțel)
  pick: '#f7f7f5', // pana – celuloid alb (cu contur negru, vezi Pick.tsx)
}

/** Repetă o textură astfel încât `size` cm din geometrie să acopere textura o dată. */
function scaled(tex: THREE.Texture, sizeU: number, sizeV: number, offsetV = 0.5): THREE.Texture {
  const t = tex.clone()
  t.needsUpdate = true
  t.repeat.set(1 / sizeU, 1 / sizeV)
  t.offset.set(0, offsetV)
  return t
}

type Key =
  | 'top'
  | 'sides'
  | 'binding'
  | 'rosette'
  | 'hole'
  | 'guard'
  | 'bridge'
  | 'bone'
  | 'neck'
  | 'fretboard'
  | 'fret'
  | 'inlay'
  | 'headstock'
  | 'post'
  | 'peg'

const cache = new Map<Key, THREE.Material>()

/** Materialul unei piese a chitarei, după cheie. */
export function material(key: Key): THREE.Material {
  const hit = cache.get(key)
  if (hit) return hit
  let m: THREE.Material
  switch (key) {
    case 'top': // molid lăcuit
      m = new THREE.MeshStandardMaterial({ map: scaled(spruce(), 50, 40), roughness: 0.32, metalness: 0 })
      break
    case 'sides': // palisandru lăcuit
      m = new THREE.MeshStandardMaterial({ map: scaled(rosewood(), 40, 30), roughness: 0.38, metalness: 0 })
      break
    case 'binding':
      m = new THREE.MeshStandardMaterial({ color: '#f4ead6', roughness: 0.35 })
      break
    case 'rosette':
      m = new THREE.MeshStandardMaterial({ map: rosette(), roughness: 0.45, transparent: true })
      break
    case 'hole':
      m = new THREE.MeshBasicMaterial({ color: '#140b06' })
      break
    case 'guard':
      m = new THREE.MeshStandardMaterial({ map: scaled(tortoise(), 8, 8, 0), roughness: 0.25 })
      break
    case 'bridge':
      m = new THREE.MeshStandardMaterial({ color: '#3a1d10', roughness: 0.55 })
      break
    case 'bone':
      m = new THREE.MeshStandardMaterial({ color: '#f6efe0', roughness: 0.45 })
      break
    case 'neck':
      m = new THREE.MeshStandardMaterial({ map: scaled(mahogany(), 40, 8), roughness: 0.4 })
      break
    case 'fretboard': // palisandru mat
      m = new THREE.MeshStandardMaterial({ map: scaled(rosewood(), 44, 8), roughness: 0.7 })
      break
    case 'fret': // alamă-nichel
      m = new THREE.MeshStandardMaterial({ color: '#dcdcd4', roughness: 0.22, metalness: 1 })
      break
    case 'inlay': // sidef
      m = new THREE.MeshStandardMaterial({ color: '#f6f1e6', roughness: 0.15, metalness: 0.1, emissive: '#3a3630' })
      break
    case 'headstock':
      m = new THREE.MeshStandardMaterial({ map: scaled(rosewood(), 20, 8), roughness: 0.35 })
      break
    case 'post': // cromat
      m = new THREE.MeshStandardMaterial({ color: '#d9dadc', roughness: 0.18, metalness: 1 })
      break
    case 'peg': // butoanele cheilor
      m = new THREE.MeshStandardMaterial({ color: '#efe7d6', roughness: 0.3, metalness: 0.05 })
      break
  }
  cache.set(key, m!)
  return m!
}

export type MaterialKey = Key

/** Material colorat (pentru degete, pană) – din cache, pe culoare. */
const colored = new Map<string, THREE.MeshStandardMaterial>()
export function coloredMaterial(color: string, roughness = 0.45): THREE.MeshStandardMaterial {
  const key = `${color}|${roughness}`
  let m = colored.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 })
    colored.set(key, m)
  }
  return m
}

/** Citește o culoare definită în CSS (ex. culorile degetelor --f1...), ca 3D-ul să urmeze tema. */
export function cssColor(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}
