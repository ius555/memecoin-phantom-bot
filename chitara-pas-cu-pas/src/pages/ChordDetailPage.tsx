import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { chordFullName, chordPitchClasses, getChord } from '../music/chords'
import { ChordDiagram, FINGER_COLORS, FINGER_NAMES, FingerLegend } from '../components/ChordDiagram'
import { PageHeader } from '../components/PageHeader'
import { NOTE_NAMES, SOLFEGE } from '../music/theory'

/** Pagina unui acord: diagrama mare, variantele de poziție, notele și instrucțiuni pas cu pas. */
export function ChordDetailPage() {
  const { name = '' } = useParams()
  const ch = getChord(decodeURIComponent(name))
  const [shapeIndex, setShapeIndex] = useState(0)
  if (!ch) return <Navigate to="/acorduri" replace />
  const s = ch.shapes[shapeIndex]
  const pcs = chordPitchClasses(ch)

  return (
    <div>
      <PageHeader back="/acorduri" title={`Acordul ${ch.name}`} subtitle={chordFullName(ch)} />

      {ch.shapes.length > 1 && (
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="Variante de poziție">
          {ch.shapes.map((sh, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === shapeIndex}
              onClick={() => setShapeIndex(i)}
              className={`shrink-0 rounded-full border-2 px-4 py-2 text-sm font-bold ${
                i === shapeIndex ? 'border-primary bg-primary-soft text-primary' : 'border-line text-muted'
              }`}
            >
              {i + 1}. {sh.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card flex flex-col items-center gap-3 py-6">
          <ChordDiagram key={shapeIndex} chord={ch} shapeIndex={shapeIndex} playable hideName showNotes maxWidth={260} className="w-full" />
          <FingerLegend />
        </div>

        <div className="space-y-4">
          <section className="card">
            <h2 className="mb-2 font-extrabold">Cum îl pui, pas cu pas</h2>
            <ol className="space-y-2">
              {s.frets.map((f, i) => {
                const str = 6 - i
                const finger = s.fingers[i]
                return (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-sm font-bold text-muted">Coarda {str}</span>
                    {f === null ? (
                      <span className="text-bad">nu se cântă (×)</span>
                    ) : f === 0 ? (
                      <span>liberă (o)</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span
                          className="grid h-6 w-6 place-items-center rounded-full text-xs font-extrabold text-white"
                          style={{ background: FINGER_COLORS[finger] }}
                        >
                          {finger}
                        </span>
                        tasta {f}, cu {FINGER_NAMES[finger]}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>

          <section className="card">
            <h2 className="mb-2 font-extrabold">Notele acordului</h2>
            <div className="flex flex-wrap gap-2">
              {pcs.map((pc) => (
                <span key={pc} className="chip !text-ink">
                  {NOTE_NAMES[pc]} <span className="text-muted">({SOLFEGE[NOTE_NAMES[pc]]})</span>
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
