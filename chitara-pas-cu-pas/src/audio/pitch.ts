/**
 * Detectarea frecvenței (înălțimii) unei note, pentru acordor.
 *
 * Folosim metoda McLeod (MPM, "normalized square difference function"):
 * comparăm semnalul cu el însuși decalat; decalajul la care seamănă cel mai bine
 * este perioada notei. E robustă pentru chitară, unde armonicele sunt puternice.
 * Funcție pură – se poate testa fără browser.
 */
export function detectPitch(buf: Float32Array, sampleRate: number, minFreq = 60, maxFreq = 1000): { freq: number; clarity: number } | null {
  const n = buf.length
  // prea liniște → nu încercăm
  let rms = 0
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / n)
  if (rms < 0.004) return null

  const maxLag = Math.min(n - 1, Math.floor(sampleRate / minFreq))
  const minLag = Math.max(2, Math.floor(sampleRate / maxFreq))
  const nsdf = new Float32Array(maxLag + 1)
  for (let tau = 0; tau <= maxLag; tau++) {
    let acf = 0
    let m = 0
    for (let i = 0; i < n - tau; i++) {
      acf += buf[i] * buf[i + tau]
      m += buf[i] * buf[i] + buf[i + tau] * buf[i + tau]
    }
    nsdf[tau] = m > 0 ? (2 * acf) / m : 0
  }

  // căutăm vârfurile pozitive dintre treceri prin zero și îl alegem pe primul "suficient de înalt"
  const peaks: number[] = []
  let pos = false
  let best = -1
  for (let tau = 1; tau <= maxLag; tau++) {
    if (nsdf[tau] > 0 && nsdf[tau - 1] <= 0) {
      pos = true
      best = tau
    } else if (nsdf[tau] <= 0 && nsdf[tau - 1] > 0) {
      if (pos && best >= minLag) peaks.push(best)
      pos = false
    }
    if (pos && nsdf[tau] > nsdf[best]) best = tau
  }
  if (pos && best >= minLag) peaks.push(best)
  if (!peaks.length) return null

  const highest = Math.max(...peaks.map((t) => nsdf[t]))
  const chosen = peaks.find((t) => nsdf[t] >= 0.9 * highest)!
  // interpolare parabolică pentru o perioadă mai precisă decât un eșantion
  const a = nsdf[chosen - 1]
  const b = nsdf[chosen]
  const c = nsdf[chosen + 1] ?? b
  const denom = a - 2 * b + c
  const shift = denom !== 0 ? (0.5 * (a - c)) / denom : 0
  const period = chosen + shift
  return { freq: sampleRate / period, clarity: b }
}
