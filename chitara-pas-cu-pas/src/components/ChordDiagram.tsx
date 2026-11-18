/**
 * Diagrama unui acord, desenată în SVG.
 *
 * - corzile sunt verticale (coarda 6 în stânga; în modul stângaci, în dreapta)
 * - degetele apar pe rând, animat, cu numerele 1–4 în culori diferite
 * - "o" deasupra = coardă liberă, "×" = coardă care nu se cântă
 * - atingi diagrama → auzi acordul
 */
import { useState } from 'react'
import { type Chord, type ChordShape, chordFullName, findBarres, getChord, shapeNotes } from '../music/chords'
import { strum, arpeggio } from '../audio/guitar'
import { useSettings } from '../store/settings'
import { Icon } from './Icon'

export const FINGER_COLORS = ['var(--fT)', 'var(--f1)', 'var(--f2)', 'var(--f3)', 'var(--f4)']
export const FINGER_NAMES = ['', 'arătătorul', 'mijlociul', 'inelarul', 'degetul mic']

interface Props {
  chord: string | Chord
  /** ce variantă (poziție) să afișeze */
  shapeIndex?: number
  /** se poate atinge pentru sunet + butoane de redare */
  playable?: boolean
  hideName?: boolean
  /** afișează notele sub fiecare coardă */
  showNotes?: boolean
  /** fără animație (ex. în liste lungi) */
  still?: boolean
  className?: string
  /** lățimea maximă în pixeli */
  maxWidth?: number
  /** evidențiază o zonă a diagramei (folosit în lecția despre citirea diagramelor) */
  highlight?: 'strings' | 'frets' | 'dots' | 'top'
}

const W = 132
const LEFT = 22
const GAP = 17.6 // distanța dintre corzi
const TOP = 34
const FRET_H = 22

