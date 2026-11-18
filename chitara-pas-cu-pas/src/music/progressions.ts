/**
 * Progresii de acorduri cunoscute, în tonalități comode pentru începători.
 * Cifrele romane arată "treapta" acordului în tonalitate: I = acordul de bază,
 * V = al cincilea, vi = al șaselea (minor), IV = al patrulea.
 */
export interface Progression {
  id: string
  name: string
  roman: string
  key: string
  chords: string[]
  /** câți timpi ține fiecare acord */
  beats: number
  description: string
}

export const PROGRESSIONS: Progression[] = [
  { id: 'em-am', name: 'Primele două acorduri', roman: 'i – iv', key: 'Mi minor', chords: ['Em', 'Am'], beats: 4, description: 'Doar Em și Am. Perfectă pentru primele schimbări.' },
  { id: 'a-d-e', name: 'Blues de bază', roman: 'I – IV – V', key: 'La major', chords: ['A', 'D', 'A', 'E'], beats: 4, description: 'Cele trei acorduri principale ale tonalității La major.' },
  { id: 'i-v-vi-iv-g', name: 'Progresia „pop” (Sol)', roman: 'I – V – vi – IV', key: 'Sol major', chords: ['G', 'D', 'Em', 'C'], beats: 4, description: 'Probabil cea mai folosită progresie din muzica pop. Fără barré!' },
  { id: 'i-v-vi-iv-c', name: 'Progresia „pop” (Do)', roman: 'I – V – vi – IV', key: 'Do major', chords: ['C', 'G', 'Am', 'F'], beats: 4, description: 'Aceeași progresie, în Do. Are acordul F (poți folosi „F mic”).' },
  { id: 'i-v-vi-iv-d', name: 'Progresia „pop” (Re)', roman: 'I – V – vi – IV', key: 'Re major', chords: ['D', 'A', 'Bm', 'G'], beats: 4, description: 'Cu Bm – bun exercițiu după lecția de barré.' },
  { id: 'i-vi-iv-v-g', name: 'Progresia anilor ’50 (Sol)', roman: 'I – vi – IV – V', key: 'Sol major', chords: ['G', 'Em', 'C', 'D'], beats: 4, description: 'Sunetul clasic al baladelor vechi. Doar acorduri deschise.' },
  { id: 'i-vi-iv-v-c', name: 'Progresia anilor ’50 (Do)', roman: 'I – vi – IV – V', key: 'Do major', chords: ['C', 'Am', 'F', 'G'], beats: 4, description: 'Aceeași progresie, în Do.' },
  { id: 'am-f-c-g', name: 'Minoră emoționantă', roman: 'vi – IV – I – V', key: 'La minor', chords: ['Am', 'F', 'C', 'G'], beats: 4, description: 'Aceleași acorduri ca I–V–vi–IV, dar pornind de la minor – sună mai melancolic.' },
  { id: 'am-dm-e', name: 'Minoră cu dominantă', roman: 'i – iv – V', key: 'La minor', chords: ['Am', 'Dm', 'E', 'Am'], beats: 4, description: 'Sunet „de poveste”, foarte des întâlnit în muzica populară.' },
]

export function getProgression(id: string): Progression {
  return PROGRESSIONS.find((p) => p.id === id) ?? PROGRESSIONS[0]
}
