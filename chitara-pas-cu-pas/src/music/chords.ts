/**
 * Biblioteca de acorduri.
 *
 * Fiecare poziție se scrie compact, de la coarda 6 (Mi grav) la coarda 1 (Mi acut):
 *   frets:   "x32010"  → x = coardă care nu se cântă, 0 = coardă liberă, cifră = tasta apăsată
 *   fingers: "032010"  → ce deget apasă (1 arătător, 2 mijlociu, 3 inelar, 4 mic, 0 = niciunul)
 * Pentru taste ≥ 10 folosește spații: "x 8 10 10 10 8".
 * Un barré se detectează automat: același deget pe mai multe corzi, la aceeași tastă.
 */
import type { Frets } from '../audio/guitar'
import { NOTE_NAMES, SOLFEGE, midiAt, pitchClass } from './theory'

export interface ChordShape {
  frets: Frets
  fingers: number[]
  /** numele variantei, ex. „deschis”, „barré la tasta 3” */
  label: string
}

export type ChordQuality = '' | 'm' | '7' | 'm7' | 'maj7' | 'sus2' | 'sus4' | 'add9'

export interface Chord {
  name: string
  root: string
  quality: ChordQuality
  shapes: ChordShape[]
}

function parse(s: string): string[] {
  return s.includes(' ') ? s.trim().split(/\s+/) : s.split('')
}

/** Creează o poziție din notația compactă. */
export function shape(frets: string, fingers: string, label = 'deschis'): ChordShape {
  return {
    frets: parse(frets).map((c) => (c === 'x' ? null : Number(c))),
    fingers: parse(fingers).map((c) => (c === 'x' ? 0 : Number(c))),
    label,
  }
}

