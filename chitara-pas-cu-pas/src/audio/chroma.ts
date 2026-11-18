/**
 * Recunoașterea (simplă) a acordurilor: chromagramă + potrivire cu șabloane.
 *
 * Chromagrama = câtă energie are fiecare din cele 12 note (C, C#, D ... B),
 * indiferent de octavă. Un acord cântat corect are energie mare pe notele lui.
 * O comparăm cu "șablonul" fiecărui acord (notele lui) prin similaritate cosinus.
 * Funcții pure – se pot testa fără browser.
 */
import { CHORDS, chordPitchClasses, type Chord } from '../music/chords'
import { NOTE_NAMES } from '../music/theory'

/**
 * Calculează chromagrama din spectrul în decibeli (AnalyserNode.getFloatFrequencyData).
 * Folosim doar intervalul 75–1500 Hz (unde stau notele de chitară și primele armonice).
 */
export function chromaFromSpectrum(db: Float32Array, sampleRate: number, fftSize: number): Float32Array {
  const chroma = new Float32Array(12)
  const binHz = sampleRate / fftSize
  const lo = Math.ceil(75 / binHz)
  const hi = Math.min(db.length - 1, Math.floor(1500 / binHz))
  // nivelul de fond (mediana), ca să ignorăm zgomotul
  const mags: number[] = []
  for (let k = lo; k <= hi; k++) mags.push(Math.pow(10, db[k] / 20))
  const sorted = [...mags].sort((a, b) => a - b)
  const floor = sorted[Math.floor(sorted.length * 0.6)] ?? 0
  for (let k = lo; k <= hi; k++) {
    const mag = mags[k - lo] - floor
    if (mag <= 0) continue
    // doar vârfurile locale (centrele notelor), nu "pantele" lor
    if (db[k] < db[k - 1] || db[k] < db[k + 1]) continue
    const f = k * binHz
    const midi = 69 + 12 * Math.log2(f / 440)
    const nearest = Math.round(midi)
    if (Math.abs(midi - nearest) > 0.4) continue
    // notele grave contează puțin mai mult (armonicele înalte "mint" mai des)
    const weight = f < 400 ? 1.2 : 1
    chroma[((nearest % 12) + 12) % 12] += mag * weight
  }
  const max = Math.max(...chroma)
  if (max > 0) for (let i = 0; i < 12; i++) chroma[i] /= max
  return chroma
}

export interface ChordMatch {
  chord: Chord
  score: number
}

function template(ch: Chord): Float32Array {
  const t = new Float32Array(12)
  chordPitchClasses(ch).forEach((pc) => (t[pc] = 1))
  return t
}

const TEMPLATES = CHORDS.map((ch) => ({ chord: ch, t: template(ch) }))

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < 12; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0
}

/** Acordurile, ordonate după cât de bine se potrivesc cu chromagrama. */
export function rankChords(chroma: Float32Array, candidates: string[] = CHORDS.map((c) => c.name)): ChordMatch[] {
  return TEMPLATES.filter((x) => candidates.includes(x.chord.name))
    .map((x) => ({ chord: x.chord, score: cosine(chroma, x.t) }))
    .sort((a, b) => b.score - a.score)
}

/** Acordurile simple (majore/minore) – pentru o recunoaștere mai sigură la începători. */
export const BASIC_CHORDS = CHORDS.filter((c) => c.quality === '' || c.quality === 'm').map((c) => c.name)

/**
 * Verifică dacă acordul cântat e cel așteptat.
 * Corect = acordul țintă e primul (sau la egalitate cu primul) și se potrivește destul de bine.
 */
export function judgeChord(chroma: Float32Array, target: string, pool: string[] = BASIC_CHORDS) {
  const candidates = pool.includes(target) ? pool : [...pool, target]
  const ranked = rankChords(chroma, candidates)
  const t = ranked.find((r) => r.chord.name === target)
  const best = ranked[0]
  const ok = !!t && t.score >= 0.72 && t.score >= best.score - 0.02
  // notele acordului care aproape nu se aud
  const missing = t ? chordPitchClasses(t.chord).filter((pc) => chroma[pc] < 0.18).map((pc) => NOTE_NAMES[pc]) : []
  return { ok, best, target: t, missing }
}
