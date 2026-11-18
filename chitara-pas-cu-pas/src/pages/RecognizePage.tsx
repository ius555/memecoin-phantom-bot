import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { ChordDiagram } from '../components/ChordDiagram'
import { Icon } from '../components/Icon'
import { useChordListener } from '../hooks/useChordListener'
import { judgeChord } from '../audio/chroma'
import { feedbackTone } from '../audio/clicks'
import { NOTE_NAMES } from '../music/theory'
import { useProgress } from '../store/progress'
import { getChord, chordPitchClasses } from '../music/chords'

const TARGETS = ['Em', 'Am', 'E', 'A', 'D', 'C', 'G', 'Dm', 'F', 'Bm']

/**
 * Verifică acordul cu microfonul: alegi un acord, îl cânți, iar aplicația îți spune
 * dacă l-a recunoscut și ce notă lipsește (versiune simplă, cu chromagramă).
 */
export function RecognizePage() {
  const [target, setTarget] = useState('Em')
  const listener = useChordListener()
  const [verdict, setVerdict] = useState<ReturnType<typeof judgeChord> | null>(null)
  const [success, setSuccess] = useState(false)
  const okSince = useRef<number | null>(null)
  const { addXp } = useProgress()

  // evaluăm de ~5 ori pe secundă, doar când se aude ceva
  useEffect(() => {
    if (!listener.active) return
    const id = window.setInterval(() => {
      if (listener.levelRef.current < 0.05) {
        okSince.current = null
        return
      }
      const v = judgeChord(listener.chromaRef.current, target)
      setVerdict(v)
      if (v.ok) {
        okSince.current ??= performance.now()
        if (performance.now() - okSince.current > 500) {
          setSuccess((s) => {
            if (!s) {
              feedbackTone(true)
              addXp(5, `Acordul ${target} recunoscut`)
            }
            return true
          })
        }
      } else okSince.current = null
    }, 200)
    return () => clearInterval(id)
  }, [listener.active, listener.levelRef, listener.chromaRef, target, addXp])

  const targetChord = getChord(target)
  const targetPcs = targetChord ? chordPitchClasses(targetChord) : []

  function choose(c: string) {
    setTarget(c)
    setVerdict(null)
    setSuccess(false)
    okSince.current = null
  }

  return (
    <div>
      <PageHeader back={true} title="Verifică acordul" subtitle="Cântă acordul ales – aplicația ascultă și îți spune dacă sună corect." />

      <div className="mb-4 flex flex-wrap gap-2">
        {TARGETS.map((c) => (
          <button key={c} onClick={() => choose(c)} className={`min-h-11 min-w-12 rounded-xl border-2 px-3 font-extrabold ${c === target ? 'border-primary bg-primary text-primary-ink' : 'border-line bg-surface'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <ChordDiagram key={target} chord={target} playable />
        </div>

        <div className="card flex flex-col">
          <div
            className={`rounded-2xl p-4 text-center transition ${success ? 'bg-good/15' : verdict && !verdict.ok ? 'bg-warn/10' : 'bg-surface-2'}`}
            aria-live="polite"
          >
            {!listener.active ? (
              <p className="font-bold text-muted">Pornește microfonul, apoi cântă acordul {target}.</p>
            ) : success ? (
              <>
                <div className="text-4xl">✅</div>
                <p className="text-xl font-extrabold text-good">Corect! Am auzit {target}.</p>
              </>
            ) : !verdict || listener.level < 0.05 ? (
              <p className="font-bold text-muted">Ascult... lovește corzile și lasă-le să sune.</p>
            ) : verdict.ok ? (
              <p className="text-xl font-extrabold text-good">Sună a {target}... ține-l!</p>
            ) : (
              <>
                <p className="text-lg font-extrabold">Încă nu. Sună mai degrabă a {verdict.best.chord.name}.</p>
                {verdict.missing.length > 0 && (
                  <p className="mt-1 text-sm">
                    Nu aud bine nota {verdict.missing.join(', ')}. Verifică degetul de pe coarda care ar trebui s-o cânte.
                  </p>
                )}
              </>
            )}
          </div>

          {/* nivelul sunetului */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
            <div className="h-full bg-wood transition-[width] duration-100" style={{ width: `${listener.level * 100}%` }} />
          </div>

          {/* chromagrama */}
          <div className="mt-3">
            <div className="mb-1 text-xs font-extrabold tracking-wider text-muted uppercase">Ce note aud</div>
            <div className="flex h-28 items-end gap-1" role="img" aria-label="Energia fiecărei note">
              {NOTE_NAMES.map((n, i) => {
                const inChord = targetPcs.includes(i)
                return (
                  <div key={n} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-20 w-full items-end rounded bg-surface-2">
                      <div className={`w-full rounded ${inChord ? 'bg-primary' : 'bg-muted/50'}`} style={{ height: `${listener.chroma[i] * 100}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold ${inChord ? 'text-primary' : 'text-muted'}`}>{n}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {listener.error && <p className="mt-3 rounded-xl bg-bad/10 p-3 text-sm">{listener.error}</p>}
          <div className="mt-auto pt-4">
            {listener.active ? (
              <button className="btn-ghost w-full" onClick={listener.stop}>
                <Icon name="stop" size={18} /> Oprește microfonul
              </button>
            ) : (
              <button className="btn-primary w-full" onClick={listener.start}>
                <Icon name="mic" /> Pornește microfonul
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        Recunoașterea e aproximativă: funcționează cel mai bine într-o cameră liniștită, cu chitara acordată și telefonul aproape.
        Barele verzi sunt notele acordului ales.
      </p>
    </div>
  )
}
