/**
 * Lecția 3: cele 6 corzi (cu sunet) și numerotarea degetelor (cu o mână desenată simplu, plat).
 */
import { useState } from 'react'
import { STRINGS } from '../../music/theory'
import { playNote } from '../../audio/guitar'
import { FINGER_COLORS, FINGER_NAMES } from '../ChordDiagram'
import { feedbackTone } from '../../audio/clicks'

/** Cele șase corzi: atingi una, o auzi și vezi numele ei. Include și un mini-joc de memorare. */
export function StringsWidget() {
  const [active, setActive] = useState<number | null>(null)
  const [tapCount, setTapCount] = useState(0)
  const [quiz, setQuiz] = useState<number | null>(null)
  const [score, setScore] = useState({ ok: 0, total: 0 })
  const [answer, setAnswer] = useState<string | null>(null)

  function tap(i: number) {
    setActive(i)
    setTapCount((k) => k + 1)
    playNote(i, 0)
  }

  function newQuestion() {
    const i = Math.floor(Math.random() * 6)
    setQuiz(i)
    setAnswer(null)
  }

  function guess(letter: string) {
    if (quiz === null || answer) return
    const ok = STRINGS[quiz].letter === letter
    feedbackTone(ok)
    setAnswer(letter)
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <div className="card space-y-2">
      <p className="text-sm text-muted">Atinge o coardă ca s-o auzi. Sus e cea mai groasă (coarda 6), ca atunci când ții chitara în brațe.</p>
      {STRINGS.map((s, i) => (
        <button
          key={i}
          onClick={() => tap(i)}
          className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition active:scale-[0.99] ${
            active === i ? 'border-primary bg-primary-soft' : 'border-line'
          }`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-wood text-lg font-extrabold text-white">{s.number}</span>
          <span className="w-14 shrink-0">
            <span className="block text-xl leading-none font-extrabold">{s.letter}</span>
            <span className="text-xs font-bold text-muted">{s.solfege}</span>
          </span>
          <svg viewBox="0 0 200 20" className="h-5 min-w-0 flex-1" preserveAspectRatio="none" aria-hidden>
            <line
              key={active === i ? tapCount : 0}
              className={active === i ? 'string-vibrate' : ''}
              x1={0}
              x2={200}
              y1={10}
              y2={10}
              stroke="var(--string)"
              strokeWidth={4.2 - i * 0.6}
              strokeLinecap="round"
            />
          </svg>
          <span className="w-16 shrink-0 text-right text-xs font-bold text-muted">{i < 3 ? 'groasă' : 'subțire'}</span>
        </button>
      ))}

      <div className="mt-3 rounded-2xl bg-surface-2 p-4">
        <div className="font-extrabold">Joc: ce coardă e?</div>
        {quiz === null ? (
          <button className="btn-primary mt-2" onClick={newQuestion}>
            Începe
          </button>
        ) : (
          <>
            <p className="mt-1">
              Cum se numește <strong>coarda {STRINGS[quiz].number}</strong>?
              <span className="ml-2 text-sm text-muted">
                Scor: {score.ok}/{score.total}
              </span>
            </p>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {['E', 'A', 'D', 'G', 'B'].map((l) => (
                <button
                  key={l}
                  onClick={() => guess(l)}
                  className={`btn !min-h-11 !px-0 border-2 ${
                    answer && l === STRINGS[quiz].letter ? 'border-good bg-good/15' : answer === l ? 'border-bad bg-bad/15' : 'border-line bg-surface'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            {answer && (
              <button className="btn-ghost mt-2 w-full" onClick={newQuestion}>
                Următoarea
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/** Mâna stângă, desen plat: fiecare deget are numărul și culoarea lui. */
export function FingersWidget() {
  const [sel, setSel] = useState(1)
  // degetele: [x, y-vârf, lungime, înclinare]
  const fingers: { id: number; x: number; top: number; rot: number }[] = [
    { id: 1, x: 70, top: 40, rot: -8 },
    { id: 2, x: 102, top: 22, rot: -2 },
    { id: 3, x: 134, top: 32, rot: 4 },
    { id: 4, x: 164, top: 62, rot: 10 },
  ]
  return (
    <div className="card grid items-center gap-4 sm:grid-cols-2">
      <svg viewBox="0 0 240 260" className="mx-auto w-full max-w-[260px]" role="group" aria-label="Mâna stângă cu degetele numerotate">
        {/* palma */}
        <path d="M58 120c0-12 8-20 20-20h86c14 0 20 10 20 22v58c0 40-28 66-64 66s-62-24-62-62Z" fill="#e8c4a0" />
        {/* degetul mare */}
        <g
          transform="rotate(-38 46 170)"
          onClick={() => setSel(0)}
          className="cursor-pointer"
          role="button"
          aria-label="Degetul mare (T)"
        >
          <rect x={30} y={120} width={30} height={80} rx={15} fill="#e8c4a0" stroke={sel === 0 ? 'var(--fT)' : 'none'} strokeWidth={3} />
          <circle cx={45} cy={136} r={12} fill={FINGER_COLORS[0]} />
          <text x={45} y={141} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">
            T
          </text>
        </g>
        {fingers.map((f) => (
          <g key={f.id} transform={`rotate(${f.rot} ${f.x + 14} 120)`} onClick={() => setSel(f.id)} className="cursor-pointer" role="button" aria-label={`Degetul ${f.id}: ${FINGER_NAMES[f.id]}`}>
            <rect x={f.x} y={f.top} width={28} height={120 - f.top + 10} rx={14} fill="#e8c4a0" stroke={sel === f.id ? FINGER_COLORS[f.id] : 'none'} strokeWidth={3} />
            <circle className={sel === f.id ? 'beat-pulse' : ''} cx={f.x + 14} cy={f.top + 16} r={12} fill={FINGER_COLORS[f.id]} />
            <text x={f.x + 14} y={f.top + 21} textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff">
              {f.id}
            </text>
          </g>
        ))}
      </svg>
      <div>
        <div className="rounded-2xl p-4 text-white" style={{ background: FINGER_COLORS[sel] }} aria-live="polite">
          <div className="text-4xl font-extrabold">{sel === 0 ? 'T' : sel}</div>
          <div className="text-lg font-bold">{sel === 0 ? 'degetul mare (police)' : FINGER_NAMES[sel]}</div>
          <p className="mt-1 text-sm opacity-95">
            {sel === 0
              ? 'Nu are număr în diagrame: stă în spatele gâtului și sprijină mâna. Uneori apare ca „T”.'
              : sel === 1
                ? 'Cel mai folosit deget. În barré, el apasă toate corzile deodată.'
                : sel === 4
                  ? 'Cel mai slab la început – exercițiul 1-2-3-4 îl face mai puternic.'
                  : 'În diagrame, cercul cu acest număr îți spune unde pui degetul acesta.'}
          </p>
        </div>
        <p className="mt-3 text-sm text-muted">
          Atinge un deget. În toate diagramele din aplicație, fiecare deget are mereu aceeași culoare.
        </p>
      </div>
    </div>
  )
}
