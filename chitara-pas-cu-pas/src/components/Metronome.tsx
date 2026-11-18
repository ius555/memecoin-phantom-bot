/**
 * Metronom: tempo (40–208 bpm), măsura (2/4, 3/4, 4/4, 6/8), subdiviziuni („și”),
 * tap tempo și numărătoarea afișată mare: „1 și 2 și 3 și 4 și”.
 */
import { useRef, useState } from 'react'
import { click } from '../audio/clicks'
import { useClock } from '../hooks/useClock'
import { Icon } from './Icon'

const METERS = [
  { id: '2/4', beats: 2 },
  { id: '3/4', beats: 3 },
  { id: '4/4', beats: 4 },
  { id: '6/8', beats: 6 },
]

/** Denumiri prietenoase pentru tempo */
function tempoName(bpm: number) {
  if (bpm < 66) return 'foarte rar'
  if (bpm < 80) return 'rar'
  if (bpm < 108) return 'moderat'
  if (bpm < 132) return 'vioi'
  return 'repede'
}

export function Metronome({
  initialBpm = 70,
  showSubdivision = false,
  compact = false,
}: {
  initialBpm?: number
  /** pornește cu numărătoarea „și” activată */
  showSubdivision?: boolean
  compact?: boolean
}) {
  const [bpm, setBpm] = useState(initialBpm)
  const [meter, setMeter] = useState(METERS[2])
  const [subdiv, setSubdiv] = useState(showSubdivision)
  const taps = useRef<number[]>([])

  // un pas = o optime dacă numărăm „și”, altfel un timp
  const steps = subdiv && meter.id !== '6/8' ? 2 : 1
  const perBar = meter.beats * steps
  const clock = useClock({
    stepSeconds: () => (meter.id === '6/8' ? 30 / bpm : 60 / bpm / steps),
    onSchedule: (s, time) => {
      const pos = s % perBar
      if (meter.id === '6/8') click(time, pos === 0 ? 'accent' : pos === 3 ? 'beat' : 'sub')
      else click(time, pos === 0 ? 'accent' : pos % steps === 0 ? 'beat' : 'sub')
    },
  })
  const pos = clock.step >= 0 ? clock.step % perBar : -1

  function change(delta: number) {
    setBpm((b) => Math.max(40, Math.min(208, b + delta)))
  }

  function tap() {
    const now = performance.now()
    taps.current = [...taps.current.filter((t) => now - t < 2500), now].slice(-5)
    if (taps.current.length >= 2) {
      const gaps = taps.current.slice(1).map((t, i) => t - taps.current[i])
      const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length
      setBpm(Math.max(40, Math.min(208, Math.round(60000 / avg))))
    }
  }

  // etichetele pentru numărătoare
  const labels = Array.from({ length: perBar }, (_, i) => {
    if (meter.id === '6/8') return String(i + 1)
    return i % steps === 0 ? String(i / steps + 1) : 'și'
  })

  return (
    <div className="card">
      {/* numărătoarea */}
      <div className="mb-4 flex flex-wrap justify-center gap-1.5" aria-live="off">
        {labels.map((l, i) => {
          const isBeat = l !== 'și'
          const active = i === pos
          return (
            <span
              key={`${i}-${active ? clock.step : 'x'}`}
              className={`grid place-items-center rounded-2xl font-extrabold transition-colors ${active ? 'beat-pulse' : ''} ${
                isBeat ? 'h-14 w-14 text-2xl' : 'h-14 w-11 text-base'
              } ${active ? (i === 0 ? 'bg-wood text-white' : 'bg-primary text-primary-ink') : 'bg-surface-2 text-muted'}`}
            >
              {l}
            </span>
          )
        })}
      </div>

      {/* tempo */}
      <div className="flex items-center justify-center gap-3">
        <button className="btn-ghost !h-14 !w-14 !p-0 text-2xl" onClick={() => change(-5)} aria-label="Mai rar cu 5">
          −
        </button>
        <div className="w-32 text-center">
          <div className="text-5xl leading-none font-extrabold tabular-nums">{bpm}</div>
          <div className="text-sm font-bold text-muted">bpm · {tempoName(bpm)}</div>
        </div>
        <button className="btn-ghost !h-14 !w-14 !p-0 text-2xl" onClick={() => change(5)} aria-label="Mai repede cu 5">
          +
        </button>
      </div>
      <input
        type="range"
        min={40}
        max={208}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--primary)]"
        aria-label="Tempo"
      />

      <div className="mt-3 flex gap-2">
        <button className={`${clock.running ? 'btn-wood' : 'btn-primary'} flex-1`} onClick={clock.toggle}>
          <Icon name={clock.running ? 'stop' : 'play'} size={18} /> {clock.running ? 'Stop' : 'Start'}
        </button>
        <button className="btn-ghost" onClick={tap}>
          Tap
        </button>
      </div>

      {!compact && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {METERS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMeter(m)}
                className={`btn !min-h-11 !px-0 border-2 ${meter.id === m.id ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}
                aria-pressed={meter.id === m.id}
              >
                {m.id}
              </button>
            ))}
          </div>
          {meter.id !== '6/8' && (
            <label className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3 font-bold">
              Numără și „și” (optimi)
              <input type="checkbox" className="h-6 w-6 accent-[var(--primary)]" checked={subdiv} onChange={(e) => setSubdiv(e.target.checked)} />
            </label>
          )}
        </div>
      )}
    </div>
  )
}
