import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Guitar3D } from '../components/three/Guitar3D'
import { CHORDS, QUALITY_GROUPS, chordFullName, getChord } from '../music/chords'
import { STRUM_PATTERNS, countLabels } from '../music/strumming'
import { strum, arpeggio } from '../audio/guitar'
import { usePlayAlong } from '../hooks/usePlayAlong'
import { StrumArrow } from '../components/StrumPatternView'
import { Icon } from '../components/Icon'

/**
 * Simulatorul 3D: alegi orice acord și îl vezi/auzi pe o chitară 3D.
 * Poți lovi corzile o dată (jos / sus / coardă cu coardă) sau poți porni un ritm cu metronom:
 * pana 3D se mișcă exact pe modelul de strumming ales.
 */
export function SimulatorPage() {
  const [name, setName] = useState('C')
  const [shapeIndex, setShapeIndex] = useState(0)
  const [group, setGroup] = useState('major')
  const [replay, setReplay] = useState(0)
  const [pattern, setPattern] = useState(STRUM_PATTERNS.find((p) => p.id === 'pop')!)
  const [bpm, setBpm] = useState(72)
  const [metronome, setMetronome] = useState(true)
  const ch = getChord(name)!
  const shape = ch.shapes[Math.min(shapeIndex, ch.shapes.length - 1)]
  const g = QUALITY_GROUPS.find((x) => x.id === group)!
  const player = usePlayAlong({ items: [{ chord: name, beats: pattern.beats }], bpm, mode: { kind: 'strum', pattern }, metronome })
  const labels = countLabels(pattern.beats)
  // ritmul folosește prima poziție a acordului (ca restul aplicației); dacă alegi altă variantă, o cântăm la atingere
  const once = (dir: 'down' | 'up') => strum(shape.frets, { direction: dir })

  return (
    <div>
      <PageHeader title="Simulator 3D" subtitle="Alege un acord, rotește chitara și atinge corzile." />
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <div className="h-display text-3xl leading-none">{ch.name}</div>
          <div className="text-sm font-bold text-muted">{chordFullName(ch)}</div>
        </div>
        <button className="btn-ghost !min-h-11 !px-3" onClick={() => setReplay((r) => r + 1)} aria-label="Arată din nou degetele">
          <Icon name="repeat" size={18} /> Degetele
        </button>
      </div>

      <Guitar3D chord={ch} shapeIndex={shapeIndex} height={360} replayKey={replay} strumming={player.running} />

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button className="btn-primary !px-2" onClick={() => once('down')}>
          ↓ Jos
        </button>
        <button className="btn-primary !px-2" onClick={() => once('up')}>
          ↑ Sus
        </button>
        <button className="btn-ghost !px-2" onClick={() => arpeggio(shape.frets, 0.16)}>
          1·2·3
        </button>
      </div>

      {ch.shapes.length > 1 && (
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {ch.shapes.map((s, i) => (
            <button key={i} onClick={() => setShapeIndex(i)} className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${i === shapeIndex ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}>
              {i + 1}. {s.label}
            </button>
          ))}
        </div>
      )}

      {/* ritmul: pana 3D urmează modelul, sincron cu metronomul */}
      <section className="card mt-4">
        <h2 className="mb-2 font-extrabold">Ritm cu pana 3D</h2>
        <div className="-mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1">
          {STRUM_PATTERNS.map((p) => (
            <button key={p.id} onClick={() => setPattern(p)} className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${p.id === pattern.id ? 'border-primary bg-primary text-primary-ink' : 'border-line'}`}>
              {p.short}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-0.5" aria-hidden>
          {pattern.slots.map((s, i) => {
            const active = player.slot >= 0 && player.slot % pattern.slots.length === i
            return (
              <div key={i} className={`flex flex-col items-center rounded-lg px-0.5 ${active ? 'bg-primary-soft' : ''}`}>
                <StrumArrow dir={s === '-' ? (i % 2 ? 'U' : 'D') : s} ghost={s === '-'} active={active} />
                <span className="text-xs font-bold text-muted">{labels[i]}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <button className={`${player.running ? 'btn-accent' : 'btn-primary'} flex-1`} onClick={player.toggle}>
            <Icon name={player.running ? 'stop' : 'play'} size={18} /> {player.running ? 'Stop' : 'Pornește ritmul'}
          </button>
          <button className={`btn-ghost ${metronome ? '!border-primary text-primary' : ''}`} onClick={() => setMetronome(!metronome)} aria-pressed={metronome}>
            ⏱️ Clic
          </button>
        </div>
        <label className="mt-3 flex items-center gap-3 text-sm font-bold text-muted">
          <span className="w-16">{bpm} bpm</span>
          <input type="range" min={40} max={140} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="flex-1 accent-[var(--primary)]" />
        </label>
      </section>

      <section className="card mt-4">
        <h2 className="mb-2 font-extrabold">Alege acordul</h2>
        <div className="mb-2 flex gap-1.5 overflow-x-auto">
          {QUALITY_GROUPS.map((q) => (
            <button key={q.id} onClick={() => setGroup(q.id)} className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${group === q.id ? 'bg-primary text-primary-ink' : 'bg-surface-2'}`}>
              {q.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {CHORDS.filter((c) => g.qualities.includes(c.quality)).map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setName(c.name)
                setShapeIndex(0)
              }}
              className={`btn !min-h-11 !px-1 border-2 ${c.name === name ? 'border-primary bg-primary text-primary-ink' : 'border-line bg-surface'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
