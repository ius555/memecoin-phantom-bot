/**
 * Fingerpicking: notația p-i-m-a (din spaniolă/latină, folosită în chitara clasică):
 *   p = pulgar (degetul mare)  → corzile de bas (6, 5, 4)
 *   i = indice (arătătorul)    → coarda 3
 *   m = medio (mijlociul)      → coarda 2
 *   a = anular (inelarul)      → coarda 1
 * Un model e o listă de sloturi (optimi); un slot poate avea mai multe degete deodată ("p+a").
 */
import type { ChordShape } from './chords'
import { getChord } from './chords'
import { midiAt, pitchClass } from './theory'

export type PickFinger = 'p' | 'i' | 'm' | 'a'

export interface PickPattern {
  id: string
  name: string
  slots: PickFinger[][]
  beats: 3 | 4
  description: string
}

const pp = (id: string, name: string, notation: string, beats: 3 | 4, description: string): PickPattern => ({
  id,
  name,
  beats,
  description,
  slots: notation.split(' ').map((s) => s.split('+') as PickFinger[]),
})

export const PICK_PATTERNS: PickPattern[] = [
  pp('pima', 'p-i-m-a (urcare)', 'p i m a p i m a', 4, 'Basul cu degetul mare, apoi corzile 3, 2, 1. Cel mai simplu arpegiu.'),
  pp('pimami', 'p-i-m-a-m-i (val)', 'p i m a m i m a', 4, 'Urci și cobori ca un val. Sună foarte cursiv.'),
  pp('pami', 'p-a-m-i (coborâre)', 'p a m i p a m i', 4, 'Pornești de sus, de la coarda 1, spre coarda 3.'),
  pp('pinch', 'Ciupitură (p+a)', 'p+a i m i p+a i m i', 4, 'Degetul mare și inelarul ciupesc deodată, apoi continui cu i-m-i.'),
  pp('vals-pick', 'Arpegiu de vals (3/4)', 'p i m a m i', 3, 'Șase optimi, în trei timpi. Bun pentru cântecele în ritm de vals.'),
]

export const FINGER_STRING: Record<Exclude<PickFinger, 'p'>, number> = { i: 3, m: 4, a: 5 }
export const PICK_FINGER_INFO: Record<PickFinger, { name: string; color: string }> = {
  p: { name: 'degetul mare (pulgar)', color: 'var(--fT)' },
  i: { name: 'arătătorul (indice)', color: 'var(--f1)' },
  m: { name: 'mijlociul (medio)', color: 'var(--f2)' },
  a: { name: 'inelarul (anular)', color: 'var(--f3)' },
}

/** Coarda de bas a unui acord: cea mai groasă coardă cântată care are fundamentala acordului. */
export function bassString(chordName: string, shape?: ChordShape): number {
  const ch = getChord(chordName)
  if (!ch) return 0
  const s = shape ?? ch.shapes[0]
  const root = pitchClass(ch.root)
  for (let i = 0; i < 6; i++) {
    const f = s.frets[i]
    if (f !== null && midiAt(i, f) % 12 === root) return i
  }
  return s.frets.findIndex((f) => f !== null)
}

/** Corzile (index 0..5) pe care le cântă un slot, pentru un acord dat. */
export function slotStrings(slot: PickFinger[], chordName: string): number[] {
  return slot.map((f) => (f === 'p' ? bassString(chordName) : FINGER_STRING[f]))
}

export function getPickPattern(id: string): PickPattern {
  return PICK_PATTERNS.find((x) => x.id === id) ?? PICK_PATTERNS[0]
}
