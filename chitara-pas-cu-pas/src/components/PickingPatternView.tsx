/**
 * Model de fingerpicking: literele p-i-m-a colorate + o grilă (ca un tab) care arată
 * ce coardă ciupești la fiecare optime. Pasul curent e evidențiat în timpul redării.
 */
import { useState } from 'react'
import { PICK_FINGER_INFO, PICK_PATTERNS, slotStrings } from '../music/fingerpicking'
import { usePlayAlong } from '../hooks/usePlayAlong'
import { chordFrets } from '../music/chords'
import { ChordDiagram } from './ChordDiagram'
import { Icon } from './Icon'

const CHORD_SETS: Record<string, string[]> = {
  'Am': ['Am'],
  'C': ['C'],
  'Em': ['Em'],
  'G': ['G'],
  'Am → E': ['Am', 'E'],
  'C → Am → F → G': ['C', 'Am', 'F', 'G'],
  'G → Em → C → D': ['G', 'Em', 'C', 'D'],
}

export function PickingPatternView({ patternIds, sets }: { patternIds?: string[]; sets?: string[] }) {
  const patterns = patternIds ? PICK_PATTERNS.filter((p) => patternIds.includes(p.id)) : PICK_PATTERNS
  const setNames = sets ?? Object.keys(CHORD_SETS)
  const [pattern, setPattern] = useState(patterns[0])
  const [setName, setSetName] = useState(setNames[0])
  const [bpm, setBpm] = useState(60)
  const chords = CHORD_SETS[setName] ?? ['Am']
  const player = usePlayAlong({
    items: chords.map((c) => ({ chord: c, beats: pattern.beats })),
    bpm,
    mode: { kind: 'pick', pattern },
  })
  const chord = chords[Math.max(0, player.index)]
  const frets = chordFrets(chord)
  const active = player.slot >= 0 ? player.slot % pattern.slots.length : -1

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
      <p className="mb-3 text-center text-sm text-muted">{pattern.description}</p>

      {/* literele p-i-m-a */}
      <div className="mb-2 flex justify-center gap-1">
        {pattern.slots.map((slot, i) => (
          <div key={i} className={`flex w-9 flex-col items-center gap-0.5 rounded-lg py-1 ${i === active ? 'bg-primary-soft' : ''}`}>
            {slot.map((f) => (
              <span
                key={f}
                className={`grid h-7 w-7 place-items-center rounded-full text-sm font-extrabold text-white ${i === active ? 'beat-pulse' : ''}`}
                style={{ background: PICK_FINGER_INFO[f].color }}
              >
                {f}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* grila: corzile × pași */}
      <div className="mx-auto mb-3 w-fit">
        {[5, 4, 3, 2, 1, 0].map((si) => (
          <div key={si} className="flex items-center gap-1">
            <span className="w-4 text-xs font-bold text-muted">{['E', 'A', 'D', 'G', 'B', 'e'][si]}</span>
            {pattern.slots.map((slot, i) => {
              const strings = slotStrings(slot, chord)
              const k = strings.indexOf(si)
              const hit = k >= 0 && frets[si] !== null
              return (
                <span key={i} className="relative grid h-5 w-9 place-items-center">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
                  {hit && (
                    <span
                      className={`relative z-10 grid h-5 min-w-5 place-items-center rounded px-0.5 font-mono text-xs font-extrabold ${i === active ? 'text-white' : ''}`}
                      style={{ background: i === active ? PICK_FINGER_INFO[slot[k]].color : 'var(--surface-2)' }}
                    >
                      {frets[si]}
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-[110px_1fr] items-center gap-3">
        <ChordDiagram key={chord} chord={chord} still />
        <div>
          <select
            value={setName}
            onChange={(e) => {
              player.stop()
              setSetName(e.target.value)
            }}
            className="mb-2 min-h-12 w-full rounded-xl border-2 border-line bg-surface px-3 font-bold"
            aria-label="Acordurile pe care cânți"
          >
            {setNames.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-muted">
            {(['p', 'i', 'm', 'a'] as const).map((f) => (
              <span key={f} className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full" style={{ background: PICK_FINGER_INFO[f].color }} /> {f} = {PICK_FINGER_INFO[f].name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button className={`${player.running ? 'btn-accent' : 'btn-primary'} w-full`} onClick={player.toggle}>
        <Icon name={player.running ? 'stop' : 'play'} size={18} /> {player.running ? 'Stop' : 'Ascultă'}
      </button>
      <label className="mt-3 flex items-center gap-3 text-sm font-bold text-muted">
        <span className="w-16">{bpm} bpm</span>
        <input type="range" min={40} max={120} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="flex-1 accent-[var(--primary)]" />
      </label>
    </div>
  )
}
