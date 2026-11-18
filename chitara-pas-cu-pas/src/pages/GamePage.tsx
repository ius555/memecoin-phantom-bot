/**
 * Jocul schimbărilor: o progresie apare pe ecran, iar tu trebuie să schimbi acordul la timp.
 *
 * Două moduri:
 * - Atingere: atingi ecranul exact când pui acordul nou (pe timpul 1). Contează precizia.
 * - Microfon: cânți, iar aplicația verifică (cu chromagrama) dacă se aude acordul cerut.
 * Puncte: Perfect 100, Bine 60, OK 30 – înmulțite cu combo-ul (x1…x4).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { ChordDiagram } from '../components/ChordDiagram'
import { Icon } from '../components/Icon'
import { PROGRESSIONS } from '../music/progressions'
import { usePlayAlong } from '../hooks/usePlayAlong'
import { useChordListener } from '../hooks/useChordListener'
import { judgeChord } from '../audio/chroma'
import { getAudio } from '../audio/context'
import { feedbackTone } from '../audio/clicks'
import { useProgress } from '../store/progress'
import { useToast } from '../store/toast'

type Mode = 'tap' | 'mic'
type Judgement = { label: string; points: number; color: string }

const GAME_PROGRESSIONS = PROGRESSIONS.filter((p) => !p.chords.some((c) => c === 'F' || c === 'Bm'))

export function GamePage() {
  const [phase, setPhase] = useState<'setup' | 'play' | 'result'>('setup')
  const [progId, setProgId] = useState(GAME_PROGRESSIONS[0].id)
  const [bpm, setBpm] = useState(70)
  const [mode, setMode] = useState<Mode>('tap')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [hits, setHits] = useState({ perfect: 0, good: 0, ok: 0, miss: 0 })
  const [last, setLast] = useState<(Judgement & { k: number }) | null>(null)
  const [isRecord, setIsRecord] = useState(false)
  const { state, recordGame } = useProgress()
  const toast = useToast()
  const listener = useChordListener()

  const prog = PROGRESSIONS.find((p) => p.id === progId)!
  // progresia de două ori
  const items = useMemo(() => [...prog.chords, ...prog.chords].map((c) => ({ chord: c, beats: prog.beats })), [prog])
  const beatDur = 60 / bpm

  // momentele (pe ceasul audio) la care începe fiecare acord
  const t0 = useRef(0)
  const scored = useRef<Set<number>>(new Set())
  const micStats = useRef<Record<number, { ok: number; total: number }>>({})
  const comboRef = useRef(0)
  const prevIndex = useRef(-1)
  const scoreRef = useRef(0)

  const boundary = (i: number) => t0.current + (prog.beats + i * prog.beats) * beatDur

  const player = usePlayAlong({
    items,
    bpm,
    mode: { kind: 'silent' },
    metronome: true,
    loop: false,
    countIn: 1,
    onEnd: () => finish(),
  })

  function judge(j: Judgement) {
    const mult = Math.min(4, 1 + Math.floor(comboRef.current / 3))
    const pts = j.points * mult
    comboRef.current = j.points > 0 ? comboRef.current + 1 : 0
    scoreRef.current += pts
    setCombo(comboRef.current)
    setScore(scoreRef.current)
    setLast({ ...j, points: pts, k: Date.now() })
    setHits((h) => ({
      perfect: h.perfect + (j.label === 'Perfect!' ? 1 : 0),
      good: h.good + (j.label === 'Bine' ? 1 : 0),
      ok: h.ok + (j.points > 0 && j.points < 60 ? 1 : 0),
      miss: h.miss + (j.points === 0 ? 1 : 0),
    }))
  }

  function start() {
    scored.current = new Set()
    micStats.current = {}
    prevIndex.current = -1
    comboRef.current = 0
    scoreRef.current = 0
    setScore(0)
    setCombo(0)
    setHits({ perfect: 0, good: 0, ok: 0, miss: 0 })
    setLast(null)
    setPhase('play')
    t0.current = getAudio().ctx.currentTime + 0.1
    player.start()
  }

  function finish() {
    if (mode === 'mic') finalizeMic(items.length - 1)
    const s = scoreRef.current
    const rec = recordGame(progId, s)
    setIsRecord(rec && s > 0)
    if (rec && s > 0) toast({ icon: '🏆', title: 'Record nou!', text: `${s} puncte` })
    setPhase('result')
    listener.stop()
  }

  // ---------- modul atingere ----------
  function tap() {
    if (mode !== 'tap' || !player.running) return
    const ctx = getAudio().ctx
    const latency = (ctx as AudioContext & { outputLatency?: number }).outputLatency ?? ctx.baseLatency ?? 0
    const now = ctx.currentTime - latency
    let bestI = -1
    let bestD = Infinity
    items.forEach((_, i) => {
      if (scored.current.has(i)) return
      const d = Math.abs(now - boundary(i))
      if (d < bestD) {
        bestD = d
        bestI = i
      }
    })
    if (bestI < 0 || bestD > beatDur) return
    scored.current.add(bestI)
    const rel = bestD / beatDur
    if (rel <= 0.2) judge({ label: 'Perfect!', points: 100, color: 'var(--good)' })
    else if (rel <= 0.45) judge({ label: 'Bine', points: 60, color: 'var(--primary)' })
    else judge({ label: now < boundary(bestI) ? 'Devreme' : 'Târziu', points: 30, color: 'var(--warn)' })
  }

  // acordurile ratate (nicio atingere până la un timp după schimbare)
  useEffect(() => {
    if (phase !== 'play' || mode !== 'tap') return
    const id = window.setInterval(() => {
      const now = getAudio().ctx.currentTime
      items.forEach((_, i) => {
        if (!scored.current.has(i) && now > boundary(i) + beatDur * 1.05) {
          scored.current.add(i)
          judge({ label: 'Ratat', points: 0, color: 'var(--bad)' })
        }
      })
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode, items, beatDur])

  // ---------- modul microfon ----------
  function finalizeMic(i: number) {
    if (i < 0 || scored.current.has(i)) return
    scored.current.add(i)
    const st = micStats.current[i] ?? { ok: 0, total: 0 }
    const ratio = st.total ? st.ok / st.total : 0
    if (ratio >= 0.6) judge({ label: 'Perfect!', points: 100, color: 'var(--good)' })
    else if (ratio >= 0.35) judge({ label: 'Bine', points: 60, color: 'var(--primary)' })
    else if (ratio >= 0.15) judge({ label: 'Aproape', points: 30, color: 'var(--warn)' })
    else judge({ label: 'Nu l-am auzit', points: 0, color: 'var(--bad)' })
  }

  useEffect(() => {
    if (mode !== 'mic' || phase !== 'play') return
    if (player.index !== prevIndex.current) {
      finalizeMic(prevIndex.current)
      prevIndex.current = player.index
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.index, mode, phase])

  useEffect(() => {
    if (mode !== 'mic' || phase !== 'play') return
    const id = window.setInterval(() => {
      const i = prevIndex.current
      if (i < 0) return
      const st = (micStats.current[i] ??= { ok: 0, total: 0 })
      st.total++
      if (listener.levelRef.current > 0.04 && judgeChord(listener.chromaRef.current, items[i].chord).ok) st.ok++
    }, 100)
    return () => clearInterval(id)
  }, [mode, phase, items, listener.levelRef, listener.chromaRef])

  useEffect(() => {
    if (last && last.points >= 100) feedbackTone(true)
  }, [last])

  // ---------- interfața ----------
  if (phase === 'setup') {
    return (
      <div>
        <PageHeader back={true} title="Jocul schimbărilor" subtitle="Schimbă acordul la timp și adună puncte." />
        <div className="card space-y-4">
          <label className="block">
            <span className="mb-1 block font-bold">Progresia</span>
            <select value={progId} onChange={(e) => setProgId(e.target.value)} className="min-h-12 w-full rounded-xl border-2 border-line bg-surface px-3 font-bold">
              {GAME_PROGRESSIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.chords.join(' – ')} {state.gameBest[p.id] ? `· record ${state.gameBest[p.id]}` : ''}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1 block font-bold">Tempo</span>
            <div className="grid grid-cols-4 gap-2">
              {[50, 70, 90, 110].map((b) => (
                <button key={b} onClick={() => setBpm(b)} className={`btn !min-h-11 !px-0 border-2 ${bpm === b ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block font-bold">Mod de joc</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode('tap')} className={`btn flex-col !gap-0 border-2 !py-2 ${mode === 'tap' ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}>
                👆 Atingere<span className="text-xs font-semibold opacity-80">atingi ecranul pe „1”</span>
              </button>
              <button onClick={() => setMode('mic')} className={`btn flex-col !gap-0 border-2 !py-2 ${mode === 'mic' ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}>
                🎤 Microfon<span className="text-xs font-semibold opacity-80">aplicația te ascultă</span>
              </button>
            </div>
          </div>
          <p className="text-sm text-muted">
            {mode === 'tap'
              ? 'Cânți acordurile pe chitară și atingi butonul mare exact când pui acordul nou – pe timpul 1. Cu cât ești mai precis, cu atât mai multe puncte.'
              : 'Cânți acordurile pe chitară, iar aplicația verifică prin microfon dacă se aude acordul cerut în fiecare măsură.'}{' '}
            Combo: la fiecare 3 reușite la rând punctele se înmulțesc (până la x4).
          </p>
          {mode === 'mic' && !listener.active && (
            <button className="btn-ghost w-full" onClick={listener.start}>
              <Icon name="mic" /> Pornește microfonul
            </button>
          )}
          {listener.error && <p className="rounded-xl bg-bad/10 p-3 text-sm">{listener.error}</p>}
          <button className="btn-primary w-full text-lg" onClick={start} disabled={mode === 'mic' && !listener.active}>
            <Icon name="play" /> Începe jocul
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const total = items.length
    return (
      <div>
        <PageHeader title="Rezultat" back={true} />
        <div className="card text-center">
          <div className="text-6xl">{isRecord ? '🏆' : score >= total * 150 ? '🎉' : '💪'}</div>
          <div className="mt-2 text-5xl font-extrabold tabular-nums">{score}</div>
          <div className="font-bold text-muted">puncte {isRecord && '· record nou!'}</div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
            <ResultStat label="Perfect" value={hits.perfect} color="text-good" />
            <ResultStat label="Bine" value={hits.good} color="text-primary" />
            <ResultStat label="OK" value={hits.ok} color="text-warn" />
            <ResultStat label="Ratate" value={hits.miss} color="text-bad" />
          </div>
          <p className="mt-3 text-sm text-muted">Record pe această progresie: {Math.max(score, state.gameBest[progId] ?? 0)}</p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => (mode === 'mic' ? setPhase('setup') : start())}>
              <Icon name="repeat" /> Din nou
            </button>
            <button className="btn-ghost flex-1" onClick={() => setPhase('setup')}>
              Setări
            </button>
          </div>
        </div>
      </div>
    )
  }

  const cur = player.index >= 0 ? player.index : 0
  const nextChord = items[cur + 1]?.chord
  const beat = player.slot >= 0 ? Math.floor(player.slot / 2) + 1 : 0

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-3xl font-extrabold tabular-nums">{score}</div>
          <div className="text-xs font-bold text-muted">puncte</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold text-wood">x{Math.min(4, 1 + Math.floor(combo / 3))}</div>
          <div className="text-xs font-bold text-muted">combo {combo}</div>
        </div>
        <button
          className="btn-ghost !min-h-11"
          onClick={() => {
            player.stop()
            finish()
          }}
        >
          Stop
        </button>
      </div>

      {/* banda cu acordurile */}
      <div className="mb-3 flex gap-1.5 overflow-hidden">
        {items.map((it, i) => (
          <span
            key={i}
            className={`shrink-0 rounded-lg px-2 py-1 text-sm font-extrabold transition ${
              i === player.index ? 'bg-primary text-primary-ink' : i < player.index ? 'bg-surface-2 text-muted line-through' : 'bg-surface-2'
            }`}
          >
            {it.chord}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <div className="card relative text-center">
          {player.countInBeat > 0 ? (
            <div className="py-10">
              <div className="text-sm font-bold text-muted">Pregătește-te: {items[0].chord}</div>
              <div key={player.countInBeat} className="beat-pulse text-8xl font-extrabold text-wood">
                {player.countInBeat}
              </div>
            </div>
          ) : (
            <>
              <div className="h-display text-6xl">{items[cur].chord}</div>
              <div className="mx-auto w-40">
                <ChordDiagram key={cur} chord={items[cur].chord} hideName still />
              </div>
            </>
          )}
          {last && (
            <div key={last.k} className="finger-pop absolute top-3 right-3 rounded-xl px-3 py-1 text-lg font-extrabold text-white" style={{ background: last.color }}>
              {last.label} {last.points > 0 && `+${last.points}`}
            </div>
          )}
        </div>
        <div className="w-24 text-center opacity-80">
          <div className="text-xs font-bold text-muted uppercase">Urmează</div>
          <div className="text-3xl font-extrabold">{nextChord ?? '🏁'}</div>
          {nextChord && <ChordDiagram chord={nextChord} hideName still />}
        </div>
      </div>

      <div className="my-4 flex justify-center gap-3" aria-hidden>
        {Array.from({ length: prog.beats }, (_, b) => (
          <span key={b} className={`h-5 w-5 rounded-full ${b + 1 === beat ? (b === 0 ? 'bg-wood' : 'bg-primary') : 'bg-surface-2'}`} />
        ))}
      </div>

      {mode === 'tap' ? (
        <button
          onPointerDown={tap}
          className="h-36 w-full rounded-3xl bg-primary text-2xl font-extrabold text-primary-ink shadow-lg active:scale-[0.98]"
        >
          Schimb acum!
          <span className="block text-sm font-semibold opacity-80">atinge pe „1”, când pui acordul nou</span>
        </button>
      ) : (
        <div className="card text-center">
          <div className="mb-2 font-bold">🎤 Te ascult… cântă {items[cur].chord}</div>
          <div className="h-3 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full bg-wood" style={{ width: `${listener.level * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}

function ResultStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-2">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs font-bold text-muted">{label}</div>
    </div>
  )
}
