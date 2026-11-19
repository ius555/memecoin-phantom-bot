/**
 * Detectarea acordurilor dintr-o melodie înregistrată (fișier audio).
 *
 * Pașii (metoda clasică din literatura de „chord recognition”):
 * 1. semnalul (mono, 11 025 Hz) e tăiat în ferestre de ~0,37 s, din 93 în 93 ms
 * 2. pentru fiecare fereastră: FFT → energia pe semitonuri → „albire” (scoatem fondul) →
 *    chromagramă (12 note) + chromagramă de bas (doar notele grave, care arată fundamentala)
 * 3. fiecare fereastră e comparată cu șabloanele celor 24 de acorduri majore/minore
 * 4. algoritmul Viterbi alege succesiunea cea mai probabilă, cu o „penalizare” la schimbare,
 *    ca rezultatul să nu sară între acorduri la fiecare zgomot
 * 5. segmentele prea scurte se lipesc de vecini
 *
 * Totul e în funcții pure (fără browser), ca să poată fi testat. Rezultatul e aproximativ:
 * merge bine pe înregistrări cu chitară/pian clar, mai puțin pe mixaje foarte încărcate.
 */
import { NOTE_NAMES } from '../music/theory'

export const ANALYSIS_RATE = 11025
const FRAME = 4096
const HOP = 1024

// ---------------------------------------------------------------- FFT (radix-2, în loc)
function makeFFT(n: number) {
  const levels = Math.log2(n)
  const rev = new Uint32Array(n)
  for (let i = 0; i < n; i++) {
    let r = 0
    for (let b = 0; b < levels; b++) r = (r << 1) | ((i >> b) & 1)
    rev[i] = r
  }
  const cos = new Float64Array(n / 2)
  const sin = new Float64Array(n / 2)
  for (let i = 0; i < n / 2; i++) {
    cos[i] = Math.cos((2 * Math.PI * i) / n)
    sin[i] = Math.sin((2 * Math.PI * i) / n)
  }
  return (re: Float64Array, im: Float64Array) => {
    for (let i = 0; i < n; i++) {
      const j = rev[i]
      if (j > i) {
        let t = re[i]
        re[i] = re[j]
        re[j] = t
        t = im[i]
        im[i] = im[j]
        im[j] = t
      }
    }
    for (let size = 2; size <= n; size *= 2) {
      const half = size / 2
      const step = n / size
      for (let start = 0; start < n; start += size) {
        for (let k = 0; k < half; k++) {
          const c = cos[k * step]
          const s = sin[k * step]
          const a = start + k
          const b = a + half
          const tr = re[b] * c + im[b] * s
          const ti = im[b] * c - re[b] * s
          re[b] = re[a] - tr
          im[b] = im[a] - ti
          re[a] += tr
          im[a] += ti
        }
      }
    }
  }
}

export interface ChromaFrame {
  chroma: Float32Array // 12 note, normalizat
  bass: Float32Array // 12 note, doar registrul grav
  energy: number
}

/**
 * Chromagramele unei melodii. `onProgress` primește 0..1; funcția cedează controlul din când în când
 * (await), ca interfața să rămână fluidă și pe telefon.
 */
export async function computeChroma(samples: Float32Array, sampleRate = ANALYSIS_RATE, onProgress?: (p: number) => void): Promise<ChromaFrame[]> {
  const fft = makeFFT(FRAME)
  const win = new Float64Array(FRAME)
  for (let i = 0; i < FRAME; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (FRAME - 1))
  const re = new Float64Array(FRAME)
  const im = new Float64Array(FRAME)
  const binHz = sampleRate / FRAME
  // pentru fiecare bin: nota MIDI cea mai apropiată și cât de aproape e de centrul ei
  const lo = Math.ceil(50 / binHz)
  const hi = Math.min(FRAME / 2 - 1, Math.floor(2000 / binHz))
  const binMidi = new Int16Array(hi + 1)
  const binW = new Float32Array(hi + 1)
  for (let k = lo; k <= hi; k++) {
    const m = 69 + 12 * Math.log2((k * binHz) / 440)
    const n = Math.round(m)
    binMidi[k] = n
    binW[k] = Math.max(0, 1 - Math.abs(m - n) * 2)
  }
  const frames: ChromaFrame[] = []
  const count = Math.max(0, Math.floor((samples.length - FRAME) / HOP) + 1)
  const semis = new Float64Array(128)
  for (let f = 0; f < count; f++) {
    const off = f * HOP
    let energy = 0
    for (let i = 0; i < FRAME; i++) {
      const v = samples[off + i]
      energy += v * v
      re[i] = v * win[i]
      im[i] = 0
    }
    fft(re, im)
    semis.fill(0)
    for (let k = lo; k <= hi; k++) {
      const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k])
      semis[binMidi[k]] += mag * binW[k]
    }
    // compresie logaritmică + "albire": scădem media vecinilor (scoate zgomotul și tobele)
    const comp = new Float64Array(128)
    for (let m = 0; m < 128; m++) comp[m] = Math.log1p(semis[m] * 10)
    const white = new Float64Array(128)
    for (let m = 22; m < 106; m++) {
      let avg = 0
      let n = 0
      for (let d = -6; d <= 6; d++) {
        if (d === 0) continue
        avg += comp[m + d] ?? 0
        n++
      }
      white[m] = Math.max(0, comp[m] - avg / n)
    }
    // armonicele notelor grave „mint”: a 5-a armonică a unei note sună ca terța ei mare (+28 semitonuri),
    // a 7-a ca septima mică (+34). Le scădem, altfel acordurile minore par majore.
    const chroma = new Float32Array(12)
    const bass = new Float32Array(12)
    for (let m = 28; m < 100; m++) {
      const v = white[m] - 0.55 * (white[m - 28] ?? 0) - 0.3 * (white[m - 34] ?? 0)
      if (v <= 0) continue
      chroma[m % 12] += v
      if (m < 55) bass[m % 12] += v * (m < 48 ? 1 : 0.5)
    }
    normalize(chroma)
    normalize(bass)
    frames.push({ chroma, bass, energy: energy / FRAME })
    if (f % 64 === 0) {
      onProgress?.(f / count)
      await new Promise((r) => setTimeout(r, 0))
    }
  }
  onProgress?.(1)
  return frames
}

