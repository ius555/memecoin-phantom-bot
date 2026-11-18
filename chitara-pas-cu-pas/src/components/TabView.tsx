/**
 * Tabulator desenat în SVG, care se poate reda cu sunet.
 * Coloana care se aude e evidențiată, iar dedesubt (opțional) un grif arată unde apeși.
 */
import { useMemo, useState } from 'react'
import { parseTab } from '../music/tab'
import { playNote } from '../audio/guitar'
import { useClock } from '../hooks/useClock'
import { Fretboard } from './Fretboard'
import { Icon } from './Icon'

const LABELS = ['e', 'B', 'G', 'D', 'A', 'E']

export function TabView({
  tab,
  title,
  bpm: initialBpm = 70,
  showFretboard = true,
}: {
  tab: string
  title?: string
  bpm?: number
  showFretboard?: boolean
}) {
  const events = useMemo(() => parseTab(tab), [tab])
  const [bpm, setBpm] = useState(initialBpm)
  const [loop, setLoop] = useState(false)
  // fiecare coloană = o optime (jumătate de timp)
  const clock = useClock({
    stepSeconds: () => 30 / bpm,
    totalSteps: loop ? undefined : events.length,
    onSchedule: (s, time) => {
      const ev = events[s % events.length]
      ev.notes.forEach((n) => playNote(n.string, n.fret, { when: time, velocity: 0.8 }))
    },
  })
  const current = clock.step >= 0 ? clock.step % events.length : -1

  const COL = 30
  const ROW = 16
  const X0 = 24
  const width = X0 + events.length * COL + 16
  const height = ROW * 5 + 24
  const markFrets = maxFret(events)

  return (
    <figure className="card">
      {title && <figcaption className="mb-2 font-extrabold">{title}</figcaption>}
      <div className="-mx-1 overflow-x-auto px-1">
        <svg viewBox={`0 0 ${width} ${height}`} style={{ minWidth: Math.max(280, width * 0.9) }} className="w-full" role="img" aria-label={`Tabulator${title ? ': ' + title : ''}`}>
          {LABELS.map((l, r) => (
            <g key={l + r}>
              <text x={6} y={12 + r * ROW + 4} fontSize={11} fontWeight={800} fill="var(--muted)" fontFamily="ui-monospace, monospace">
                {l}
              </text>
              <line x1={X0 - 4} x2={width - 6} y1={12 + r * ROW} y2={12 + r * ROW} stroke="var(--line)" strokeWidth={1.5} />
            </g>
          ))}
          <line x1={X0 - 4} x2={X0 - 4} y1={12} y2={12 + 5 * ROW} stroke="var(--muted)" strokeWidth={2} />
          <line x1={width - 6} x2={width - 6} y1={12} y2={12 + 5 * ROW} stroke="var(--muted)" strokeWidth={2} />
          {events.map((ev, i) => {
            const x = X0 + i * COL + COL / 2
            return (
              <g key={i}>
                {ev.barBefore && i > 0 && <line x1={x - COL / 2} x2={x - COL / 2} y1={12} y2={12 + 5 * ROW} stroke="var(--muted)" strokeWidth={1.2} />}
                {i === current && <rect x={x - COL / 2 + 2} y={2} width={COL - 4} height={5 * ROW + 20} rx={6} fill="var(--wood)" opacity={0.18} />}
                {ev.notes.map((n) => {
                  const y = 12 + (5 - n.string) * ROW
                  return (
                    <g key={n.string} className="cursor-pointer" onClick={() => playNote(n.string, n.fret)}>
                      <rect x={x - 9} y={y - 8} width={18} height={16} rx={4} fill={i === current ? 'var(--wood)' : 'var(--surface)'} />
                      <text x={x} y={y + 4.5} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={i === current ? '#fff' : 'var(--ink)'} fontFamily="ui-monospace, monospace">
                        {n.fret}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className="btn-primary !min-h-11" onClick={clock.toggle}>
          <Icon name={clock.running ? 'stop' : 'play'} size={18} /> {clock.running ? 'Stop' : 'Ascultă'}
        </button>
        <button className={`btn-ghost !min-h-11 ${loop ? '!border-primary text-primary' : ''}`} onClick={() => setLoop(!loop)} aria-pressed={loop}>
          <Icon name="repeat" size={18} /> Buclă
        </button>
        <label className="flex flex-1 items-center gap-2 text-sm font-bold text-muted">
          <span className="whitespace-nowrap">{bpm} bpm</span>
          <input type="range" min={40} max={140} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-full min-w-24 accent-[var(--primary)]" />
        </label>
      </div>

      {showFretboard && (
        <div className="mt-3">
          <Fretboard
            from={0}
            to={Math.max(5, markFrets + 1)}
            marks={current >= 0 ? events[current].notes.map((n) => ({ string: n.string, fret: n.fret, label: String(n.fret), color: 'var(--wood)' })) : []}
          />
        </div>
      )}
    </figure>
  )
}

function maxFret(events: ReturnType<typeof parseTab>) {
  let m = 0
  events.forEach((e) => e.notes.forEach((n) => (m = Math.max(m, n.fret))))
  return m
}
