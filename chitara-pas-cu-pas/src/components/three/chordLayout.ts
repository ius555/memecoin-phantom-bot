/**
 * Transformă o poziție de acord (aceleași date ca diagramele 2D, din music/chords.ts)
 * în ținte 3D pentru degete: unde stă fiecare bulină, ce barré se afișează, ce corzi au X / O.
 * Funcție pură, fără Three.js.
 */
import { findBarres, type ChordShape } from '../../music/chords'
import { STRING_Y, fingerX, fretX as fretXLocal, stringZ } from './geometry'

export interface FingerTarget {
  finger: number
  fret: number
  /** centrul bulinei */
  x: number
  y: number
  z: number
  /** lățimea pe z (0 pentru o bulină simplă, > 0 pentru barré) */
  width: number
  barre: boolean
}

export interface ChordLayout {
  /** ținta fiecărui deget 1..4 (null = degetul nu e folosit) */
  fingers: (FingerTarget | null)[]
  /** pentru fiecare coardă: 'x' (nu se cântă), 'o' (liberă) sau null (apăsată) */
  marks: ('x' | 'o' | null)[]
}

export function layoutChord(shape: ChordShape): ChordLayout {
  const fingers: (FingerTarget | null)[] = [null, null, null, null, null]
  const barres = findBarres(shape)
  for (const b of barres) {
    const x = fingerX(b.fret)
    const z1 = stringZ(b.from, x)
    const z2 = stringZ(b.to, x)
    fingers[b.finger] = { finger: b.finger, fret: b.fret, x, y: STRING_Y + 0.42, z: (z1 + z2) / 2, width: Math.abs(z1 - z2), barre: true }
  }
  shape.frets.forEach((f, s) => {
    const finger = shape.fingers[s]
    if (f === null || f <= 0 || !finger || fingers[finger]) return
    const x = fingerX(f)
    fingers[finger] = { finger, fret: f, x, y: STRING_Y + 0.42, z: stringZ(s, x), width: 0, barre: false }
  })
  const marks = shape.frets.map((f) => (f === null ? 'x' : f === 0 ? 'o' : null))
  return { fingers, marks }
}

/**
 * Zona de grif pe care trebuie să o încadreze camera pentru un acord:
 * de la prăguș (dacă are corzi libere / X) sau de la prima tastă folosită, până la ultima, minim 4 taste.
 */
export function chordFocus(shape: ChordShape | undefined): { x: number; width: number } {
  const used = shape ? shape.frets.filter((f): f is number => f !== null && f > 0) : []
  const minF = used.length ? Math.min(...used) : 1
  const maxF = used.length ? Math.max(...used) : 3
  const hasOpen = !shape || shape.frets.some((f) => f === null || f === 0)
  const start = minF <= 3 ? 0 : minF - 1
  const x0 = fretXLocal(start) - (start === 0 || hasOpen ? 3.6 : 1.2)
  const x1 = Math.max(fretXLocal(maxF) + 1.2, fretXLocal(start + 4) + 0.6)
  return { x: (x0 + x1) / 2, width: (x1 - x0) * 1.12 }
}