function normalize(v: Float32Array) {
  let n = 0
  for (let i = 0; i < v.length; i++) n += v[i] * v[i]
  n = Math.sqrt(n)
  if (n > 0) for (let i = 0; i < v.length; i++) v[i] /= n
}

// ---------------------------------------------------------------- șabloane + Viterbi

export interface ChordLabel {
  name: string // ex. "C", "Am"; "N" = fără acord (liniște, doar tobe)
  root: number
  minor: boolean
}

/** Numele folosite în bibliotecă pentru cele 12 fundamentale (bemoli acolo unde e obiceiul). */
const ROOT_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const MINOR_NAMES = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm']

export const LABELS: ChordLabel[] = [
  ...ROOT_NAMES.map((n, r) => ({ name: n, root: r, minor: false })),
  ...MINOR_NAMES.map((n, r) => ({ name: n, root: r, minor: true })),
  { name: 'N', root: -1, minor: false },
]

const TEMPLATES = LABELS.slice(0, 24).map((l) => {
  const t = new Float32Array(12)
  t[l.root] = 1
  t[(l.root + (l.minor ? 3 : 4)) % 12] = 0.85
  t[(l.root + 7) % 12] = 0.85
  normalize(t)
  return t
})

function dot(a: Float32Array, b: Float32Array) {
  let s = 0
  for (let i = 0; i < 12; i++) s += a[i] * b[i]
  return s
}

export interface Segment {
  start: number // secunde
  end: number
  chord: string // numele din bibliotecă, sau "N"
}

/**
 * Din chromagrame → segmente de acorduri.
 * `stay` = cât de „lipicios” e un acord (mai mare = mai puține schimbări).
 */
