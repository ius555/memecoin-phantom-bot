/**
 * Modele de strumming. Un model e o listă de "sloturi" de câte o optime:
 *   D = lovitură în jos, U = lovitură în sus, - = mâna se mișcă, dar nu atinge corzile.
 * Mâna dreaptă se mișcă tot timpul ca un pendul: în jos pe timpi (1, 2, 3, 4), în sus pe „și”.
 */
export type StrumSlot = 'D' | 'U' | '-'

export interface StrumPattern {
  id: string
  name: string
  /** notația scurtă, ex. „D-DU-UDU” */
  short: string
  slots: StrumSlot[]
  /** timpi pe măsură */
  beats: 3 | 4
  description: string
}

const p = (id: string, name: string, short: string, beats: 3 | 4, description: string): StrumPattern => ({
  id,
  name,
  short,
  beats,
  description,
  slots: short.replace(/\s/g, '').split('') as StrumSlot[],
})

export const STRUM_PATTERNS: StrumPattern[] = [
  p('jos-4', 'Doar în jos, pe timpi', 'D-D-D-D-', 4, 'O lovitură în jos pe fiecare timp: 1, 2, 3, 4. Primul ritm pe care îl înveți.'),
  p('jos-8', 'În jos, de două ori pe timp', 'DDDDDDDD', 4, 'Opt lovituri în jos pe măsură – „1 și 2 și 3 și 4 și”. Mâna trebuie să fie relaxată.'),
  p('jos-sus', 'Jos-sus continuu', 'DUDUDUDU', 4, 'Jos pe timp, sus pe „și”. Mișcarea de pendul pe care se bazează aproape toate ritmurile.'),
  p('pop', 'Ritmul „pop”', 'D-DU-UDU', 4, 'Cel mai folosit ritm din muzica pop și folk. Pe „3” mâna coboară fără să atingă corzile.'),
  p('folk', 'Folk', 'D-DUDUDU', 4, 'Un ritm plin, energic: o lovitură lungă, apoi jos-sus continuu.'),
  p('balada', 'Baladă', 'D-D-DUDU', 4, 'Rar la început, apoi mai „umplut” spre final. Bun pentru cântece liniștite.'),
  p('rock', 'Rock simplu', 'D-DUD-DU', 4, 'Accente puternice pe 1 și 3. Lovește mai tare în jos.'),
  p('vals', 'Vals (3/4)', 'D-DUDU', 3, 'Pentru cântece în trei timpi: „1 – 2 și 3 și”. Accent pe 1.'),
]

export function getPattern(id: string): StrumPattern {
  return STRUM_PATTERNS.find((x) => x.id === id) ?? STRUM_PATTERNS[0]
}

/** Etichetele de numărătoare pentru fiecare slot: 1, și, 2, și... */
export function countLabels(beats: number): string[] {
  return Array.from({ length: beats * 2 }, (_, i) => (i % 2 === 0 ? String(i / 2 + 1) : 'și'))
}
