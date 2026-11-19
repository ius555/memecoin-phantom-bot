/**
 * „Încarcă o melodie”: aplicația îți arată acordurile unei melodii și cum ții degetele.
 *
 * 1. Fișier audio: detectăm acordurile (src/audio/analysis.ts), apoi, în timp ce asculți melodia,
 *    acordul curent apare pe chitara 3D / diagramă, iar o bandă colorată arată ce urmează.
 * 2. Text cu acorduri: lipești versuri cu acorduri (de pe orice site de acorduri) și le cânți
 *    cu acompaniamentul aplicației.
 * În ambele cazuri, aplicația propune un capodastru care face acordurile mai ușoare.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { ChordDiagram } from '../components/ChordDiagram'
import { Guitar3D } from '../components/three/Guitar3D'
import { ViewToggle } from '../components/ChordViews'
import { Icon } from '../components/Icon'
import { useSettings } from '../store/settings'
import { decodeForAnalysis } from '../audio/decode'
import { chordsFromChroma, computeChroma, suggestCapo, transposeChord, type Segment } from '../audio/analysis'
import { parseChordSheet } from '../music/chordSheet'
import { parseLine, songSequence, type Song } from '../music/songs'
import { getChord, chordFullName } from '../music/chords'
import { STRUM_PATTERNS } from '../music/strumming'
import { usePlayAlong } from '../hooks/usePlayAlong'
import { loadJSON, saveJSON } from '../store/storage'

const ROOT_PC: Record<string, number> = { C: 0, 'C#': 1, Db: 1, D: 2, Eb: 3, 'D#': 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, Ab: 8, 'G#': 8, A: 9, Bb: 10, 'A#': 10, B: 11 }

/** O culoare vie pentru fiecare fundamentală (aceeași notă = aceeași culoare peste tot). */
export function chordColor(name: string): string {
  const m = name.match(/^([A-G][#b]?)/)
  if (!m || name === 'N') return 'var(--surface-2)'
  const pc = ROOT_PC[m[1]] ?? 0
  const minor = /^[A-G][#b]?m(?!aj)/.test(name)
  return `hsl(${(pc * 30 + 340) % 360} ${minor ? 62 : 74}% ${minor ? 42 : 52}%)`
}

const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

export function ImportPage() {
  const [tab, setTab] = useState<'audio' | 'text'>('audio')
  return (
    <div>
      <PageHeader back={true} title="Încarcă o melodie" subtitle="Vezi acordurile și cum ții degetele, pe măsură ce asculți." />
      <div className="mb-4 grid grid-cols-2 gap-2" role="tablist">
        {(
          [
            ['audio', '🎧 Fișier audio'],
            ['text', '📝 Text cu acorduri'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`btn border-2 ${tab === id ? 'border-primary bg-primary text-primary-ink' : 'border-line bg-surface'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'audio' ? <AudioImport /> : <TextImport />}
    </div>
  )
}

/* ------------------------------------------------------------------ fișier audio */

function AudioImport() {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [stage, setStage] = useState<'idle' | 'decode' | 'analyze' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [segments, setSegments] = useState<Segment[]>([])
  const [capo, setCapo] = useState(0)
  const [suggested, setSuggested] = useState(0)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const audio = useRef<HTMLAudioElement>(null)
  const strip = useRef<HTMLDivElement>(null)

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url)
  }, [url])

  async function onFile(f: File) {
    setFile(f)
    setError('')
    setSegments([])
    setStage('decode')
    setProgress(0)
    if (url) URL.revokeObjectURL(url)
    setUrl(URL.createObjectURL(f))
    try {
      const { samples, sampleRate, duration: d } = await decodeForAnalysis(f)
      setDuration(d)
      setStage('analyze')
      const frames = await computeChroma(samples, sampleRate, setProgress)
      const segs = chordsFromChroma(frames, sampleRate)
      const cap = suggestCapo(segs)
      setSegments(segs)
      setSuggested(cap.capo)
      setCapo(cap.capo)
      setStage('done')
    } catch (e) {
      setError((e as Error).message)
      setStage('error')
    }
  }

  // urmărim poziția redării (de ~20 ori pe secundă)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = () => {
      if (audio.current) setTime(audio.current.currentTime)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const idx = segments.findIndex((s) => time >= s.start && time < s.end)
  const cur = segments[idx]
  // acordul afișat: dacă acum e o pauză („N”), arătăm următorul acord, ca să te pregătești
  const shownSeg = cur && cur.chord !== 'N' ? cur : segments.slice(Math.max(0, idx)).find((s) => s.chord !== 'N')
  const shown = shownSeg ? transposeChord(shownSeg.chord, -capo) : null
  const upcoming = segments
    .slice(Math.max(0, idx) + 1)
    .filter((s) => s.chord !== 'N')
    .slice(0, 4)
  const uniqueChords = useMemo(() => [...new Set(segments.filter((s) => s.chord !== 'N').map((s) => transposeChord(s.chord, -capo)))], [segments, capo])

  // banda de acorduri derulează singură spre acordul curent
  useEffect(() => {
    const el = strip.current?.querySelector<HTMLElement>(`[data-i="${idx}"]`)
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [idx])

  function seek(t: number) {
    if (!audio.current) return
    audio.current.currentTime = t
    setTime(t)
  }

  return (
    <div className="space-y-4">
      <label className="card flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed !py-6 text-center transition hover:border-primary">
        <span className="text-4xl" aria-hidden>
          🎵
        </span>
        <span className="text-lg font-extrabold">{file ? file.name : 'Alege o melodie de pe telefon'}</span>
        <span className="text-sm text-muted">mp3, m4a, wav, ogg · maxim 12 minute · fișierul rămâne pe telefonul tău</span>
        <input
          type="file"
          accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.flac"
          className="sr-only"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        <span className="btn-primary mt-1">
          <Icon name="plus" size={18} /> {file ? 'Alege altă melodie' : 'Alege fișierul'}
        </span>
      </label>

      {(stage === 'decode' || stage === 'analyze') && (
        <div className="card" aria-live="polite">
          <div className="mb-2 font-bold">{stage === 'decode' ? 'Citesc fișierul…' : `Caut acordurile… ${Math.round(progress * 100)}%`}</div>
          <div className="h-3 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width]" style={{ width: `${stage === 'decode' ? 8 : 8 + progress * 92}%` }} />
          </div>
        </div>
      )}
      {stage === 'error' && <p className="card bg-bad/10 text-sm">{error}</p>}

      {stage === 'done' && url && (
        <>
          {/* redarea */}
          <div className="card space-y-3">
            <audio
              ref={audio}
              src={url}
              preload="auto"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onSeeked={(e) => setTime(e.currentTarget.currentTime)}
            />
            <div className="flex items-center gap-3">
              <button
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-primary-ink shadow-md active:scale-95"
                onClick={() => (playing ? audio.current?.pause() : audio.current?.play())}
                aria-label={playing ? 'Pauză' : 'Redă'}
              >
                <Icon name={playing ? 'pause' : 'play'} size={26} />
              </button>
              <div className="min-w-0 flex-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={time}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                  aria-label="Poziția în melodie"
                />
                <div className="flex justify-between text-xs font-bold text-muted tabular-nums">
                  <span>{fmt(time)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>
            </div>
            {/* banda colorată cu acordurile; atingi un acord ca să sari la el */}
            <div ref={strip} className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1" aria-label="Acordurile melodiei, în ordine">
              {segments.map((s, i) => (
                <button
                  key={i}
                  data-i={i}
                  onClick={() => seek(s.start + 0.01)}
                  className={`flex h-12 shrink-0 flex-col items-center justify-center rounded-lg px-1 text-sm font-extrabold text-white transition ${
                    i === idx ? 'scale-105 ring-4 ring-ink/20' : 'opacity-85'
                  }`}
                  style={{ width: Math.max(38, Math.min(140, (s.end - s.start) * 22)), background: s.chord === 'N' ? 'var(--line)' : chordColor(transposeChord(s.chord, -capo)) }}
                  title={`${fmt(s.start)} – ${s.chord === 'N' ? 'fără acord' : transposeChord(s.chord, -capo)}`}
                >
                  {s.chord === 'N' ? '·' : transposeChord(s.chord, -capo)}
                  <span className="text-[10px] font-semibold opacity-80">{fmt(s.start)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* acordul curent + degetele */}
          <ChordStage chord={shown} upcoming={upcoming.map((s) => transposeChord(s.chord, -capo))} />

          <CapoPicker capo={capo} suggested={suggested} onChange={setCapo} original={[...new Set(segments.filter((s) => s.chord !== 'N').map((s) => s.chord))]} />

          <div className="card">
            <h3 className="mb-2 font-extrabold">Acordurile din melodie ({uniqueChords.length})</h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {uniqueChords.map((c) => (
                <div key={c} className="rounded-xl bg-surface-2 p-1.5">
                  <ChordDiagram chord={c} still playable />
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-muted">
            Detectarea e automată și aproximativă: merge cel mai bine pe melodii cu chitară sau pian clar. Ascultă și corectează-te după ureche.
          </p>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ text cu acorduri */

const EXAMPLE = `Strofa 1
C              G
Hai să dăm mână cu mână
G              C
Cei cu inima română,
F               C
Să-nvârtim hora frăției
G               C
Pe pământul României!`

function TextImport() {
  const [text, setText] = useState(() => loadJSON('cpp.import', { text: EXAMPLE }).text)
  const [song, setSong] = useState<Song | null>(null)
  const [capo, setCapo] = useState(0)
  const [suggested, setSuggested] = useState(0)
  const [bpm, setBpm] = useState(80)
  const [beats, setBeats] = useState(4)
  const [pattern, setPattern] = useState(STRUM_PATTERNS[0])

  function show() {
    saveJSON('cpp.import', { text })
    const s = parseChordSheet(text)
    setSong(s)
    // capodastru: tratăm fiecare acord ca un segment de „beats” timpi
    const segs = songSequence(s).map((x, i) => ({ start: i, end: i + 1, chord: x.chord }))
    const cap = suggestCapo(segs)
    setSuggested(cap.capo)
    setCapo(cap.capo)
  }

  const items = useMemo(() => (song ? songSequence(song).map((x) => ({ chord: transposeChord(x.chord, -capo), beats })) : []), [song, capo, beats])
  const player = usePlayAlong({ items, bpm, mode: { kind: 'strum', pattern }, loop: false, countIn: 1 })
  const cur = player.index >= 0 ? player.index : 0
  let counter = -1

  return (
    <div className="space-y-4">
      <div className="card">
        <label htmlFor="sheet" className="mb-1 block font-extrabold">
          Lipește versurile cu acorduri
        </label>
        <p className="mb-2 text-sm text-muted">Acordurile pot fi pe rândul de deasupra versului (ca pe site-urile de acorduri) sau în text, ca „[Am]”.</p>
        <textarea
          id="sheet"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          spellCheck={false}
          className="w-full rounded-xl border-2 border-line bg-surface p-3 font-mono text-sm outline-none focus:border-primary"
        />
        <button className="btn-primary mt-2 w-full" onClick={show}>
          Arată acordurile și degetele
        </button>
      </div>

      {song && items.length === 0 && <p className="card text-sm">Nu am găsit niciun acord în text. Verifică dacă acordurile sunt scrise cu litere (C, Am, G7...).</p>}

      {song && items.length > 0 && (
        <>
          <ChordStage chord={items[cur]?.chord ?? null} upcoming={items.slice(cur + 1, cur + 5).map((x) => x.chord)} />

          <div className="card space-y-3">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              {STRUM_PATTERNS.slice(0, 6).map((p) => (
                <button key={p.id} onClick={() => setPattern(p)} className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${p.id === pattern.id ? 'border-primary bg-primary text-primary-ink' : 'border-line'}`}>
                  {p.short}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className={`${player.running ? 'btn-accent' : 'btn-primary'} flex-1`} onClick={player.toggle}>
                <Icon name={player.running ? 'stop' : 'play'} size={18} /> {player.running ? 'Stop' : 'Cântă cu acompaniament'}
              </button>
              <select value={beats} onChange={(e) => setBeats(Number(e.target.value))} className="min-h-12 rounded-xl border-2 border-line bg-surface px-2 font-bold" aria-label="Timpi pe acord">
                <option value={2}>2 timpi</option>
                <option value={4}>4 timpi</option>
                <option value={8}>8 timpi</option>
              </select>
            </div>
            <label className="flex items-center gap-3 text-sm font-bold text-muted">
              <span className="w-16">{bpm} bpm</span>
              <input type="range" min={40} max={160} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="flex-1 accent-[var(--primary)]" />
            </label>
          </div>

          <CapoPicker capo={capo} suggested={suggested} onChange={setCapo} original={[...new Set(songSequence(song).map((x) => x.chord))]} />

          <div className="card space-y-4">
            {song.sections.map((sec, si) => (
              <section key={si}>
                <h3 className="mb-1 text-xs font-extrabold tracking-wider text-accent uppercase">{sec.name}</h3>
                {sec.lines.map((line, li) => (
                  <p key={li} className="mb-2 flex flex-wrap items-end leading-tight">
                    {parseLine(line).map((seg, k) => {
                      const i = seg.chord ? ++counter : -1
                      const name = seg.chord ? transposeChord(seg.chord, -capo) : null
                      const active = i >= 0 && i === player.index
                      return (
                        <span key={k} className="inline-flex flex-col">
                          <span
                            className={`h-6 self-start rounded px-1 text-sm font-extrabold ${active ? 'text-white' : ''}`}
                            style={name ? { background: active ? chordColor(name) : 'transparent', color: active ? '#fff' : chordColor(name) } : undefined}
                          >
                            {name ?? ' '}
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
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ piese comune */

/** Acordul curent (mare, pe chitara 3D sau pe diagramă) + următoarele acorduri. */
function ChordStage({ chord, upcoming }: { chord: string | null; upcoming: string[] }) {
  const { settings } = useSettings()
  const ch = chord ? getChord(chord) : undefined
  return (
    <div className="card overflow-hidden !p-0">
      <div className="flex items-center gap-3 p-3" style={{ background: chord ? `linear-gradient(90deg, ${chordColor(chord)}, transparent 85%)` : undefined }}>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold tracking-wider text-white/90 uppercase drop-shadow">Acum</div>
          <div className="h-display text-4xl leading-none text-white drop-shadow">{ch?.name ?? '—'}</div>
          {ch && <div className="text-sm font-bold text-white/90 drop-shadow">{chordFullName(ch)}</div>}
        </div>
        <ViewToggle />
      </div>
      <div className="p-3">
        {ch ? (
          settings.chordView === '3d' ? (
            <Guitar3D chord={ch} height={290} />
          ) : (
            <div className="mx-auto max-w-[230px]">
              <ChordDiagram key={ch.name} chord={ch} hideName showNotes maxWidth={230} />
            </div>
          )
        ) : (
          <p className="py-8 text-center text-muted">Apasă pe redare.</p>
        )}
        {upcoming.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm font-bold text-muted">
            Urmează:
            {upcoming.map((u, i) => (
              <span key={i} className="rounded-lg px-2 py-1 text-white" style={{ background: chordColor(u), opacity: 1 - i * 0.18 }}>
                {u}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Alegerea capodastrului, cu sugestia aplicației. */
function CapoPicker({ capo, suggested, onChange, original }: { capo: number; suggested: number; onChange: (c: number) => void; original: string[] }) {
  return (
    <div className="card">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="font-extrabold">Capodastru</h3>
        {suggested > 0 && <span className="chip !bg-accent-soft !text-accent">Recomandat: tasta {suggested}</span>}
      </div>
      <p className="mb-2 text-sm text-muted">
        {capo === 0
          ? 'Fără capodastru: cânți acordurile originale.'
          : `Pune capodastrul la tasta ${capo} și cântă formele de mai sus – sună exact ca originalul (${original.slice(0, 5).join(', ')}).`}
      </p>
      <div className="grid grid-cols-8 gap-1">
        {Array.from({ length: 8 }, (_, c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            aria-pressed={capo === c}
            className={`min-h-11 rounded-lg border-2 font-extrabold ${capo === c ? 'border-primary bg-primary text-primary-ink' : c === suggested ? 'border-accent text-accent' : 'border-line'}`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
