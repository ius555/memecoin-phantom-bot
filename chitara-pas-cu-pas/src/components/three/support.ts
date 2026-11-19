/**
 * Verifică dacă dispozitivul poate rula simulatorul 3D.
 * Fără WebGL → nu se poate. Telefon foarte slab (≤ 2 nuclee sau ≤ 2 GB RAM) → recomandăm 2D.
 */
export type Support = { ok: true } | { ok: false; reason: 'no-webgl' | 'weak' }

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
  if (cores <= 2 || mem <= 2) return (cached = { ok: false, reason: 'weak' })
  return (cached = { ok: true })
}

/** Mesajul prietenos afișat când revenim la 2D. */
export function fallbackMessage(reason: 'no-webgl' | 'weak' | 'slow' | 'error'): string {
  switch (reason) {
    case 'no-webgl':
      return 'Browserul tău nu poate afișa grafică 3D (lipsește WebGL 2), așa că îți arătăm diagrama 2D – are exact aceleași informații. Încearcă în Chrome actualizat, cu „Accelerare hardware” pornită.'
    case 'weak':
      return 'Pe acest dispozitiv, modelul 3D ar putea merge greu, așa că îți arătăm diagrama 2D. Poți încerca totuși 3D.'
    case 'slow':
      return 'Modelul 3D mergea prea încet pe acest dispozitiv, așa că am trecut la diagrama 2D.'
    case 'error':
      return 'Modelul 3D s-a oprit neașteptat. Între timp, iată diagrama 2D, cu aceleași informații.'
  }
}
