/**
 * Exercițiul „one-minute change”: alegi două acorduri și le schimbi cât de des poți într-un minut.
 * La final introduci câte schimbări ai reușit (sau le numeri apăsând butonul mare).
 * Rezultatele se salvează și apar într-un grafic, pe fiecare pereche.
 */
import { useEffect, useRef, useState } from 'react'
import { ChordDiagram } from './ChordDiagram'
import { useProgress } from '../store/progress'
import { click, feedbackTone } from '../audio/clicks'
import { getAudio } from '../audio/context'
import { Icon } from './Icon'

const DEFAULT_PAIRS = ['Em-Am', 'Am-E', 'A-D', 'D-E', 'C-G', 'G-D', 'C-Am', 'Am-Dm', 'G-Em', 'C-F']

type Phase = 'idle' | 'countdown' | 'running' | 'enter'

export function OneMinuteChange({ pairs = DEFAULT_PAIRS, seconds = 60 }: { pairs?: string[]; seconds?: number }) {
  const { state, recordOneMinute } = useProgress()
  const [pair, setPair] = useState(pairs[0])
  const [phase, setPhase] = useState<Phase>('idle')
  const [left, setLeft] = useState(seconds)
  const [count, setCount] = useState(0)
  const [pre, setPre] = useState(3)
  const timer = useRef<number | null>(null)
  const [a, b] = pair.split('-')

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current)
  }, [])

  function start() {
    setCount(0)
    setPre(3)
    setPhase('countdown')
    let p = 3
    const { ctx } = getAudio()
    click(ctx.currentTime, 'beat')
    timer.current = window.setInterval(() => {
      p--
      if (p > 0) {
        setPre(p)
        click(getAudio().ctx.currentTime, 'beat')
        return
      }
      clearInterval(timer.current!)
      click(getAudio().ctx.currentTime, 'accent')
      setPhase('running')
      setLeft(seconds)
      const t0 = performance.now()
      timer.current = window.setInterval(() => {
        const rem = Math.max(0, seconds - Math.floor((performance.now() - t0) / 1000))
        setLeft(rem)
        if (rem <= 0) {
          clearInterval(timer.current!)
          feedbackTone(true)
          setPhase('enter')
        }
      }, 200)
    }, 1000)
  }

  function cancel() {
    if (timer.current) clearInterval(timer.current)
    setPhase('idle')
  }

  function save() {
    recordOneMinute(pair, count)
    setPhase('idle')
  }

  const history = state.oneMinute.filter((r) => r.pair === pair).slice(-12)
  const best = Math.max(0, ...state.oneMinute.filter((r) => r.pair === pair).map((r) => r.count))

  return (
    <div className="card">
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {pairs.map((p) => (
          <button
            key={p}
            disabled={phase !== 'idle'}
            onClick={() => setPair(p)}
            className={`shrink-0 rounded-full border-2 px-3 py-1.5 font-bold ${p === pair ? 'border-primary bg-primary text-primary-ink' : 'border-line'}`}
          >
            {p.replace('-', ' ↔ ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ChordDiagram chord={a} playable={phase === 'idle'} still={phase !== 'idle'} />
        <ChordDiagram chord={b} playable={phase === 'idle'} still={phase !== 'idle'} />
      </div>

      <div className="mt-4 text-center">
        {phase === 'idle' && (
          <>
            <p className="mb-3 text-sm text-muted">
              Schimbă între <strong>{a}</strong> și <strong>{b}</strong> cât poți de repede, timp de un minut. Lovește corzile o dată pe
              fiecare acord. Fiecare acord pus corect = o schimbare.
            </p>
            <button className="btn-primary w-full" onClick={start}>
              <Icon name="timer" /> Pornește minutul
            </button>
            {best > 0 && <p className="mt-2 text-sm font-bold text-accent">Recordul tău: {best} schimbări</p>}
          </>
        )}
        {phase === 'countdown' && <div className="beat-pulse py-6 text-7xl font-extrabold text-accent" key={pre}>{pre}</div>}
        {phase === 'running' && (
          <>
            <div className={`text-7xl font-extrabold tabular-nums ${left <= 10 ? 'text-bad' : ''}`}>
              0:{String(left).padStart(2, '0')}
            </div>
            <button
              className="mt-3 h-28 w-full rounded-3xl bg-primary text-2xl font-extrabold text-primary-ink active:scale-[0.98]"
              onClick={() => setCount((c) => c + 1)}
            >
              +1 schimbare ({count})
              <span className="block text-sm font-semibold opacity-80">opțional: atinge la fiecare schimbare</span>
            </button>
            <button className="btn-ghost mt-2" onClick={cancel}>
              Anulează
            </button>
          </>
        )}
        {phase === 'enter' && (
          <>
            <p className="font-bold">Timpul a expirat! Câte schimbări ai reușit?</p>
            <div className="my-3 flex items-center justify-center gap-4">
              <button className="btn-ghost !h-14 !w-14 !p-0 text-2xl" onClick={() => setCount((c) => Math.max(0, c - 1))} aria-label="Minus unu">
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                value={count}
                onChange={(e) => setCount(Math.max(0, Math.min(200, Number(e.target.value) || 0)))}
                className="w-24 rounded-xl border-2 border-line bg-surface py-2 text-center text-4xl font-extrabold"
                aria-label="Numărul de schimbări"
              />
              <button className="btn-ghost !h-14 !w-14 !p-0 text-2xl" onClick={() => setCount((c) => c + 1)} aria-label="Plus unu">
                +
              </button>
            </div>
            <button className="btn-primary w-full" onClick={save}>
              Salvează rezultatul
            </button>
          </>
        )}
      </div>

      <div className="mt-5">
        <h4 className="mb-2 font-extrabold">Progresul tău: {pair.replace('-', ' ↔ ')}</h4>
        <ProgressChart values={history.map((r) => r.count)} labels={history.map((r) => r.date.slice(5).split('-').reverse().join('.'))} />
      </div>
    </div>
  )
}

/** Grafic simplu cu bare (SVG) pentru rezultatele în timp. */
export function ProgressChart({ values, labels, unit = 'schimbări' }: { values: number[]; labels: string[]; unit?: string }) {
  if (!values.length) return <p className="rounded-xl bg-surface-2 p-4 text-center text-sm text-muted">Niciun rezultat încă. Fă primul minut!</p>
  const max = Math.max(10, ...values)
  const W = 320
  const H = 150
  const bw = Math.min(36, (W - 30) / values.length - 6)
  const goal = 30
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" role="img" aria-label={`Grafic: ${values.join(', ')} ${unit}`}>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={28} x2={W} y1={H - t * (H - 10)} y2={H - t * (H - 10)} stroke="var(--line)" />
          <text x={22} y={H - t * (H - 10) + 4} textAnchor="end" fontSize={10} fill="var(--muted)">
            {Math.round(max * t)}
          </text>
        </g>
      ))}
      {goal <= max && (
        <g>
          <line x1={28} x2={W} y1={H - (goal / max) * (H - 10)} y2={H - (goal / max) * (H - 10)} stroke="var(--accent)" strokeDasharray="4 4" />
          <text x={W} y={H - (goal / max) * (H - 10) - 4} textAnchor="end" fontSize={10} fontWeight={700} fill="var(--accent)">
            țintă: {goal}
          </text>
        </g>
      )}
      {values.map((v, i) => {
        const x = 34 + i * ((W - 34) / values.length)
        const h = (v / max) * (H - 10)
        const last = i === values.length - 1
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={bw} height={h} rx={4} fill={last ? 'var(--primary)' : 'var(--primary-soft)'} stroke="var(--primary)" strokeWidth={last ? 0 : 1} />
            <text x={x + bw / 2} y={H - h - 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="var(--ink)">
              {v}
            </text>
            <text x={x + bw / 2} y={H + 16} textAnchor="middle" fontSize={9} fill="var(--muted)">
              {labels[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
