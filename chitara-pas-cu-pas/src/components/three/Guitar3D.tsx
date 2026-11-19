/**
 * Simulatorul 3D, gata de pus în orice pagină.
 *
 * Fișierul acesta e mic și se încarcă odată cu aplicația; partea grea (Three.js + scena)
 * se descarcă abia când simulatorul apare pe ecran (React.lazy).
 * Se ocupă și de:
 * - butoanele pentru unghiurile de cameră
 * - oprirea randării când simulatorul nu e vizibil (IntersectionObserver)
 * - revenirea automată la diagrama 2D dacă WebGL lipsește, telefonul e slab sau apare o eroare
 */
import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react'
import { useSettings } from '../../store/settings'
import { getChord, type Chord } from '../../music/chords'
import { playNote } from '../../audio/guitar'
import { ChordDiagram } from '../ChordDiagram'
import { check3DSupport, fallbackMessage } from './support'
import { VIEWS, VIEW_ORDER, type ViewId } from './views'

const GuitarScene = lazy(() => import('./GuitarScene'))

export interface Guitar3DProps {
  chord: string | Chord
  shapeIndex?: number
  /** înălțimea zonei 3D (px) */
  height?: number
  initialView?: ViewId
  className?: string
  /** crește din exterior ca să repornească animația degetelor */
  replayKey?: number
  /** se cântă un ritm: camera cuprinde și zona penei */
  strumming?: boolean
}

type FailReason = 'no-webgl' | 'weak' | 'slow' | 'error'

/** Prinde erorile din scena 3D (ex. WebGL refuzat) și trece la 2D, păstrând mesajul tehnic. */
class SceneBoundary extends Component<{ onError: (message: string) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error instanceof Error ? error.message : String(error))
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function Guitar3D({ chord, shapeIndex = 0, height = 340, initialView = 'player', className = '', replayKey = 0, strumming = false }: Guitar3DProps) {
  const { settings, isDark } = useSettings()
  const [view, setView] = useState<ViewId>(initialView)
  const [viewKey, setViewKey] = useState(0)
  const [fail, setFail] = useState<FailReason | null>(() => {
    const s = check3DSupport()
    return s.ok ? null : s.reason
  })
  const [detail, setDetail] = useState<string | null>(null)
  // la pierderea contextului WebGL (des pe telefon, când treci prin alte aplicații) reconstruim scena
  const [sceneKey, setSceneKey] = useState(0)
  const losses = useRef<number[]>([])
  const [visible, setVisible] = useState(false)
  // scena există doar cât e (aproape) pe ecran: când ieși din ea, randarea se oprește imediat,
  // iar după câteva secunde scena e demontată și contextul WebGL eliberat (memorie pe telefon)
  const [mounted, setMounted] = useState(false)
  const unmountTimer = useRef<number | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const ch = typeof chord === 'string' ? getChord(chord) : chord
  const shape = ch?.shapes[Math.min(shapeIndex, (ch?.shapes.length ?? 1) - 1)]

  // randăm doar când zona 3D e (măcar parțial) pe ecran
  useEffect(() => {
    const el = box.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      setMounted(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
        if (unmountTimer.current) clearTimeout(unmountTimer.current)
        if (entry.isIntersecting) setMounted(true)
        else unmountTimer.current = window.setTimeout(() => setMounted(false), 8000)
      },
      { rootMargin: '150px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (unmountTimer.current) clearTimeout(unmountTimer.current)
    }
  }, [fail])

  function pluck(s: number) {
    const f = shape?.frets[s]
    // coarda din acord (sau liberă, dacă în acord nu se cântă)
    playNote(s, f ?? 0)
  }

  function contextLost() {
    const now = Date.now()
    losses.current = [...losses.current.filter((t) => now - t < 60000), now]
    // o pierdere izolată e normală: reconstruim scena; de 3 ori într-un minut → trecem la 2D
    if (losses.current.length >= 3) {
      setDetail('Contextul WebGL s-a pierdut de mai multe ori (memorie grafică insuficientă?)')
      setFail('error')
    } else setSceneKey((k) => k + 1)
  }

  function retry() {
    losses.current = []
    setDetail(null)
    setFail(null)
    setSceneKey((k) => k + 1)
  }

  if (fail) {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <div className="w-full rounded-xl bg-warn/10 p-3 text-sm" role="status">
          🧩 {fallbackMessage(fail)}
          {detail && <div className="mt-1 font-mono text-[11px] break-words text-muted">Detalii: {detail}</div>}
        </div>
        {ch && <ChordDiagram chord={ch} shapeIndex={shapeIndex} playable showNotes />}
        {fail !== 'no-webgl' && (
          <button className="btn-ghost" onClick={retry}>
            {fail === 'weak' ? 'Încearcă totuși 3D' : 'Încearcă din nou 3D'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        ref={box}
        className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface"
        style={{ height }}
      >
        {mounted ? (
          <SceneBoundary
            key={sceneKey}
            onError={(m) => {
              setDetail(m)
              setFail('error')
            }}
          >
            <Suspense fallback={<Loading />}>
              <GuitarScene
                shape={shape}
                strumming={strumming}
                replayKey={replayKey}
                themeKey={isDark ? 'dark' : 'light'}
                view={view}
                viewKey={viewKey}
                mirror={settings.leftHanded}
                active={visible}
                onPluck={pluck}
                onPerformanceFail={() => setFail('slow')}
                onContextLost={contextLost}
              />
            </Suspense>
          </SceneBoundary>
        ) : (
          <Loading />
        )}
        <div className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-surface/80 px-2 py-0.5 text-[11px] font-bold text-muted">
          rotește · ciupește pentru zoom · atinge o coardă
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5" role="group" aria-label="Unghiul camerei">
        {VIEW_ORDER.map((v) => (
          <button
            key={v}
            onClick={() => {
              setView(v)
              setViewKey((k) => k + 1)
            }}
            aria-pressed={view === v}
            className={`btn !min-h-11 !px-1 border-2 text-xs leading-tight sm:text-sm ${view === v ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-surface'}`}
          >
            {VIEWS[v].label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="grid h-full place-items-center text-sm font-bold text-muted">
      <div className="flex flex-col items-center gap-2">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-primary" />
        Se încarcă chitara 3D…
      </div>
    </div>
  )
}
