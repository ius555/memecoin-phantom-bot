/**
 * Comutatorul „2D / 3D” și afișarea acordurilor în modul ales.
 * Preferința e globală (setări): dacă alegi 3D într-o lecție, rămâne 3D și în bibliotecă.
 * În modul 3D se folosește un singur model (mai ieftin decât câte unul pe acord):
 * alegi acordul din butoanele de deasupra.
 */
import { useState } from 'react'
import { useSettings } from '../store/settings'
import { ChordDiagram } from './ChordDiagram'
import { Guitar3D } from './three/Guitar3D'
import { getChord } from '../music/chords'
import { strum } from '../audio/guitar'
import { Icon } from './Icon'

export function ViewToggle({ className = '' }: { className?: string }) {
  const { settings, update } = useSettings()
  return (
    <div className={`inline-flex rounded-xl border-2 border-line bg-surface p-0.5 ${className}`} role="radiogroup" aria-label="Mod de afișare a acordurilor">
      {(['2d', '3d'] as const).map((v) => (
        <button
          key={v}
          role="radio"
          aria-checked={settings.chordView === v}
          onClick={() => update({ chordView: v })}
          className={`min-h-9 rounded-lg px-3 text-sm font-extrabold transition ${settings.chordView === v ? 'bg-primary text-primary-ink' : 'text-muted'}`}
        >
          {v.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/** Blocul „acorduri” din lecții: grilă de diagrame 2D sau chitara 3D cu butoane pentru fiecare acord. */
export function ChordBlock({ chords, caption }: { chords: string[]; caption?: string }) {
  const { settings } = useSettings()
  const [selected, setSelected] = useState(chords[0])
  const is3d = settings.chordView === '3d'

  return (
    <figure>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-extrabold tracking-wider text-wood uppercase">{chords.length > 1 ? 'Acordurile' : 'Acordul'}</span>
        <ViewToggle />
      </div>
      {is3d ? (
        <div className="card !p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {chords.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setSelected(c)
                  const ch = getChord(c)
                  if (ch) strum(ch.shapes[0].frets)
                }}
                className={`min-h-11 min-w-12 rounded-xl border-2 px-3 text-lg font-extrabold ${c === selected ? 'border-primary bg-primary text-primary-ink' : 'border-line'}`}
              >
                {c}
              </button>
            ))}
            <button className="btn-ghost ml-auto !min-h-11 !px-3" onClick={() => strum(getChord(selected)!.shapes[0].frets)} aria-label={`Ascultă ${selected}`}>
              <Icon name="play" size={18} />
            </button>
          </div>
          <Guitar3D chord={selected} height={300} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {chords.map((c) => (
            <div key={c} className="card !p-2">
              <ChordDiagram chord={c} playable />
            </div>
          ))}
        </div>
      )}
      {caption && <figcaption className="mt-2 text-center text-sm text-muted">{caption}</figcaption>}
    </figure>
  )
}
