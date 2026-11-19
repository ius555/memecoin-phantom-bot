/**
 * Widget-urile pentru Nivelul 5: exerciții pregătitoare de barré, acorduri barré mobile
 * (forma E și forma A) și gama pentatonică pe grif.
 */
import { useState } from 'react'
import { Fretboard, type FretMark } from '../Fretboard'
import { ChordDiagram } from '../ChordDiagram'
import type { Chord } from '../../music/chords'
import { NOTE_NAMES, SOLFEGE, midiAt } from '../../music/theory'
import { playNote, strum } from '../../audio/guitar'
import { useClock } from '../../hooks/useClock'
import { Icon } from '../Icon'

/* ------------------------------------------------------------------ barré: exerciții pregătitoare */

/** Pune arătătorul peste toate corzile la o tastă aleasă și verifică fiecare coardă pe rând. */
export function BarreDrill() {
  const [fret, setFret] = useState(5)
  const [strings, setStrings] = useState<'toate' | 'doua'>('doua')
  const set = strings === 'toate' ? [0, 1, 2, 3, 4, 5] : [4, 5]
  const clock = useClock({
    stepSeconds: () => 0.6,
    totalSteps: set.length,
    onSchedule: (s, time) => playNote(set[s], fret, { when: time }),
  })
  const marks: FretMark[] = set.map((s) => ({ string: s, fret, finger: 1 }))
  const current = clock.step >= 0 ? set[clock.step] : -1

  return (
    <div className="card space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setStrings('doua')} className={`btn !min-h-11 border-2 text-sm ${strings === 'doua' ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}>
          Pasul 1: mini-barré (2 corzi)
        </button>
        <button onClick={() => setStrings('toate')} className={`btn !min-h-11 border-2 text-sm ${strings === 'toate' ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}>
          Pasul 2: barré complet
        </button>
      </div>
      <Fretboard from={Math.max(1, fret - 2)} to={fret + 2} marks={marks.map((m) => (m.string === current ? { ...m, color: 'var(--accent)' } : m))} />
      <label className="flex items-center gap-3 font-bold">
        <span className="w-24 text-sm">Tasta {fret}</span>
        <input type="range" min={1} max={9} value={fret} onChange={(e) => setFret(Number(e.target.value))} className="flex-1 accent-[var(--primary)]" />
      </label>
      <p className="text-sm text-muted">
        Începe la tasta 5 (aici corzile sunt mai moi), apoi coboară spre tasta 1. Ascultă cum trebuie să sune fiecare coardă și compară cu
        ce cânți tu: dacă una e înfundată, rotește ușor arătătorul spre partea lui osoasă.
      </p>
      <button className="btn-primary w-full" onClick={clock.toggle}>
        <Icon name={clock.running ? 'stop' : 'play'} size={18} /> Ascultă corzile pe rând
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ barré mobile */

type ShapeKind = 'E' | 'Em' | 'A' | 'Am'
const SHAPES: Record<ShapeKind, { rel: (number | null)[]; fingers: number[]; rootString: number; minor: boolean; label: string }> = {
  E: { rel: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1], rootString: 0, minor: false, label: 'Forma E (majoră)' },
  Em: { rel: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1], rootString: 0, minor: true, label: 'Forma Em (minoră)' },
  A: { rel: [null, 0, 2, 2, 2, 0], fingers: [0, 1, 3, 3, 3, 1], rootString: 1, minor: false, label: 'Forma A (majoră)' },
  Am: { rel: [null, 0, 2, 2, 1, 0], fingers: [0, 1, 3, 4, 2, 1], rootString: 1, minor: true, label: 'Forma Am (minoră)' },
}

/** Construiește un acord barré pornind de la formă și de la tasta unde stă barré-ul. */
export function buildBarre(kind: ShapeKind, fret: number): Chord {
  const s = SHAPES[kind]
  const root = NOTE_NAMES[midiAt(s.rootString, fret) % 12]
  return {
    name: `${root}${s.minor ? 'm' : ''}`,
    root,
    quality: s.minor ? 'm' : '',
    shapes: [{ frets: s.rel.map((r) => (r === null ? null : r + fret)), fingers: s.fingers, label: `${s.label}, tasta ${fret}` }],
  }
}

export function BarreShapes() {
  const [kind, setKind] = useState<ShapeKind>('E')
  const [fret, setFret] = useState(3)
  const ch = buildBarre(kind, fret)
  const s = SHAPES[kind]
  // notele de pe coarda fundamentală, ca hartă
  const rootMarks: FretMark[] = Array.from({ length: 12 }, (_, f) => ({
    string: s.rootString,
    fret: f + 1,
    label: NOTE_NAMES[midiAt(s.rootString, f + 1) % 12].replace('#', '♯'),
    color: f + 1 === fret ? 'var(--accent)' : 'var(--fret)',
  }))

  return (
    <div className="card space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(SHAPES) as ShapeKind[]).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={`btn !min-h-11 border-2 text-sm ${k === kind ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}>
            {SHAPES[k].label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[130px_1fr] items-center gap-3">
        <ChordDiagram key={`${kind}${fret}`} chord={ch} playable />
        <div>
          <div className="text-sm font-bold text-muted">Barré la tasta</div>
          <div className="text-4xl font-extrabold">{fret}</div>
          <div className="mt-1 text-sm">
            Fundamentala e pe <strong>coarda {6 - s.rootString}</strong>: nota {ch.root} ({SOLFEGE[ch.root]}).
          </div>
          <input type="range" min={1} max={12} value={fret} onChange={(e) => setFret(Number(e.target.value))} className="mt-2 w-full accent-[var(--primary)]" aria-label="Tasta barré-ului" />
          <button className="btn-ghost mt-2 w-full" onClick={() => strum(ch.shapes[0].frets)}>
            <Icon name="play" size={16} /> {ch.name}
          </button>
        </div>
      </div>
      <div>
        <p className="mb-1 text-sm font-bold">
          Notele de pe coarda {6 - s.rootString} – mută forma la nota dorită:
        </p>
        <Fretboard from={1} to={12} focusStrings={[s.rootString]} marks={rootMarks} interactive={false} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ pentatonica */

// pentatonica minoră, „cutia 1”: tastele relative la fundamentală (pe coarda 6), pentru fiecare coardă
const BOX: [number, number][] = [
  [0, 3],
  [0, 2],
  [0, 2],
  [0, 2],
  [0, 3],
  [0, 3],
]
const KEYS = [
  { name: 'Am', fret: 5 },
  { name: 'Em', fret: 12 },
  { name: 'Gm', fret: 3 },
  { name: 'Dm', fret: 10 },
  { name: 'F♯m', fret: 2 },
]

export function Pentatonic() {
  const [key, setKey] = useState(KEYS[0])
  const base = key.fret
  // notele, în ordine, de jos în sus
  const notes = BOX.flatMap(([a, b], s) => [
    { string: s, fret: base + a },
    { string: s, fret: base + b },
  ])
  const sequence = [...notes, ...notes.slice(0, -1).reverse()]
  const clock = useClock({
    stepSeconds: () => 0.32,
    totalSteps: sequence.length,
    onSchedule: (i, time) => playNote(sequence[i].string, sequence[i].fret, { when: time, velocity: 0.75 }),
  })
  const cur = clock.step >= 0 ? sequence[clock.step] : null
  const rootPc = midiAt(0, base) % 12
  const marks: FretMark[] = notes.map((n) => {
    const isRoot = midiAt(n.string, n.fret) % 12 === rootPc
    const rel = n.fret - base
    const finger = rel === 0 ? 1 : rel === 2 ? 3 : 4
    const playing = cur && cur.string === n.string && cur.fret === n.fret
    return {
      ...n,
      finger,
      label: isRoot ? 'R' : String(finger),
      color: playing ? 'var(--accent)' : isRoot ? 'var(--ink)' : undefined,
    }
  })

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap gap-2">
        {KEYS.map((k) => (
          <button key={k.name} onClick={() => setKey(k)} className={`min-h-11 rounded-full border-2 px-4 font-bold ${k.name === key.name ? 'border-primary bg-primary text-primary-ink' : 'border-line'}`}>
            {k.name} pentatonic
          </button>
        ))}
      </div>
      <Fretboard from={Math.max(1, base - 1)} to={Math.min(15, base + 4)} marks={marks} />
      <p className="text-sm text-muted">
        <strong>R</strong> = fundamentala ({key.name.replace('m', '')}). Cifrele = degetul cu care apeși: 1 pe tasta {base}, 3 cu două taste mai sus, 4 cu trei taste mai sus.
        Atinge orice notă de pe grif ca s-o auzi.
      </p>
      <button className="btn-primary w-full" onClick={clock.toggle}>
        <Icon name={clock.running ? 'stop' : 'play'} size={18} /> {clock.running ? 'Stop' : 'Ascultă gama în sus și în jos'}
      </button>
    </div>
  )
}
