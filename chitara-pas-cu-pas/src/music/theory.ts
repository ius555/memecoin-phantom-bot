/**
 * Teorie muzicală de bază: note, frecvențe, acordaj.
 *
 * Convenție în toată aplicația: corzile sunt indexate 0..5 de la coarda 6 (Mi grav, cea mai groasă)
 * la coarda 1 (Mi acut, cea mai subțire). Deci index 0 = coarda 6.
 */

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
/** Numele în solfegiu, folosite în România */
export const SOLFEGE: Record<string, string> = {
  C: 'Do',
  'C#': 'Do#',
  D: 'Re',
  'D#': 'Re#',
  E: 'Mi',
  F: 'Fa',
  'F#': 'Fa#',
  G: 'Sol',
  'G#': 'Sol#',
  A: 'La',
  'A#': 'La#',
  B: 'Si',
}

/** Acordajul standard în MIDI, de la coarda 6 la coarda 1: E2 A2 D3 G3 B3 E4 */
export const STANDARD_TUNING = [40, 45, 50, 55, 59, 64]

export interface StringInfo {
  number: number // numărul corzii (6..1)
  letter: string
  solfege: string
  midi: number
  name: string // ex. "E2"
}

export const STRINGS: StringInfo[] = STANDARD_TUNING.map((midi, i) => ({
  number: 6 - i,
  letter: noteLetter(midi),
  solfege: SOLFEGE[noteLetter(midi)],
  midi,
  name: noteName(midi),
}))

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440)
}

/** Litera notei fără octavă, ex. 64 → "E" */
export function noteLetter(midi: number): string {
  return NOTE_NAMES[((Math.round(midi) % 12) + 12) % 12]
}

/** Numele complet, ex. 64 → "E4" */
export function noteName(midi: number): string {
  const m = Math.round(midi)
  return `${noteLetter(m)}${Math.floor(m / 12) - 1}`
}

/** Nota MIDI de pe o coardă (index 0..5) și o tastă */
export function midiAt(stringIndex: number, fret: number): number {
  return STANDARD_TUNING[stringIndex] + fret
}

/** Diferența în cenți dintre o frecvență și nota țintă */
export function centsBetween(freq: number, targetFreq: number): number {
  return 1200 * Math.log2(freq / targetFreq)
}

/** Clasa de înălțime (0..11) a unui nume de notă, ex. "Bb" → 10 */
export function pitchClass(name: string): number {
  const flats: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' }
  const n = flats[name] ?? name
  return NOTE_NAMES.indexOf(n as (typeof NOTE_NAMES)[number])
}