export function ChordDiagram({ chord, shapeIndex = 0, playable, hideName, showNotes, still, className = '', maxWidth = 180, highlight }: Props) {
  const ch = typeof chord === 'string' ? getChord(chord) : chord
  const { settings } = useSettings()
  // la fiecare redare creștem cheia ca animațiile să repornească
  const [playKey, setPlayKey] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  if (!ch) return <div className="text-center text-bad">Acord necunoscut: {String(chord)}</div>
  const s: ChordShape = ch.shapes[Math.min(shapeIndex, ch.shapes.length - 1)]

  const fretted = s.frets.filter((f): f is number => f !== null && f > 0)
  const maxF = fretted.length ? Math.max(...fretted) : 0
  const minF = fretted.length ? Math.min(...fretted) : 1
  // de la ce tastă începe desenul (pentru acordurile mai sus pe grif)
  const base = maxF <= 4 ? 1 : minF
  const rows = Math.max(4, maxF - base + 1)
  const H = TOP + rows * FRET_H + (showNotes ? 30 : 12)
  const lefty = settings.leftHanded
  // poziția x a corzii i (0 = coarda 6)
  const sx = (i: number) => LEFT + (lefty ? 5 - i : i) * GAP
  const fy = (fret: number) => TOP + (fret - base + 0.5) * FRET_H
  const barres = findBarres(s)
  const barreFingers = new Set(barres.map((b) => b.finger))
  const notes = shapeNotes(s)

  // ordinea în care apar degetele: după numărul degetului
  const dots = s.frets
    .map((f, i) => ({ i, f, finger: s.fingers[i] }))
    .filter((d) => d.f !== null && d.f > 0 && !barreFingers.has(d.finger))
  const order = (finger: number) => (still ? 0 : finger * 160)

  function HighlightBox({ kind }: { kind: NonNullable<Props['highlight']> }) {
    let x1 = LEFT - 9
    let x2 = LEFT + GAP * 5 + 9
    let y1 = TOP - 2
    let y2 = TOP + rows * FRET_H + 2
    if (kind === 'frets') {
      y1 = TOP - 9
      y2 = TOP + FRET_H * 2 + 4
    } else if (kind === 'top') {
      y1 = TOP - 23
      y2 = TOP - 2
    } else if (kind === 'dots') {
      const xs = dots.map((d) => sx(d.i))
      const ys = dots.map((d) => fy(d.f as number))
      x1 = Math.min(...xs) - 11
      x2 = Math.max(...xs) + 11
      y1 = Math.min(...ys) - 11
      y2 = Math.max(...ys) + 11
    }
    return <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx={7} fill="none" stroke="var(--wood)" strokeWidth={3} strokeDasharray="6 4" />
  }

  function play(mode: 'strum' | 'arp' = 'strum') {
    if (mode === 'strum') strum(s.frets)
    else arpeggio(s.frets, 0.16)
    setPlayKey((k) => k + 1)
  }

  const svg = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full select-none"
      role="img"
      aria-label={`Diagrama acordului ${ch.name} (${chordFullName(ch)}): ${describe(s)}`}
      key={animKey}
    >
      {/* fundalul grifului */}
      <rect x={LEFT - 6} y={TOP} width={GAP * 5 + 12} height={rows * FRET_H} rx={3} fill="var(--fretboard)" />
      {/* tastele (barele orizontale) */}
      {Array.from({ length: rows + 1 }, (_, r) => (
        <line key={r} x1={LEFT} x2={LEFT + GAP * 5} y1={TOP + r * FRET_H} y2={TOP + r * FRET_H} stroke="var(--fret)" strokeWidth={1.5} />
      ))}
      {/* nut-ul (prăguşul) sau numărul tastei de start */}
      {base === 1 ? (
        <rect x={LEFT - 1.5} y={TOP - 5} width={GAP * 5 + 3} height={5} rx={1.5} fill="var(--ink)" />
      ) : (
        <text x={lefty ? LEFT + GAP * 5 + 8 : LEFT - 9} y={fy(base) + 4} textAnchor={lefty ? 'start' : 'end'} fontSize={10} fontWeight={800} fill="var(--muted)">
          {base}
        </text>
      )}
      {/* corzile (verticale); cele groase sunt mai late */}
      {s.frets.map((_, i) => (
        <line
          key={`${i}-${playKey}`}
          className={playKey && s.frets[i] !== null ? 'string-vibrate' : ''}
          style={{ animationDelay: `${i * 16}ms` }}
          x1={sx(i)}
          x2={sx(i)}
          y1={TOP}
          y2={TOP + rows * FRET_H}
          stroke="var(--string)"
          strokeWidth={2.2 - i * 0.28}
          opacity={s.frets[i] === null ? 0.45 : 1}
        />
      ))}
      {/* o / × deasupra */}
      {s.frets.map((f, i) =>
        f === 0 ? (
          <circle key={i} cx={sx(i)} cy={TOP - 13} r={4.6} fill="none" stroke="var(--ink)" strokeWidth={1.6} />
        ) : f === null ? (
          <g key={i} stroke="var(--bad)" strokeWidth={1.8} strokeLinecap="round">
            <line x1={sx(i) - 4} x2={sx(i) + 4} y1={TOP - 17} y2={TOP - 9} />
            <line x1={sx(i) + 4} x2={sx(i) - 4} y1={TOP - 17} y2={TOP - 9} />
          </g>
        ) : null,
      )}
      {/* barré-urile */}
      {barres.map((b) => {
        const x1 = Math.min(sx(b.from), sx(b.to))
        const x2 = Math.max(sx(b.from), sx(b.to))
        return (
          <g key={`b${b.finger}`} className={still ? '' : 'finger-pop'} style={{ animationDelay: `${order(b.finger)}ms` }}>
            <rect x={x1 - 7} y={fy(b.fret) - 7} width={x2 - x1 + 14} height={14} rx={7} fill={FINGER_COLORS[b.finger]} />
            <text x={(x1 + x2) / 2} y={fy(b.fret) + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff">
              {b.finger}
            </text>
          </g>
        )
      })}
      {/* degetele */}
      {dots.map((d) => (
        <g key={d.i} className={still ? '' : 'finger-pop'} style={{ animationDelay: `${order(d.finger)}ms` }}>
          <circle cx={sx(d.i)} cy={fy(d.f as number)} r={7.4} fill={FINGER_COLORS[d.finger] ?? 'var(--ink)'} />
          <text x={sx(d.i)} y={fy(d.f as number) + 3.8} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#fff">
            {d.finger || ''}
          </text>
        </g>
      ))}
      {/* zona evidențiată */}
      {highlight && <HighlightBox kind={highlight} />}
      {/* notele sub corzi */}
      {showNotes &&
        notes.map((n, i) => (
          <text key={i} x={sx(i)} y={TOP + rows * FRET_H + 18} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="var(--muted)">
            {n ?? ''}
          </text>
        ))}
    </svg>
  )

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {!hideName && (
        <div className="text-center">
          <div className="h-display text-2xl leading-none">{ch.name}</div>
          <div className="mt-0.5 text-xs font-bold text-muted">{chordFullName(ch)}</div>
        </div>
      )}
      {playable ? (
        <>
          <button
            onClick={() => play('strum')}
            className="w-full rounded-xl transition active:scale-95"
            style={{ maxWidth }}
            aria-label={`Ascultă acordul ${ch.name}`}
          >
            {svg}
          </button>
          <div className="mt-1 flex gap-1">
            <button className="btn-ghost !min-h-10 !px-3 !py-1 text-sm" onClick={() => play('strum')} aria-label="Ascultă (strum)">
              <Icon name="play" size={16} />
            </button>
            <button className="btn-ghost !min-h-10 !px-3 !py-1 text-sm" onClick={() => play('arp')} aria-label="Ascultă coardă cu coardă">
              1·2·3
            </button>
            {!still && (
              <button className="btn-ghost !min-h-10 !px-3 !py-1 text-sm" onClick={() => setAnimKey((k) => k + 1)} aria-label="Arată din nou degetele">
                <Icon name="repeat" size={16} />
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="w-full" style={{ maxWidth }}>
          {svg}
        </div>
      )}
    </div>
  )
}

/** Descriere textuală pentru cititoare de ecran. */
function describe(s: ChordShape): string {
  return s.frets
    .map((f, i) => {
      const str = `coarda ${6 - i}`
      if (f === null) return `${str} nu se cântă`
      if (f === 0) return `${str} liberă`
      return `${str} tasta ${f} cu ${FINGER_NAMES[s.fingers[i]] || 'degetul'}`
    })
    .join(', ')
}

/** Legenda culorilor degetelor. */
export function FingerLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-semibold text-muted">
      {[1, 2, 3, 4].map((f) => (
        <span key={f} className="flex items-center gap-1.5">
          <span className="grid h-5 w-5 place-items-center rounded-full text-[11px] font-extrabold text-white" style={{ background: FINGER_COLORS[f] }}>
            {f}
          </span>
          {FINGER_NAMES[f]}
        </span>
      ))}
    </div>
  )
}
