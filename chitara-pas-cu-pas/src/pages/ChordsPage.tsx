import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CHORDS, QUALITY_GROUPS, chordFullName } from '../music/chords'
import { ChordDiagram, FingerLegend } from '../components/ChordDiagram'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'

/** Biblioteca de acorduri: căutare după nume (C, Am, „la minor”...) și filtrare pe tipuri. */
export function ChordsPage() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<string>('all')

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
      <PageHeader title="Acorduri" subtitle={`${CHORDS.length} acorduri, cu variante de poziție`} />

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
              className="card !p-3 transition hover:border-primary active:scale-[0.98]"
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
