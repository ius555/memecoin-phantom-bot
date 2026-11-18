/**
 * Model de strumming afișat cu săgeți, sincronizate cu metronomul și cu sunetul:
 * ↓ = în jos, ↑ = în sus, săgeată ștearsă = mâna trece fără să lovească.
 */
import { useState } from 'react'
import { STRUM_PATTERNS, countLabels, type StrumSlot } from '../music/strumming'
import { usePlayAlong } from '../hooks/usePlayAlong'
import { Icon } from './Icon'

export function StrumArrow({ dir, active, ghost }: { dir: StrumSlot; active?: boolean; ghost?: boolean }) {
  const up = dir === 'U'
  const color = active ? (up ? 'var(--wood)' : 'var(--primary)') : 'var(--muted)'
  return (
    <svg viewBox="0 0 40 64" className={`h-14 w-9 transition-transform ${active ? 'scale-110' : ''}`} aria-hidden style={{ opacity: ghost ? 0.25 : 1 }}>
      <g transform={up ? 'rotate(180 20 32)' : undefined}>
        <rect x={15} y={4} width={10} height={36} rx={5} fill={color} />
        <path d="M4 36 L20 60 L36 36 Z" fill={color} strokeLinejoin="round" stroke={color} strokeWidth={4} />
      </g>
    </svg>
  )
}

const CHORD_CHOICES = ['Em', 'Am', 'G', 'C', 'D', 'E', 'A', 'Dm']

export function StrumPatternView({
  patternIds,
  initial,
  chord: initialChord = 'Em',
  bpm: initialBpm = 70,
}: {
  patternIds?: string[]
  /** modelul selectat la început */
  initial?: string
  chord?: string
  bpm?: number
}) {
  const patterns = patternIds ? STRUM_PATTERNS.filter((p) => patternIds.includes(p.id)) : STRUM_PATTERNS
  const [pattern, setPattern] = useState(patterns.find((p) => p.id === initial) ?? patterns[0])
  const [chord, setChord] = useState(initialChord)
  const [bpm, setBpm] = useState(initialBpm)
  const [metronome, setMetronome] = useState(true)
  const player = usePlayAlong({
    items: [{ chord, beats: pattern.beats }],
    bpm,
    mode: { kind: 'strum', pattern },
    metronome,
  })
  const labels = countLabels(pattern.beats)

  return (
    <div className="card">
      {patterns.length > 1 && (
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {patterns.map((p) => (
            <button
              key={p.id}
              onClick={() => setPattern(p)}
              className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${p.id === pattern.id ? 'border-primary bg-primary text-primary-ink' : 'border-line'}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="text-center">
        <div className="font-mono text-2xl font-extrabold tracking-[0.3em]">{pattern.short}</div>
        <p className="mt-1 text-sm text-muted">{pattern.description}</p>
      </div>

      {/* săgețile */}
      <div className="my-4 flex justify-center gap-0.5 sm:gap-2" role="img" aria-label={`Model: ${pattern.short}`}>
        {pattern.slots.map((s, i) => {
          const active = player.slot >= 0 && player.slot % pattern.slots.length === i
          // pe sloturile "-", desenăm direcția în care se mișcă mâna (jos pe timp, sus pe „și”)
          const dir: StrumSlot = s === '-' ? (i % 2 === 0 ? 'D' : 'U') : s
          return (
            <div key={i} className={`flex flex-col items-center rounded-xl px-0.5 py-1 ${active ? 'bg-primary-soft' : ''}`}>
              <StrumArrow dir={dir} active={active} ghost={s === '-'} />
              <span className={`text-sm font-extrabold ${labels[i] === 'și' ? 'text-muted' : ''} ${active ? 'text-primary' : ''}`}>{labels[i]}</span>
            </div>
          )
        })}
      </div>

      <div className="mb-3 flex flex-wrap justify-center gap-1.5">
        {CHORD_CHOICES.map((c) => (
          <button
            key={c}
            onClick={() => setChord(c)}
            className={`min-h-10 min-w-11 rounded-lg border-2 px-2 font-bold ${c === chord ? 'border-wood bg-wood-soft' : 'border-line'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className={`${player.running ? 'btn-wood' : 'btn-primary'} flex-1`} onClick={player.toggle}>
          <Icon name={player.running ? 'stop' : 'play'} size={18} /> {player.running ? 'Stop' : 'Ascultă și cântă'}
        </button>
        <button className={`btn-ghost ${metronome ? '!border-primary text-primary' : ''}`} onClick={() => setMetronome(!metronome)} aria-pressed={metronome}>
          ⏱️ Clic
        </button>
      </div>
      <label className="mt-3 flex items-center gap-3 text-sm font-bold text-muted">
        <span className="w-16">{bpm} bpm</span>
        <input type="range" min={40} max={140} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="flex-1 accent-[var(--primary)]" />
      </label>
    </div>
  )
}
