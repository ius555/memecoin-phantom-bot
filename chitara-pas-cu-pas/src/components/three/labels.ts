/**
 * Etichete desenate pe un canvas și folosite ca texturi pentru sprite-uri (mereu cu fața la cameră).
 * Mai ieftin decât textul 3D și nu are nevoie de fonturi descărcate – merge și offline.
 * Sprite-urile nu se oglindesc în modul stângaci, deci cifrele rămân lizibile.
 */
import * as THREE from 'three'

const cache = new Map<string, THREE.CanvasTexture>()

function make(key: string, draw: (c: CanvasRenderingContext2D, size: number) => void): THREE.CanvasTexture {
  const hit = cache.get(key)
  if (hit) return hit
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  draw(ctx, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 2
  cache.set(key, tex)
  return tex
}

const FONT = '800 82px Nunito, "Segoe UI", system-ui, sans-serif'

/** Bulină colorată cu o cifră albă (numărul degetului). */
export function numberBadge(text: string, color: string): THREE.CanvasTexture {
  return make(`badge:${text}:${color}`, (c, s) => {
    c.beginPath()
    c.arc(s / 2, s / 2, s / 2 - 6, 0, Math.PI * 2)
    c.fillStyle = color
    c.fill()
    c.lineWidth = 7
    c.strokeStyle = 'rgba(255,255,255,0.9)'
    c.stroke()
    c.fillStyle = '#fff'
    c.font = FONT
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText(text, s / 2, s / 2 + 5)
  })
}

/** „X” roșu = coarda nu se cântă. */
export function crossMark(color: string): THREE.CanvasTexture {
  return make(`x:${color}`, (c, s) => {
    c.beginPath()
    c.arc(s / 2, s / 2, s / 2 - 8, 0, Math.PI * 2)
    c.fillStyle = 'rgba(255,255,255,0.92)'
    c.fill()
    c.strokeStyle = color
    c.lineWidth = 14
    c.lineCap = 'round'
    const a = s * 0.32
    const b = s * 0.68
    c.beginPath()
    c.moveTo(a, a)
    c.lineTo(b, b)
    c.moveTo(b, a)
    c.lineTo(a, b)
    c.stroke()
  })
}

/** „O” = coardă liberă (se cântă fără să apeși). */
export function openMark(color: string): THREE.CanvasTexture {
  return make(`o:${color}`, (c, s) => {
    c.beginPath()
    c.arc(s / 2, s / 2, s / 2 - 8, 0, Math.PI * 2)
    c.fillStyle = 'rgba(255,255,255,0.92)'
    c.fill()
    c.beginPath()
    c.arc(s / 2, s / 2, s * 0.24, 0, Math.PI * 2)
    c.strokeStyle = color
    c.lineWidth = 13
    c.stroke()
  })
}

/** Text simplu (ex. numărul tastei), fără fundal. */
export function plainText(text: string, color: string): THREE.CanvasTexture {
  return make(`t:${text}:${color}`, (c, s) => {
    c.fillStyle = color
    c.font = '800 64px Nunito, "Segoe UI", system-ui, sans-serif'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText(text, s / 2, s / 2 + 4)
  })
}

/**
 * Cifra degetului, albă, cu contur închis – lizibilă peste orice fundal (bulina colorată, lemnul grifului).
 * Se folosește pe un sprite, deci e mereu cu fața spre cameră, din orice unghi.
 */
export function fingerDigit(text: string): THREE.CanvasTexture {
  return make(`digit:${text}`, (c, s) => {
    c.font = '900 104px Nunito, "Segoe UI", system-ui, sans-serif'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.lineJoin = 'round'
    c.lineWidth = 16
    c.strokeStyle = 'rgba(10,10,10,0.55)'
    c.strokeText(text, s / 2, s / 2 + 6)
    c.fillStyle = '#fff'
    c.fillText(text, s / 2, s / 2 + 6)
  })
}

/** Umbră moale (disc cu margini estompate), pusă pe grif sub fiecare deget – dă senzația de adâncime. */
export function softShadow(): THREE.CanvasTexture {
  return make('shadow', (c, s) => {
    const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(0,0,0,0.55)')
    g.addColorStop(0.45, 'rgba(0,0,0,0.35)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    c.fillStyle = g
    c.fillRect(0, 0, s, s)
  })
}
