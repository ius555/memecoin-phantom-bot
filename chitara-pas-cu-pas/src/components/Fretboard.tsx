/**
 * Grif orizontal în SVG (ca în tabulator: coarda 1 – Mi acut – sus, coarda 6 jos).
 * Poate evidenția poziții (cu numărul degetului și culoare) și se poate atinge pentru a cânta note.
 * În modul stângaci, grifurile se oglindesc (prăguşul în dreapta).
 */
import { useState } from 'react'
import { useSettings } from '../store/settings'
import { playNote } from '../audio/guitar'
import { STRINGS, NOTE_NAMES, midiAt } from '../music/theory'
import { FINGER_COLORS } from './ChordDiagram'

export interface FretMark {
  /** indexul corzii: 0 = coarda 6 (Mi grav) ... 5 = coarda 1 */
  string: number
  fret: number
  finger?: number
  label?: string
  /** culoare personalizată (implicit: culoarea degetului) */
  color?: string
  /** marcaj "fantomă" (mai estompat) */
  ghost?: boolean
}

interface Props {
  marks?: FretMark[]
  /** prima și ultima tastă afișată */
  from?: number
  to?: number
  /** atingi grif → se cântă nota */
  interactive?: boolean
  /** evidențiază aceste corzi (restul estompate) */
  focusStrings?: number[]
  /** marcaje animate (apar pe rând) */
  animate?: boolean
  onPick?: (string: number, fret: number) => void
}

const ROW = 22
const TOP = 16
const LEFT = 30

export function Fretboard({ marks = [], from = 0, to = 12, interactive = true, focusStrings, animate, onPick }: Props) {
  const { settings } = useSettings()
  const [hit, setHit] = useState<{ s: number; f: number; k: number } | null>(null)
  const lefty = settings.leftHanded
  const showOpen = from === 0
  const firstFret = Math.max(1, from)
  const count = to - firstFret + 1
  const FW = count > 8 ? 44 : 54 // lățimea unei taste
  const width = LEFT + (showOpen ? 26 : 8) + count * FW + 12
  const height = TOP * 2 + ROW * 5 + 14
  const x0 = LEFT + (showOpen ? 26 : 8) // unde începe prima tastă desenată
  // coordonata x a centrului unei taste (0 = coarda liberă)
  const fx = (f: number) => (f === 0 ? LEFT + 8 : x0 + (f - firstFret + 0.5) * FW)
  // y pentru coarda i (0 = coarda 6, desenată jos)
  const sy = (i: number) => TOP + (5 - i) * ROW
  const mirror = (x: number) => (lefty ? width - x : x)

  function pick(s: number, f: number) {
    if (!interactive) return
    playNote(s, f)
    setHit({ s, f, k: Date.now() })
    onPick?.(s, f)
  }

  const inlays = [3, 5, 7, 9, 15, 17].filter((f) => f >= firstFret && f <= to)

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: Math.min(width, 640) }}
        className="w-full select-none"
        role="img"
        aria-label="Grif de chitară"
      >
        <rect x={mirror(x0) - (lefty ? count * FW : 0)} y={TOP - 6} width={count * FW} height={ROW * 5 + 12} rx={4} fill="var(--fretboard)" />
        {/* semnele de pe grif */}
        {inlays.map((f) => (
          <circle key={f} cx={mirror(fx(f))} cy={TOP + ROW * 2.5} r={4.5} fill="var(--fret)" opacity={0.5} />
        ))}
        {to >= 12 && firstFret <= 12 && (
          <>
            <circle cx={mirror(fx(12))} cy={TOP + ROW * 1.5} r={4.5} fill="var(--fret)" opacity={0.5} />
            <circle cx={mirror(fx(12))} cy={TOP + ROW * 3.5} r={4.5} fill="var(--fret)" opacity={0.5} />
          </>
        )}
        {/* barele tastelor */}
        {Array.from({ length: count + 1 }, (_, k) => {
          const x = mirror(x0 + k * FW)
          const isNut = k === 0 && firstFret === 1
          return <line key={k} x1={x} x2={x} y1={TOP - 6} y2={TOP + ROW * 5 + 6} stroke={isNut ? 'var(--ink)' : 'var(--fret)'} strokeWidth={isNut ? 5 : 2} />
        })}
        {/* numerele tastelor */}
        {Array.from({ length: count }, (_, k) => (
          <text key={k} x={mirror(fx(firstFret + k))} y={height - 2} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--muted)">
            {firstFret + k}
          </text>
        ))}
        {/* corzile + numele lor */}
        {STRINGS.map((st, i) => {
          const dim = focusStrings && !focusStrings.includes(i)
          return (
            <g key={i} opacity={dim ? 0.35 : 1}>
              <line
                key={hit && hit.s === i ? hit.k : 0}
                className={hit && hit.s === i ? 'string-vibrate' : ''}
                x1={mirror(LEFT)}
                x2={mirror(x0 + count * FW)}
                y1={sy(i)}
                y2={sy(i)}
                stroke="var(--string)"
                strokeWidth={2.6 - i * 0.32}
              />
              <text x={mirror(12)} y={sy(i) + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="var(--muted)">
                {i === 5 ? 'e' : st.letter}
              </text>
            </g>
          )
        })}
        {/* zone de atingere (invizibile) pentru fiecare coardă × tastă */}
        {interactive &&
          STRINGS.map((_, i) =>
            Array.from({ length: count + (showOpen ? 1 : 0) }, (_, k) => {
              const f = showOpen ? k : firstFret + k
              const cx = mirror(fx(f))
              const w = f === 0 ? 26 : FW
              return (
                <rect
                  key={`${i}-${f}`}
                  x={cx - w / 2}
                  y={sy(i) - ROW / 2}
                  width={w}
                  height={ROW}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => pick(i, f)}
                >
                  <title>
                    Coarda {6 - i}, tasta {f}: {NOTE_NAMES[midiAt(i, f) % 12]}
                  </title>
                </rect>
              )
            }),
          )}
        {/* marcajele */}
        {marks.map((m, k) => {
          const color = m.color ?? (m.finger ? FINGER_COLORS[m.finger] : 'var(--accent)')
          return (
            <g
              key={`${m.string}-${m.fret}-${k}`}
              className={animate ? 'finger-pop' : ''}
              style={{ animationDelay: animate ? `${k * 90}ms` : undefined, pointerEvents: 'none' }}
              opacity={m.ghost ? 0.4 : 1}
            >
              {m.fret === 0 ? (
                <circle cx={mirror(fx(0))} cy={sy(m.string)} r={8} fill="var(--surface)" stroke={color} strokeWidth={2.5} />
              ) : (
                <circle cx={mirror(fx(m.fret))} cy={sy(m.string)} r={9.5} fill={color} />
              )}
              <text
                x={mirror(fx(m.fret))}
                y={sy(m.string) + 4}
                textAnchor="middle"
                fontSize={m.label && m.label.length > 1 ? 8.5 : 11}
                fontWeight={800}
                fill={m.fret === 0 ? 'var(--ink)' : '#fff'}
              >
                {m.label ?? m.finger ?? ''}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
