import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import { ChordDiagram } from '../components/ChordDiagram'
import { strum, arpeggio } from '../audio/guitar'
import { chordFrets } from '../music/chords'
import { feedbackTone } from '../audio/clicks'
import { useProgress } from '../store/progress'

interface EarLevel {
  id: string
  name: string
  description: string
  /** fiecare rundă: alegem un acord din `chords`; răspunsurile sunt `options(chord)` */
  chords: string[]
  /** dacă există, răspunsul e o categorie (ex. major/minor), nu numele acordului */
  category?: (c: string) => string
  categories?: string[]
}

const LEVELS: EarLevel[] = [
  {
    id: 'maj-min',
    name: 'Major sau minor?',
    description: 'Luminos (major) sau melancolic (minor)?',
    chords: ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'],
    category: (c) => (c.endsWith('m') ? 'Minor' : 'Major'),
    categories: ['Major', 'Minor'],
  },
  { id: 'em-am', name: 'Em sau Am', description: 'Primele două acorduri.', chords: ['Em', 'Am'] },
  { id: 'e-em', name: 'E sau Em', description: 'O singură notă diferă!', chords: ['E', 'Em'] },
  { id: 'trei', name: 'A, D, E', description: 'Familia La major.', chords: ['A', 'D', 'E'] },
  { id: 'patru', name: 'G, C, D, Em', description: 'Progresia pop.', chords: ['G', 'C', 'D', 'Em'] },
  { id: 'opt', name: 'Toate cele 8', description: 'Em, Am, E, A, D, C, G, Dm.', chords: ['Em', 'Am', 'E', 'A', 'D', 'C', 'G', 'Dm'] },
]

/** Test de auz: aplicația cântă un acord, tu ghicești care e. */
export function EarPage() {
  const [level, setLevel] = useState<EarLevel | null>(null)
  const [current, setCurrent] = useState<string | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ ok: 0, total: 0, streak: 0 })
  const { state, recordEar } = useProgress()

  function newRound(l = level) {
    if (!l) return
    let c = l.chords[Math.floor(Math.random() * l.chords.length)]
    // evităm să repetăm de prea multe ori același acord
    if (c === current && Math.random() < 0.6) c = l.chords[Math.floor(Math.random() * l.chords.length)]
    setCurrent(c)
    setPicked(null)
    setTimeout(() => strum(chordFrets(c)), 150)
  }

  function start(l: EarLevel) {
    setLevel(l)
    setScore({ ok: 0, total: 0, streak: 0 })
    newRound(l)
  }

  function answer(opt: string) {
    if (!level || !current || picked) return
    const right = level.category ? level.category(current) : current
    const ok = opt === right
    setPicked(opt)
    feedbackTone(ok)
    recordEar(ok)
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1, streak: ok ? s.streak + 1 : 0 }))
  }

  if (!level) {
    return (
      <div>
        <PageHeader back={true} title="Test de auz" subtitle="Ascultă acordul și ghicește care e." />
        <p className="mb-4 text-sm text-muted">
          Total: {state.ear.correct} ghicite din {state.ear.total}
          {state.ear.total > 0 && ` (${Math.round((state.ear.correct / state.ear.total) * 100)}%)`}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {LEVELS.map((l) => (
            <button key={l.id} onClick={() => start(l)} className="card text-left transition hover:border-primary active:scale-[0.99]">
              <div className="text-lg font-extrabold">{l.name}</div>
              <div className="text-sm text-muted">{l.description}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const options = level.categories ?? level.chords
  const right = current ? (level.category ? level.category(current) : current) : null

  return (
    <div>
      <PageHeader
        title={level.name}
        subtitle={level.description}
        right={
          <button className="btn-ghost !min-h-11" onClick={() => setLevel(null)}>
            Niveluri
          </button>
        }
      />
      <div className="card text-center">
        <div className="flex justify-center gap-4 text-sm font-bold text-muted">
          <span>
            Scor: {score.ok}/{score.total}
          </span>
          <span>🔥 Serie: {score.streak}</span>
        </div>
        <button
          onClick={() => current && strum(chordFrets(current))}
          className="mx-auto my-5 grid h-32 w-32 place-items-center rounded-full bg-primary text-primary-ink shadow-lg transition active:scale-95"
          aria-label="Ascultă din nou acordul"
        >
          <Icon name="speaker" size={52} />
        </button>
        <button className="btn-ghost mb-4" onClick={() => current && arpeggio(chordFrets(current), 0.18)}>
          Ascultă coardă cu coardă
        </button>

        <div className={`grid gap-2 ${options.length > 4 ? 'grid-cols-4' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {options.map((o) => (
            <button
              key={o}
              onClick={() => answer(o)}
              disabled={!!picked}
              className={`btn border-2 text-lg ${
                picked && o === right ? 'border-good bg-good/15' : picked === o ? 'border-bad bg-bad/15' : 'border-line bg-surface'
              }`}
            >
              {o}
            </button>
          ))}
        </div>

        {picked && current && (
          <div className="mt-4">
            <p className={`text-lg font-extrabold ${picked === right ? 'text-good' : 'text-bad'}`}>
              {picked === right ? 'Corect!' : `Era ${level.category ? `${right} (${current})` : current}.`}
            </p>
            <div className="mx-auto mt-2 w-36">
              <ChordDiagram chord={current} still />
            </div>
            <button className="btn-primary mt-3 w-full" onClick={() => newRound()}>
              Următorul acord <Icon name="next" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