const c = (name: string, ...shapes: ChordShape[]): Chord => {
  const m = name.match(/^([A-G][#b]?)(.*)$/)!
  return { name, root: m[1], quality: m[2] as ChordQuality, shapes }
}

export const CHORDS: Chord[] = [
  // ---------- majore ----------
  c('C', shape('x32010', '032010'), shape('x35553', '013331', 'barré la tasta 3 (forma A)')),
  c('D', shape('xx0232', '000132'), shape('x57775', '013331', 'barré la tasta 5 (forma A)')),
  c('E', shape('022100', '023100'), shape('x 7 9 9 9 7', '013331', 'barré la tasta 7 (forma A)')),
  c('F', shape('133211', '134211', 'barré complet'), shape('xx3211', '003211', 'F mic (fără barré)'), shape('x 8 10 10 10 8', '013331', 'barré la tasta 8 (forma A)')),
  c('G', shape('320003', '210003'), shape('320033', '210034', 'deschis, cu 4 degete'), shape('355433', '134211', 'barré la tasta 3 (forma E)')),
  c('A', shape('x02220', '001230'), shape('577655', '134211', 'barré la tasta 5 (forma E)')),
  c('B', shape('x24442', '013331', 'barré la tasta 2 (forma A)'), shape('7 9 9 8 7 7', '134211', 'barré la tasta 7 (forma E)')),
  // ---------- minore ----------
  c('Am', shape('x02210', '002310'), shape('577555', '134111', 'barré la tasta 5 (forma Em)')),
  c('Em', shape('022000', '023000'), shape('x 7 9 9 8 7', '013421', 'barré la tasta 7 (forma Am)')),
  c('Dm', shape('xx0231', '000231'), shape('x57765', '013421', 'barré la tasta 5 (forma Am)')),
  c('Bm', shape('x24432', '013421', 'barré la tasta 2 (forma Am)'), shape('7 9 9 7 7 7', '134111', 'barré la tasta 7 (forma Em)')),
  c('F#m', shape('244222', '134111', 'barré la tasta 2 (forma Em)')),
  c('Cm', shape('x35543', '013421', 'barré la tasta 3 (forma Am)')),
  c('Gm', shape('355333', '134111', 'barré la tasta 3 (forma Em)')),
  // ---------- cu septimă ----------
  c('E7', shape('020100', '020100'), shape('022130', '023140', 'deschis, plin')),
  c('A7', shape('x02020', '002030')),
  c('D7', shape('xx0212', '000213')),
  c('G7', shape('320001', '320001')),
  c('C7', shape('x32310', '032410')),
  c('B7', shape('x21202', '021304')),
  // ---------- minore cu septimă ----------
  c('Am7', shape('x02010', '002010')),
  c('Em7', shape('020000', '020000'), shape('022030', '023040', 'deschis, plin')),
  c('Dm7', shape('xx0211', '000211')),
  // ---------- maj7 ----------
  c('Cmaj7', shape('x32000', '032000')),
  c('Fmaj7', shape('xx3210', '003210')),
  c('Gmaj7', shape('320002', '320001')),
  c('Amaj7', shape('x02120', '002130')),
  c('Dmaj7', shape('xx0222', '000123')),
  // ---------- sus2 / sus4 / add9 ----------
  c('Dsus2', shape('xx0230', '000130')),
  c('Dsus4', shape('xx0233', '000134')),
  c('Asus2', shape('x02200', '001200')),
  c('Asus4', shape('x02230', '001230')),
  c('Esus4', shape('022200', '023400')),
  c('Csus2', shape('x30033', '010034')),
  c('Gsus4', shape('330013', '230014')),
  c('Cadd9', shape('x32030', '021030')),
]

const BY_NAME = new Map(CHORDS.map((ch) => [ch.name, ch]))

export function getChord(name: string): Chord | undefined {
  return BY_NAME.get(name)
}

const QUALITY_RO: Record<ChordQuality, string> = {
  '': 'major',
  m: 'minor',
  '7': 'cu septimă',
  m7: 'minor cu septimă',
  maj7: 'major cu septimă mare',
  sus2: 'cu secundă suspendată',
  sus4: 'cu cvartă suspendată',
  add9: 'cu nonă adăugată',
}

export const QUALITY_GROUPS: { id: string; label: string; qualities: ChordQuality[] }[] = [
  { id: 'major', label: 'Majore', qualities: [''] },
  { id: 'minor', label: 'Minore', qualities: ['m'] },
  { id: '7', label: '7 / m7', qualities: ['7', 'm7'] },
  { id: 'maj7', label: 'maj7', qualities: ['maj7'] },
  { id: 'sus', label: 'sus / add', qualities: ['sus2', 'sus4', 'add9'] },
]

/** Numele românesc complet, ex. "Am" → "La minor" */
export function chordFullName(ch: Chord): string {
  return `${SOLFEGE[NOTE_NAMES[pitchClass(ch.root)]] ?? ch.root} ${QUALITY_RO[ch.quality]}`
}

/** Notele (nume) pe care le cântă fiecare coardă dintr-o poziție. */
export function shapeNotes(s: ChordShape): (string | null)[] {
  return s.frets.map((f, i) => (f === null ? null : NOTE_NAMES[midiAt(i, f) % 12]))
}

/** Clasele de înălțime (0..11) ale unui acord, calculate din prima poziție. */
export function chordPitchClasses(ch: Chord): number[] {
  const set = new Set<number>()
  ch.shapes[0].frets.forEach((f, i) => f !== null && set.add(midiAt(i, f) % 12))
  return [...set]
}

/** Barré-urile detectate într-o poziție: același deget, aceeași tastă, mai multe corzi. */
export function findBarres(s: ChordShape): { finger: number; fret: number; from: number; to: number }[] {
  const out: { finger: number; fret: number; from: number; to: number }[] = []
  for (let finger = 1; finger <= 4; finger++) {
    const idx = s.fingers.map((f, i) => (f === finger ? i : -1)).filter((i) => i >= 0)
    if (idx.length < 2) continue
    const frets = new Set(idx.map((i) => s.frets[i]))
    if (frets.size === 1) out.push({ finger, fret: s.frets[idx[0]] as number, from: Math.min(...idx), to: Math.max(...idx) })
  }
  return out
}

/** Prima poziție a unui acord, după nume (aruncă eroare dacă nu există – ajută la scrierea lecțiilor). */
export function chordFrets(name: string): Frets {
  const ch = getChord(name)
  if (!ch) throw new Error(`Acord necunoscut: ${name}`)
  return ch.shapes[0].frets
}
