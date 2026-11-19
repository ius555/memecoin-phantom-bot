/**
 * Texturi procedurale pentru chitara 3D, desenate pe canvas la prima folosire (fără imagini descărcate):
 * fibra lemnului (molid, palisandru, mahon), rozeta mozaic, placa de protecție (model de baga),
 * spirala corzilor groase. Fiecare textură se generează o singură dată și se refolosește.
 */
import * as THREE from 'three'

/** Generator pseudo-aleator determinist (aceeași chitară la fiecare încărcare). */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const cache = new Map<string, THREE.CanvasTexture>()

function make(key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, repeat = true): THREE.CanvasTexture {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx)
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping
  cache.set(key, t)
  return t
}

/**
 * Fibră de lemn: linii aproape paralele, ușor ondulate, de grosimi și nuanțe diferite.
 * Liniile merg de-a lungul axei X a texturii (adică de-a lungul chitarei).
 */
function woodGrain(key: string, base: [string, string], line: string, light: string, density: number, wave: number, seed: number) {
  return make(key, 1024, 512, (c) => {
    const r = rng(seed)
    const g = c.createLinearGradient(0, 0, 0, 512)
    g.addColorStop(0, base[0])
    g.addColorStop(0.5, base[1])
    g.addColorStop(1, base[0])
    c.fillStyle = g
    c.fillRect(0, 0, 1024, 512)
    for (let i = 0; i < density; i++) {
      const y0 = r() * 512
      const thick = 0.6 + r() * (r() < 0.15 ? 3.2 : 1.4)
      c.strokeStyle = r() < 0.75 ? line : light
      c.globalAlpha = 0.18 + r() * 0.35
      c.lineWidth = thick
      c.beginPath()
      const ph = r() * Math.PI * 2
      const amp = wave * (0.4 + r())
      for (let x = 0; x <= 1024; x += 16) {
        const y = y0 + Math.sin(x / 140 + ph) * amp + Math.sin(x / 37 + ph * 2) * amp * 0.25
        if (x === 0) c.moveTo(x, y)
        else c.lineTo(x, y)
      }
      c.stroke()
    }
    c.globalAlpha = 1
  })
}

/** Molid (fața chitarei): deschis, cu fibră fină și dreaptă. */
export const spruce = () => woodGrain('spruce', ['#ecc792', '#f3d6a6'], '#c99a5e', '#fbe7c4', 260, 1.2, 7)
/** Palisandru (grif, spate, laterale): închis, cu dungi neregulate. */
export const rosewood = () => woodGrain('rosewood', ['#4b2717', '#5c3220'], '#2a130a', '#7b4630', 220, 5, 11)
/** Mahon (gât, cap): brun-roșcat, cu fibră medie. */
export const mahogany = () => woodGrain('mahogany', ['#8d4a2a', '#9b5633'], '#5e2c16', '#b46d45', 180, 2.5, 23)

/** Rozeta: inele concentrice, cu un inel de mozaic colorat (culorile aplicației). */
export function rosette() {
  return make(
    'rosette',
    512,
    512,
    (c) => {
      const cx = 256
      const r = rng(5)
      c.clearRect(0, 0, 512, 512)
      // RingGeometry mapează inelul [inner, outer] pe pătrat; raportul nostru: inner/outer ≈ 0,78
      const ring = (r0: number, r1: number, color: string) => {
        c.beginPath()
        c.arc(cx, cx, r1, 0, Math.PI * 2)
        c.arc(cx, cx, r0, 0, Math.PI * 2, true)
        c.fillStyle = color
        c.fill()
      }
      ring(196, 256, '#2a1a10')
      ring(200, 252, '#f3e6cf')
      ring(204, 248, '#2a1a10')
      // mozaic: segmente mici colorate, în 2 rânduri
      const colors = ['#1a1a1a', '#f3e6cf', '#7a4a2a', '#f3e6cf', '#2a2a2a', '#c49a6c']
      for (let row = 0; row < 2; row++) {
        const r0 = 210 + row * 18
        const r1 = r0 + 16
        const n = 72
        for (let k = 0; k < n; k++) {
          const a0 = (k / n) * Math.PI * 2
          const a1 = ((k + 1) / n) * Math.PI * 2
          c.beginPath()
          c.arc(cx, cx, r1, a0, a1)
          c.arc(cx, cx, r0, a1, a0, true)
          c.fillStyle = colors[(k + row * 3 + Math.floor(r() * 1.3)) % colors.length]
          c.fill()
        }
      }
    },
    false,
  )
}

/** Placa de protecție: model de baga (pete calde, translucide). */
export function tortoise() {
  return make('tortoise', 256, 256, (c) => {
    const r = rng(42)
    c.fillStyle = '#5a2410'
    c.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 90; i++) {
      const x = r() * 256
      const y = r() * 256
      const rad = 6 + r() * 28
      const g = c.createRadialGradient(x, y, 0, x, y, rad)
      const col = r() < 0.5 ? '200,110,40' : r() < 0.6 ? '140,60,20' : '30,12,5'
      g.addColorStop(0, `rgba(${col},0.55)`)
      g.addColorStop(1, `rgba(${col},0)`)
      c.fillStyle = g
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2)
    }
  })
}

/** Spirala corzilor groase (bronz înfășurat): dungi fine pe lungime. */
export function winding() {
  return make('winding', 8, 64, (c) => {
    for (let y = 0; y < 64; y++) {
      const t = (y % 8) / 8
      const v = 150 + Math.round(90 * Math.sin(t * Math.PI))
      c.fillStyle = `rgb(${v},${v},${v})`
      c.fillRect(0, y, 8, 1)
    }
  })
}
