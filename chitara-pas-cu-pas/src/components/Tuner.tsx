/**
 * Acordorul cu microfon.
 * - modul automat: recunoaște singur coarda cea mai apropiată
 * - sau alegi tu coarda (E A D G B E)
 * - acul arată abaterea în cenți (100 de cenți = un semiton): stânga = prea jos, dreapta = prea sus
 * - butonul de difuzor cântă nota de referință, ca să acordezi și după ureche
 */
import { useEffect, useRef, useState } from 'react'
import { openMic, micErrorMessage, type MicHandle } from '../audio/mic'
import { detectPitch } from '../audio/pitch'
import { STRINGS, centsBetween, freqToMidi, midiToFreq, noteName, SOLFEGE, noteLetter } from '../music/theory'
import { playNote } from '../audio/guitar'
import { useProgress } from '../store/progress'
import { Icon } from './Icon'

const IN_TUNE = 5 // cenți

export function Tuner() {
  const [mic, setMic] = useState<MicHandle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [target, setTarget] = useState<number | 'auto'>('auto')
  const [reading, setReading] = useState<{ freq: number; stringIndex: number; cents: number; note: string } | null>(null)
  const [tuned, setTuned] = useState<boolean[]>(() => STRINGS.map(() => false))
  const { markTuner } = useProgress()
  const targetRef = useRef(target)
  targetRef.current = target
  const history = useRef<number[]>([])
  const holdSince = useRef<number | null>(null)

  async function start() {
    setError(null)
    try {
      const m = await openMic(4096)
      setMic(m)
    } catch (e) {
      setError(micErrorMessage(e))
    }
  }

  function stop() {
    mic?.stop()
    setMic(null)
    setReading(null)
  }

  // bucla de analiză (~20 de ori pe secundă)
  useEffect(() => {
    if (!mic) return
    const buf = new Float32Array(mic.analyser.fftSize)
    const sr = mic.analyser.context.sampleRate
    let silence = 0
    const id = window.setInterval(() => {
      mic.analyser.getFloatTimeDomainData(buf)
      const r = detectPitch(buf, sr, 65, 700)
      if (!r || r.clarity < 0.8) {
        if (++silence > 12) {
          setReading(null)
          history.current = []
        }
        return
      }
      silence = 0
      // mediana ultimelor citiri, ca acul să nu tremure
      history.current = [...history.current.slice(-4), r.freq]
      const freq = [...history.current].sort((a, b) => a - b)[Math.floor(history.current.length / 2)]
      const midi = freqToMidi(freq)
      const t = targetRef.current
      const stringIndex =
        t === 'auto'
          ? STRINGS.reduce((best, s, i) => (Math.abs(s.midi - midi) < Math.abs(STRINGS[best].midi - midi) ? i : best), 0)
          : t
      const cents = centsBetween(freq, midiToFreq(STRINGS[stringIndex].midi))
      setReading({ freq, stringIndex, cents, note: noteName(midi) })

      // o coardă e "acordată" dacă stă în zona verde aproape o secundă
      if (Math.abs(cents) <= IN_TUNE) {
        holdSince.current ??= performance.now()
        if (performance.now() - holdSince.current > 800) {
          setTuned((arr) => (arr[stringIndex] ? arr : arr.map((v, i) => (i === stringIndex ? true : v))))
          markTuner()
        }
      } else holdSince.current = null
    }, 50)
    return () => clearInterval(id)
  }, [mic, markTuner])

  useEffect(() => () => mic?.stop(), [mic])

  const cents = reading ? Math.max(-50, Math.min(50, reading.cents)) : 0
  const inTune = reading && Math.abs(reading.cents) <= IN_TUNE
  const far = reading && Math.abs(reading.cents) > 50
  const shown = reading ? STRINGS[reading.stringIndex] : target === 'auto' ? null : STRINGS[target]
  const angle = (cents / 50) * 60 // ±60 de grade
  const color = !reading ? 'var(--muted)' : inTune ? 'var(--good)' : Math.abs(cents) < 20 ? 'var(--warn)' : 'var(--bad)'

  return (
    <div className="card">
      {/* alegerea corzii */}
      <div className="mb-4 grid grid-cols-7 gap-1.5">
        <button
          onClick={() => setTarget('auto')}
          className={`btn !min-h-11 !px-0 border-2 text-xs ${target === 'auto' ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}
          aria-pressed={target === 'auto'}
        >
          Auto
        </button>
        {STRINGS.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setTarget(i)
              playNote(i, 0)
            }}
            className={`btn relative !min-h-11 !px-0 border-2 ${
              target === i || (target === 'auto' && reading?.stringIndex === i) ? 'border-primary bg-primary-soft text-primary' : 'border-line'
            }`}
            aria-label={`Coarda ${s.number}, ${s.letter}`}
          >
            {s.letter}
            <span className="text-[10px] opacity-70">{s.number}</span>
            {tuned[i] && <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-good text-[10px] text-white">✓</span>}
          </button>
        ))}
      </div>

      {/* cadranul */}
      <svg viewBox="0 0 240 150" className="mx-auto w-full max-w-sm" role="img" aria-label={reading ? `Abatere ${Math.round(reading.cents)} cenți` : 'Acordor oprit'}>
        <path d="M30 128 A90 90 0 0 1 210 128" fill="none" stroke="var(--surface-2)" strokeWidth={18} strokeLinecap="round" />
        {/* zona verde */}
        <path d="M110.6 38.5 A90 90 0 0 1 129.4 38.5" fill="none" stroke="var(--good)" strokeWidth={18} />
        {Array.from({ length: 11 }, (_, k) => {
          const a = ((k - 5) / 5) * 60 * (Math.PI / 180)
          const r1 = 100
          const r2 = k === 5 ? 112 : 106
          return (
            <line key={k} x1={120 + r1 * Math.sin(a)} y1={128 - r1 * Math.cos(a)} x2={120 + r2 * Math.sin(a)} y2={128 - r2 * Math.cos(a)} stroke="var(--muted)" strokeWidth={k === 5 ? 3 : 1.5} />
          )
        })}
        <text x={22} y={146} fontSize={11} fontWeight={800} fill="var(--muted)">
          prea jos
        </text>
        <text x={218} y={146} fontSize={11} fontWeight={800} fill="var(--muted)" textAnchor="end">
          prea sus
        </text>
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '120px 128px', transition: 'transform 120ms linear' }}>
          <line x1={120} y1={128} x2={120} y2={44} stroke={color} strokeWidth={4} strokeLinecap="round" />
        </g>
        <circle cx={120} cy={128} r={8} fill={color} />
      </svg>

      <div className="mt-1 text-center" aria-live="polite">
        <div className="h-display text-5xl leading-none" style={{ color }}>
          {shown ? shown.letter : '–'}
        </div>
        <div className="mt-1 text-sm font-bold text-muted">
          {shown ? `coarda ${shown.number} · ${shown.solfege}` : 'ciupește o coardă'}
          {reading && ` · ${reading.freq.toFixed(1)} Hz`}
        </div>
        <div className="mt-2 min-h-7 text-lg font-extrabold" style={{ color }}>
          {!mic
            ? ''
            : !reading
              ? 'Ascult... ciupește o coardă'
              : far
                ? `Aud ${noteLetter(freqToMidi(reading.freq))} (${SOLFEGE[noteLetter(freqToMidi(reading.freq))]}) – ești departe de ${STRINGS[reading.stringIndex].letter}`
                : inTune
                  ? '✓ Perfect acordată!'
                  : reading.cents < 0
                    ? `Prea jos (${Math.round(reading.cents)}) – strânge coarda`
                    : `Prea sus (+${Math.round(reading.cents)}) – slăbește coarda`}
        </div>
      </div>

      {error && <p className="mt-3 rounded-xl bg-bad/10 p-3 text-sm">{error}</p>}

      <div className="mt-4 flex gap-2">
        {mic ? (
          <button className="btn-ghost flex-1" onClick={stop}>
            <Icon name="stop" size={18} /> Oprește microfonul
          </button>
        ) : (
          <button className="btn-primary flex-1" onClick={start}>
            <Icon name="mic" /> Pornește acordorul
          </button>
        )}
        <button
          className="btn-ghost"
          onClick={() => playNote(reading?.stringIndex ?? (target === 'auto' ? 0 : target), 0)}
          aria-label="Ascultă nota de referință"
          title="Nota de referință"
        >
          <Icon name="speaker" />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        Ține telefonul aproape de chitară, într-o cameră liniștită. Sunetul nu părăsește dispozitivul.
      </p>
    </div>
  )
}
