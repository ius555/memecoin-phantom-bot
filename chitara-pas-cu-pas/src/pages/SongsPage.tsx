import { Link, Navigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SONGS, getSong, parseLine, songChords, songSequence } from '../music/songs'
import { getPattern } from '../music/strumming'
import { PageHeader } from '../components/PageHeader'
import { ChordDiagram } from '../components/ChordDiagram'
import { StrumArrow } from '../components/StrumPatternView'
import { Icon } from '../components/Icon'
import { usePlayAlong } from '../hooks/usePlayAlong'
import { useProgress } from '../store/progress'

const LEVEL_LABEL = ['', 'Ușor', 'Mediu', 'Avansat']

/** Lista cântecelor. */
export function SongsPage() {
  const { state } = useProgress()
  return (
    <div>
      <PageHeader back={true} title="Cântece" subtitle="Cântece populare din domeniul public și compoziții originale." />
      <Link to="/cantece/import" className="card bg-hero mb-4 flex items-center gap-3 !border-0 text-white shadow-md">
        <span className="text-3xl" aria-hidden>
          🎧
        </span>
        <span className="flex-1">
          <span className="block text-lg font-extrabold">Încarcă melodia ta</span>
          <span className="block text-sm opacity-90">Un fișier audio sau versuri cu acorduri – îți arăt acordurile și degetele.</span>
        </span>
        <Icon name="next" />
      </Link>
      <div className="space-y-3">
        {SONGS.map((s) => (
          <Link key={s.id} to={`/cantece/${s.id}`} className="card flex items-center gap-4 transition hover:border-primary active:scale-[0.99]">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-2xl" aria-hidden>
              {state.songsPracticed.includes(s.id) ? '✅' : '🎵'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold">{s.title}</span>
              <span className="block truncate text-xs text-muted">{s.origin}</span>
              <span className="mt-1 flex flex-wrap gap-1">
                <span className="chip !py-0.5 !text-xs">{LEVEL_LABEL[s.level]}</span>
                {songChords(s).map((c) => (
                  <span key={c} className="chip !py-0.5 !text-xs !text-ink">
                    {c}
                  </span>
                ))}
              </span>
            </span>
            <Icon name="next" className="text-muted" />
          </Link>
        ))}
      </div>
    </div>
  )
}

/** Un cântec: acordurile folosite, ritmul recomandat și versurile cu acordurile deasupra. */
export function SongPage() {
  const { songId = '' } = useParams()
  const song = getSong(songId)
  const { state, markSong } = useProgress()
  const [bpm, setBpm] = useState(song?.bpm ?? 80)
  const items = useMemo(() => (song ? songSequence(song) : []), [song])
  const pattern = getPattern(song?.strum ?? 'jos-4')
  const player = usePlayAlong({ items, bpm, mode: { kind: 'strum', pattern }, loop: false, countIn: 1 })
  const activeRef = useRef<HTMLSpanElement | null>(null)

  // derulăm automat la versul curent
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [player.index])

  if (!song) return <Navigate to="/cantece" replace />
  const done = state.songsPracticed.includes(song.id)
  let chordCounter = -1

  return (
    <div>
      <PageHeader back="/cantece" title={song.title} subtitle={song.origin} />

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {songChords(song).map((c) => (
          <div key={c} className="card w-28 shrink-0 !p-2">
            <ChordDiagram chord={c} playable still />
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="mb-1 text-sm font-bold text-muted">
          Ritm recomandat: {pattern.name} · {pattern.beats}/4
        </div>
        <div className="flex justify-center gap-1">
          {pattern.slots.map((s, i) => (
            <StrumArrow key={i} dir={s === '-' ? (i % 2 ? 'U' : 'D') : s} ghost={s === '-'} active={player.slot >= 0 && player.slot % pattern.slots.length === i} />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button className={`${player.running ? 'btn-accent' : 'btn-primary'} flex-1`} onClick={player.toggle}>
            <Icon name={player.running ? 'stop' : 'play'} size={18} /> {player.running ? 'Stop' : 'Cântă cu acompaniament'}
          </button>
        </div>
        <label className="mt-3 flex items-center gap-3 text-sm font-bold text-muted">
          <span className="w-16">{bpm} bpm</span>
          <input type="range" min={40} max={140} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="flex-1 accent-[var(--primary)]" />
        </label>
      </div>

      <div className="card space-y-5">
        {song.sections.map((sec) => (
          <section key={sec.name}>
            <h3 className="mb-2 text-xs font-extrabold tracking-wider text-accent uppercase">{sec.name}</h3>
            {sec.lines.map((line, li) => (
              <p key={li} className="mb-2 flex flex-wrap items-end leading-tight">
                {parseLine(line).map((seg, si) => {
                  const idx = seg.chord ? ++chordCounter : -1
                  const active = idx >= 0 && idx === player.index
                  return (
                    <span key={si} className="inline-flex flex-col" ref={active ? activeRef : undefined}>
                      <span className={`h-6 self-start pr-1 text-sm font-extrabold ${active ? 'rounded bg-primary px-1 text-primary-ink' : 'text-primary'}`}>
                        {seg.chord ?? ' '}
                      </span>
                      <span className="text-lg whitespace-pre">{seg.text || ' '}</span>
                    </span>
                  )
                })}
              </p>
            ))}
          </section>
        ))}
      </div>

      <button className={`mt-4 w-full ${done ? 'btn-ghost' : 'btn-primary'}`} onClick={() => markSong(song.id)} disabled={done}>
        {done ? '✅ Ai exersat acest cântec' : '🎶 Am cântat-o de la cap la coadă!'}
      </button>
    </div>
  )
}