export function chordsFromChroma(frames: ChromaFrame[], sampleRate = ANALYSIS_RATE, stay = 0.94): Segment[] {
  if (!frames.length) return []
  const secPerFrame = HOP / sampleRate
  const S = LABELS.length
  // pragul de liniște: o fracțiune din energia tipică a melodiei
  const energies = frames.map((f) => f.energy).sort((a, b) => a - b)
  const quiet = energies[Math.floor(energies.length * 0.5)] * 0.02
  // netezim chromagrama pe ~0,5 s (5 cadre), ca să nu conteze notele de trecere
  const smooth = frames.map((_, i) => {
    const c = new Float32Array(12)
    const b = new Float32Array(12)
    for (let d = -2; d <= 2; d++) {
      const f = frames[Math.min(frames.length - 1, Math.max(0, i + d))]
      for (let k = 0; k < 12; k++) {
        c[k] += f.chroma[k]
        b[k] += f.bass[k]
      }
    }
    normalize(c)
    normalize(b)
    return { c, b }
  })
  const beta = 14
  const emit = (i: number, s: number): number => {
    if (s === 24) return frames[i].energy < quiet ? 0 : -beta * 0.62
    if (frames[i].energy < quiet) return -beta
    const l = LABELS[s]
    // potrivirea cu șablonul + un mic bonus dacă basul cântă fundamentala
    return beta * (dot(smooth[i].c, TEMPLATES[s]) + 0.18 * smooth[i].b[l.root]) - beta
  }
  const logStay = Math.log(stay)
  const logMove = Math.log((1 - stay) / (S - 1))
  let prev = new Float64Array(S)
  for (let s = 0; s < S; s++) prev[s] = emit(0, s)
  const back: Uint8Array[] = []
  for (let i = 1; i < frames.length; i++) {
    const cur = new Float64Array(S)
    const bp = new Uint8Array(S)
    // cel mai bun predecesor "din altă stare" e același pentru toate (tranziții uniforme)
    let best = 0
    for (let s = 1; s < S; s++) if (prev[s] > prev[best]) best = s
    let second = best === 0 ? 1 : 0
    for (let s = 0; s < S; s++) if (s !== best && prev[s] > prev[second]) second = s
    for (let s = 0; s < S; s++) {
      const fromOther = s === best ? second : best
      const a = prev[s] + logStay
      const b = prev[fromOther] + logMove
      if (a >= b) {
        cur[s] = a
        bp[s] = s
      } else {
        cur[s] = b
        bp[s] = fromOther
      }
      cur[s] += emit(i, s)
    }
    back.push(bp)
    prev = cur
  }
  let state = 0
  for (let s = 1; s < S; s++) if (prev[s] > prev[state]) state = s
  const path = new Uint8Array(frames.length)
  path[frames.length - 1] = state
  for (let i = frames.length - 1; i > 0; i--) {
    state = back[i - 1][state]
    path[i - 1] = state
  }
  // segmente
  let segs: Segment[] = []
  let startIdx = 0
  for (let i = 1; i <= path.length; i++) {
    if (i === path.length || path[i] !== path[startIdx]) {
      // fereastra i acoperă [i*hop, i*hop + frame]; centrul ei e momentul reprezentativ
      const t0 = (startIdx * HOP + FRAME / 2) / sampleRate
      const t1 = (i * HOP + FRAME / 2) / sampleRate
      segs.push({ start: startIdx === 0 ? 0 : t0, end: t1, chord: LABELS[path[startIdx]].name })
      startIdx = i
    }
  }
  // lipim segmentele foarte scurte (< 0,45 s) de vecinul mai lung
  segs = mergeShort(segs, Math.max(0.45, secPerFrame * 4))
  return segs
}

function mergeShort(segs: Segment[], min: number): Segment[] {
  let changed = true
  let out = segs.slice()
  while (changed && out.length > 1) {
    changed = false
    for (let i = 0; i < out.length; i++) {
      const s = out[i]
      if (s.end - s.start >= min) continue
      const left = out[i - 1]
      const right = out[i + 1]
      const target = !left ? right : !right ? left : left.end - left.start >= right.end - right.start ? left : right
      if (target === left) left.end = s.end
      else right.start = s.start
      out.splice(i, 1)
      changed = true
      break
    }
    // unim vecinii identici
    out = out.reduce<Segment[]>((acc, s) => {
      const last = acc[acc.length - 1]
      if (last && last.chord === s.chord) last.end = s.end
      else acc.push({ ...s })
      return acc
    }, [])
  }
  return out
}

// ---------------------------------------------------------------- capodastru

const ROOT_INDEX: Record<string, number> = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 }

/** Cât de greu e un acord pentru un începător (acordurile deschise = ușoare, barré = grele). */
function difficulty(name: string): number {
  const easy = ['C', 'D', 'E', 'G', 'A', 'Am', 'Em', 'Dm', 'E7', 'A7', 'D7', 'G7', 'C7', 'Am7', 'Em7', 'Dm7']
  if (easy.includes(name)) return 1
  if (['F', 'Bm', 'B7'].includes(name)) return 3
  return 5
}

/** Transpune un acord cu `semitones` semitonuri (negativ = în jos). */
export function transposeChord(name: string, semitones: number): string {
  if (name === 'N') return name
  const m = name.match(/^([A-G][#b]?)(.*)$/)
  if (!m) return name
  const idx = ROOT_INDEX[m[1]]
  if (idx === undefined) return name
  const r = (((idx + semitones) % 12) + 12) % 12
  const minor = m[2].startsWith('m') && !m[2].startsWith('maj')
  return minor ? MINOR_NAMES[r] + m[2].slice(1) : ROOT_NAMES[r] + m[2]
}

/**
 * Capodastrul care face melodia cea mai ușoară: pentru fiecare tastă 0..7, acordurile se cântă cu
 * forme transpuse în jos; alegem tasta cu cele mai puține acorduri grele (ponderat cu durata).
 */
export function suggestCapo(segments: Segment[]): { capo: number; scores: number[] } {
  const scores = Array.from({ length: 8 }, (_, capo) =>
    segments.reduce((sum, s) => (s.chord === 'N' ? sum : sum + (s.end - s.start) * difficulty(transposeChord(s.chord, -capo))), 0),
  )
  let capo = 0
  for (let c = 1; c < 8; c++) if (scores[c] < scores[capo] * 0.9) capo = c
  return { capo, scores }
}

/** Numele unei note după indexul ei (pentru afișări). */
export const pcName = (pc: number) => NOTE_NAMES[pc]
