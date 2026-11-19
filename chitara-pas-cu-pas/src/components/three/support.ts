/**
 * Verifică dacă dispozitivul poate rula simulatorul 3D.
 * Fără WebGL 2 → nu se poate (Three.js are nevoie de el). Dispozitiv slab (≤ 4 nuclee sau ≤ 3 GB RAM)
 * → 3D merge, dar desenat cu rezoluție redusă. Nu mai trecem la 2D doar pentru că telefonul e mai lent.
 */
/** ok + `low` = dispozitiv slab: 3D merge, dar desenat mai simplu (rezoluție redusă). */
export type Support = { ok: true; low: boolean } | { ok: false; reason: 'no-webgl' }

let cached: Support | null = null

export function check3DSupport(): Support {
  if (cached) return cached
  try {
    const canvas = document.createElement('canvas')
    // Three.js (versiunea folosită) are nevoie de WebGL 2; WebGL 1 singur nu ajunge
    const gl = canvas.getContext('webgl2')
    if (!gl) return (cached = { ok: false, reason: 'no-webgl' })
    // eliberăm imediat contextul de test
    ;(gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    return (cached = { ok: false, reason: 'no-webgl' })
  }
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const mem = nav.deviceMemory ?? 4
  return (cached = { ok: true, low: cores <= 4 || mem <= 3 })
}

/** Mesajul prietenos afișat când revenim la 2D. */
export function fallbackMessage(reason: 'no-webgl' | 'error'): string {
  switch (reason) {
    case 'no-webgl':
      return 'Browserul tău nu poate afișa grafică 3D (lipsește WebGL 2), așa că îți arătăm diagrama 2D – are exact aceleași informații. Încearcă în Chrome actualizat, cu „Accelerare hardware” pornită.'
    case 'error':
      return 'Modelul 3D s-a oprit neașteptat. Între timp, iată diagrama 2D, cu aceleași informații.'
  }
}
