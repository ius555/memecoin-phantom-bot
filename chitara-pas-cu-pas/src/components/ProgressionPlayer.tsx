/**
 * Redă o progresie de acorduri în buclă, cu un model de strumming sau de fingerpicking.
 * Acordul curent e evidențiat, iar diagrama lui (și a următorului) e mereu la vedere.
 */
import { useState } from 'react'
import { STRUM_PATTERNS } from '../music/strumming'
import { PICK_PATTERNS } from '../music/fingerpicking'
import { PROGRESSIONS } from '../music/progressions'
import { usePlayAlong, type SeqItem } from '../hooks/usePlayAlong'
import { ChordDiagram } from './ChordDiagram'
import { Icon } from './Icon'
import { ViewToggle } from './ChordViews'
import { Guitar3D } from './three/Guitar3D'
import { useSettings } from '../store/settings'

export function ProgressionPlayer({
  items: fixedItems,
  progressionIds,
  bpm: initialBpm = 80,
  allowPicking = true,
}: {
  /** secvență fixă; dacă lipsește, utilizatorul alege dintre progresiile cunoscute */
  items?: SeqItem[]
  progressionIds?: string[]
  bpm?: number
  allowPicking?: boolean
}) {
  const progs = progressionIds ? PROGRESSIONS.filter((p) => progressionIds.includes(p.id)) : PROGRESSIONS
  const [progId, setProgId] = useState(progs[0]?.id)
  const prog = progs.find((p) => p.id === progId)
  const items: SeqItem[] = fixedItems ?? prog?.chords.map((c) => ({ chord: c, beats: prog.beats })) ?? []
  const [bpm, setBpm] = useState(initialBpm)
  const [modeKind, setModeKind] = useState<'strum' | 'pick'>('strum')
  const [strumId, setStrumId] = useState('jos-4')
  const [pickId, setPickId] = useState('pima')
  const [metronome, setMetronome] = useState(false)
  const { settings } = useSettings()
  const is3d = settings.chordView === '3d'
  const strumPattern = STRUM_PATTERNS.find((p) => p.id === strumId)!
  const pickPattern = PICK_PATTERNS.find((p) => p.id === pickId)!

  const player = usePlayAlong({
    items,
    bpm,
    mode: modeKind === 'strum' ? { kind: 'strum', pattern: strumPattern } : { kind: 'pick', pattern: pickPattern },
    metronome,
    countIn: 1,
  })
  const cur = player.index >= 0 ? player.index : 0
  const next = (cur + 1) % items.length
  const beat = player.slot >= 0 ? Math.floor(player.slot / 2) + 1 : 0

  return (
    <div className="card">
      {!fixedItems && progs.length > 1 && (
        <select
          value={progId}
          onChange={(e) => {
            player.stop()
            setProgId(e.target.value)
          }}
          className="mb-3 min-h-12 w-full rounded-xl border-2 border-line bg-surface px-3 font-bold"
          aria-label="Alege progresia"
        >
          {progs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.roman} · {p.chords.join(' – ')} ({p.key})
            </option>
          ))}
        </select>
      )}
      {prog && !fixedItems && <p className="mb-3 text-sm text-muted">{prog.description}</p>}

      {/* șirul de acorduri */}
      <div className="mb-3 flex flex-wrap gap-2">
        {items.map((it, i) => (
          <span
            key={i}
            className={`min-w-14 rounded-xl border-2 px-3 py-2 text-center text-lg font-extrabold transition ${
              player.running && i === player.index ? 'scale-105 border-primary bg-primary text-primary-ink' : 'border-line'
            }`}
          >
            {it.chord}
          </span>
        ))}
      </div>

      {/* acordul curent și următorul: diagrame 2D sau chitara 3D (degetele se mută animat la fiecare schimbare) */}
      <div className="mb-2 flex justify-end">
        <ViewToggle />
      </div>
      {is3d ? (
        <div>
          <Guitar3D chord={items[cur]?.chord ?? 'C'} height={300} />
          <div className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-muted">
            Acum <span className="rounded-lg bg-primary px-2 py-0.5 text-primary-ink">{items[cur]?.chord}</span> · urmează{' '}
            <span className="rounded-lg bg-surface-2 px-2 py-0.5 text-ink">{items[next]?.chord}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-primary-soft p-2">
            <div className="text-center text-xs font-extrabold tracking-wider text-primary uppercase">Acum</div>
            <ChordDiagram key={`c${cur}-${items[cur]?.chord}`} chord={items[cur]?.chord ?? 'C'} still={player.running} />
          </div>
          <div className="rounded-2xl bg-surface-2 p-2 opacity-80">
            <div className="text-center text-xs font-extrabold tracking-wider text-muted uppercase">Urmează</div>
            <ChordDiagram chord={items[next]?.chord ?? 'C'} still />
          </div>
        </div>
      )}

      {/* timpii măsurii */}
      <div className="my-3 flex justify-center gap-2" aria-hidden>
        {player.countInBeat > 0 ? (
          <span className="text-2xl font-extrabold text-wood">Numărătoare: {player.countInBeat}…</span>
        ) : (
          Array.from({ length: items[cur]?.beats ?? 4 }, (_, b) => (
            <span key={b} className={`h-4 w-4 rounded-full ${b + 1 === beat ? (b === 0 ? 'bg-wood' : 'bg-primary') : 'bg-surface-2'}`} />
          ))
        )}
      </div>

      {/* controale */}
      {allowPicking && (
        <div className="mb-2 grid grid-cols-2 gap-2">
          {(['strum', 'pick'] as const).map((k) => (
            <button key={k} onClick={() => setModeKind(k)} className={`btn !min-h-11 border-2 ${modeKind === k ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}>
              {k === 'strum' ? 'Strumming' : 'Fingerpicking'}
            </button>
          ))}
        </div>
      )}
      <select
        value={modeKind === 'strum' ? strumId : pickId}
        onChange={(e) => (modeKind === 'strum' ? setStrumId(e.target.value) : setPickId(e.target.value))}
        className="mb-3 min-h-12 w-full rounded-xl border-2 border-line bg-surface px-3 font-bold"
        aria-label="Modelul de ritm"
      >
        {(modeKind === 'strum' ? STRUM_PATTERNS : PICK_PATTERNS).map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {'short' in p ? ` (${p.short})` : ''}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <button className={`${player.running ? 'btn-wood' : 'btn-primary'} flex-1`} onClick={player.toggle}>
          <Icon name={player.running ? 'stop' : 'play'} size={18} /> {player.running ? 'Stop' : 'Ascultă în buclă'}
        </button>
        <button className={`btn-ghost ${metronome ? '!border-primary text-primary' : ''}`} onClick={() => setMetronome(!metronome)} aria-pressed={metronome}>
          ⏱️ Clic
        </button>
      </div>
      <label className="mt-3 flex items-center gap-3 text-sm font-bold text-muted">
        <span className="w-16">{bpm} bpm</span>
        <input type="range" min={40} max={160} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="flex-1 accent-[var(--primary)]" />
      </label>
    </div>
  )
}
