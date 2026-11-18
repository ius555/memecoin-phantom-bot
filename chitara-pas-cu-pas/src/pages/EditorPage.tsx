import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { ProgressionPlayer } from '../components/ProgressionPlayer'
import { Icon } from '../components/Icon'
import { CHORDS, QUALITY_GROUPS } from '../music/chords'
import { PROGRESSIONS } from '../music/progressions'
import { loadJSON, saveJSON } from '../store/storage'
import type { SeqItem } from '../hooks/usePlayAlong'

interface EditorState {
  items: SeqItem[]
  saved: { name: string; items: SeqItem[] }[]
}

const KEY = 'cpp.editor'
const DEFAULT: EditorState = {
  items: [
    { chord: 'G', beats: 4 },
    { chord: 'D', beats: 4 },
    { chord: 'Em', beats: 4 },
    { chord: 'C', beats: 4 },
  ],
  saved: [],
}

/** Editor de progresii: îți construiești secvența de acorduri, alegi tempo și ritm, o asculți în buclă. */
export function EditorPage() {
  const [st, setSt] = useState<EditorState>(() => loadJSON(KEY, DEFAULT))
  const [picker, setPicker] = useState(false)
  const [group, setGroup] = useState('major')
  const [name, setName] = useState('')
  const [playerKey, setPlayerKey] = useState(0)

  useEffect(() => saveJSON(KEY, st), [st])

  const setItems = (items: SeqItem[]) => {
    setSt((s) => ({ ...s, items }))
    setPlayerKey((k) => k + 1) // oprim redarea când se schimbă secvența
  }

  function add(chord: string) {
    setItems([...st.items, { chord, beats: 4 }])
    setPicker(false)
  }
  function cycleBeats(i: number) {
    const order = [4, 8, 2]
    setItems(st.items.map((it, j) => (j === i ? { ...it, beats: order[(order.indexOf(it.beats) + 1) % order.length] } : it)))
  }
  function remove(i: number) {
    setItems(st.items.filter((_, j) => j !== i))
  }
  function moveLeft(i: number) {
    if (i === 0) return
    const a = [...st.items]
    ;[a[i - 1], a[i]] = [a[i], a[i - 1]]
    setItems(a)
  }
  function save() {
    const n = name.trim() || `Progresia mea ${st.saved.length + 1}`
    setSt((s) => ({ ...s, saved: [...s.saved.filter((x) => x.name !== n), { name: n, items: s.items }] }))
    setName('')
  }

  const g = QUALITY_GROUPS.find((x) => x.id === group)!

  return (
    <div>
      <PageHeader back={true} title="Editor de progresii" subtitle="Construiește-ți secvența de acorduri și ascult-o în buclă." />

      <section className="card mb-4">
        <h2 className="mb-1 font-extrabold">Secvența ta</h2>
        <p className="mb-3 text-sm text-muted">Atinge cifra unui acord ca să schimbi câți timpi ține (4 → 8 → 2).</p>
        <div className="flex flex-wrap gap-2">
          {st.items.map((it, i) => (
            <div key={i} className="flex items-stretch overflow-hidden rounded-xl border-2 border-line bg-surface">
              <button className="px-1 text-muted hover:bg-surface-2 disabled:opacity-30" onClick={() => moveLeft(i)} disabled={i === 0} aria-label={`Mută ${it.chord} la stânga`}>
                <Icon name="back" size={16} />
              </button>
              <span className="grid min-w-12 place-items-center px-2 text-lg font-extrabold">{it.chord}</span>
              <button className="bg-surface-2 px-2 text-sm font-bold" onClick={() => cycleBeats(i)} aria-label={`${it.beats} timpi; schimbă`}>
                {it.beats}t
              </button>
              <button className="px-2 text-bad hover:bg-bad/10" onClick={() => remove(i)} aria-label={`Șterge ${it.chord}`}>
                <Icon name="x" size={16} />
              </button>
            </div>
          ))}
          <button className="btn-ghost !min-h-11 border-dashed" onClick={() => setPicker(!picker)}>
            <Icon name="plus" size={18} /> Acord
          </button>
        </div>

        {picker && (
          <div className="mt-3 rounded-2xl bg-surface-2 p-3">
            <div className="mb-2 flex gap-1.5 overflow-x-auto">
              {QUALITY_GROUPS.map((q) => (
                <button key={q.id} onClick={() => setGroup(q.id)} className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${group === q.id ? 'bg-primary text-primary-ink' : 'bg-surface'}`}>
                  {q.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {CHORDS.filter((c) => g.qualities.includes(c.quality)).map((c) => (
                <button key={c.name} onClick={() => add(c.name)} className="btn !min-h-11 !px-1 border-2 border-line bg-surface">
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <select
            className="min-h-11 flex-1 rounded-xl border-2 border-line bg-surface px-2 font-bold"
            value=""
            onChange={(e) => {
              const p = PROGRESSIONS.find((x) => x.id === e.target.value)
              if (p) setItems(p.chords.map((c) => ({ chord: c, beats: p.beats })))
            }}
            aria-label="Încarcă o progresie cunoscută"
          >
            <option value="">Încarcă o progresie cunoscută…</option>
            {PROGRESSIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.chords.join(' – ')} ({p.roman})
              </option>
            ))}
          </select>
          <button className="btn-ghost !min-h-11" onClick={() => setItems([])}>
            Golește
          </button>
        </div>
      </section>

      {st.items.length > 0 ? (
        <ProgressionPlayer key={playerKey} items={st.items} bpm={80} />
      ) : (
        <p className="card text-center text-muted">Adaugă cel puțin un acord ca să poți asculta.</p>
      )}

      <section className="card mt-4">
        <h2 className="mb-2 font-extrabold">Progresiile mele</h2>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nume (opțional)"
            className="min-h-11 flex-1 rounded-xl border-2 border-line bg-surface px-3"
            aria-label="Numele progresiei"
          />
          <button className="btn-primary !min-h-11" onClick={save} disabled={!st.items.length}>
            Salvează
          </button>
        </div>
        {st.saved.length > 0 && (
          <ul className="mt-3 space-y-2">
            {st.saved.map((p) => (
              <li key={p.name} className="flex items-center gap-2 rounded-xl bg-surface-2 p-2">
                <button className="flex-1 text-left" onClick={() => setItems(p.items)}>
                  <span className="font-bold">{p.name}</span>
                  <span className="block text-sm text-muted">{p.items.map((i) => i.chord).join(' – ')}</span>
                </button>
                <button
                  className="p-2 text-bad"
                  onClick={() => setSt((s) => ({ ...s, saved: s.saved.filter((x) => x.name !== p.name) }))}
                  aria-label={`Șterge ${p.name}`}
                >
                  <Icon name="trash" size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
