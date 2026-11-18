import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CHORDS, QUALITY_GROUPS, chordFullName, getChord } from '../music/chords'
import { ChordDiagram, FingerLegend } from '../components/ChordDiagram'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import { ViewToggle } from '../components/ChordViews'
import { Guitar3D } from '../components/three/Guitar3D'
import { useSettings } from '../store/settings'
import { strum } from '../audio/guitar'

/** Biblioteca de acorduri: căutare după nume (C, Am, „la minor”...) și filtrare pe tipuri. */
export function ChordsPage() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<string>('all')
  const { settings } = useSettings()
  const is3d = settings.chordView === '3d'
  // acordul afișat pe chitara 3D (în modul 3D, atingerea unei miniaturi îl alege)
  const [selected, setSelected] = useState('C')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const g = QUALITY_GROUPS.find((x) => x.id === group)
    return CHORDS.filter((ch) => {
      if (g && !g.qualities.includes(ch.quality)) return false
      if (!q) return true
      return ch.name.toLowerCase().startsWith(q) || chordFullName(ch).toLowerCase().includes(q)
    })
  }, [query, group])

  return (
    <div>
      <PageHeader title="Acorduri" subtitle={`${CHORDS.length} acorduri, cu variante de poziție`} right={<ViewToggle />} />

      {is3d && (
        <div className="card mb-4 !p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-display text-2xl">{selected}</span>
            <button className="btn-ghost !min-h-10 !px-3" onClick={() => strum(getChord(selected)!.shapes[0].frets)} aria-label={`Ascultă ${selected}`}>
              <Icon name="play" size={16} />
            </button>
            <Link to={`/acorduri/${encodeURIComponent(selected)}`} className="btn-ghost ml-auto !min-h-10 !px-3 text-sm">
              Detalii <Icon name="next" size={16} />
            </Link>
          </div>
          <Guitar3D chord={selected} height={280} />
          <p className="mt-2 text-center text-xs text-muted">Atinge un acord din listă ca să-l vezi pe chitara 3D.</p>
        </div>
      )}

      <label className="relative mb-3 block">
        <span className="sr-only">Caută un acord</span>
        <Icon name="search" className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută: Am, G7, „re minor”..."
          className="min-h-13 w-full rounded-2xl border-2 border-line bg-surface py-3 pr-4 pl-12 text-lg outline-none focus:border-primary"
        />
      </label>

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Tipuri de acorduri">
        {[{ id: 'all', label: 'Toate' }, ...QUALITY_GROUPS].map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={group === g.id}
            onClick={() => setGroup(g.id)}
            className={`shrink-0 rounded-full border-2 px-4 py-2 font-bold transition ${
              group === g.id ? 'border-primary bg-primary text-primary-ink' : 'border-line bg-surface text-muted'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <FingerLegend />

      {list.length === 0 ? (
        <p className="card mt-4 text-center text-muted">Niciun acord găsit pentru „{query}”.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((ch) => (
            <Link
              key={ch.name}
              to={`/acorduri/${encodeURIComponent(ch.name)}`}
              onClick={(e) => {
                if (!is3d) return
                // în modul 3D, miniatura alege acordul de pe chitara 3D (fără să părăsim pagina)
                e.preventDefault()
                setSelected(ch.name)
                strum(ch.shapes[0].frets)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={`card !p-3 transition hover:border-primary active:scale-[0.98] ${is3d && selected === ch.name ? 'border-primary ring-2 ring-primary/30' : ''}`}
            >
              <ChordDiagram chord={ch} still />
              {ch.shapes.length > 1 && <div className="mt-1 text-center text-xs font-bold text-wood">{ch.shapes.length} variante</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
