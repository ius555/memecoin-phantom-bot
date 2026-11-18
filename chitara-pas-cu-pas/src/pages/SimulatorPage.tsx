import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Guitar3D } from '../components/three/Guitar3D'
import { CHORDS, QUALITY_GROUPS, chordFullName, getChord } from '../music/chords'
import { strum } from '../audio/guitar'
import { Icon } from '../components/Icon'

/** Simulatorul 3D: alegi orice acord și îl vezi/auzi pe o chitară 3D. */
export function SimulatorPage() {
  const [name, setName] = useState('C')
  const [shapeIndex, setShapeIndex] = useState(0)
  const [group, setGroup] = useState('major')
  const [replay, setReplay] = useState(0)
  const ch = getChord(name)!
  const shape = ch.shapes[Math.min(shapeIndex, ch.shapes.length - 1)]
  const g = QUALITY_GROUPS.find((x) => x.id === group)!

  return (
    <div>
      <PageHeader title="Simulator 3D" subtitle="Alege un acord, rotește chitara și atinge corzile." />
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <div className="h-display text-3xl leading-none">{ch.name}</div>
          <div className="text-sm font-bold text-muted">{chordFullName(ch)}</div>
        </div>
        <div className="flex gap-1.5">
          <button className="btn-primary !min-h-11" onClick={() => strum(shape.frets)}>
            <Icon name="play" size={18} /> Ascultă
          </button>
          <button className="btn-ghost !min-h-11 !px-3" onClick={() => setReplay((r) => r + 1)} aria-label="Arată din nou degetele">
            <Icon name="repeat" size={18} />
          </button>
        </div>
      </div>
      <Guitar3D chord={ch} shapeIndex={shapeIndex} height={360} replayKey={replay} />

      {ch.shapes.length > 1 && (
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {ch.shapes.map((s, i) => (
            <button key={i} onClick={() => setShapeIndex(i)} className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${i === shapeIndex ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}>
              {i + 1}. {s.label}
            </button>
          ))}
        </div>
      )}

      <section className="card mt-4">
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
