/**
 * Exercițiul 1-2-3-4 (cromatic): fiecare deget pe tasta lui, pe rând, pe fiecare coardă.
 * Generează tabulatorul în funcție de variantă și de poziția pe grif.
 */
import { useMemo, useState } from 'react'
import { TabView } from '../TabView'

type Variant = 'una' | 'urcare' | 'dus-intors'

function buildTab(variant: Variant, start: number): string {
  // coloanele: listă de [indexCoardă, tasta]
  const cols: [number, number][] = []
  const fr = [start, start + 1, start + 2, start + 3]
  if (variant === 'una') {
    for (let r = 0; r < 2; r++) fr.forEach((f) => cols.push([0, f]))
  } else {
    for (let s = 0; s < 6; s++) fr.forEach((f) => cols.push([s, f]))
    if (variant === 'dus-intors') for (let s = 5; s >= 0; s--) [...fr].reverse().forEach((f) => cols.push([s, f]))
  }
  const w = start + 3 >= 10 ? 4 : 3
  const lines = ['e', 'B', 'G', 'D', 'A', 'E'].map((label, r) => {
    const si = 5 - r
    let line = `${label}|`
    cols.forEach(([s, f], i) => {
      if (i > 0 && i % 4 === 0) line += '|'
      const cell = s === si ? String(f) : ''
      line += '-' + cell.padEnd(w - 1, '-')
    })
    return line + '|'
  })
  return lines.join('\n')
}

export function Chromatic() {
  const [variant, setVariant] = useState<Variant>('una')
  const [start, setStart] = useState(5)
  const tab = useMemo(() => buildTab(variant, start), [variant, start])
  return (
    <div className="space-y-3">
      <div className="card space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ['una', 'O coardă'],
              ['urcare', 'Toate corzile'],
              ['dus-intors', 'Dus-întors'],
            ] as [Variant, string][]
          ).map(([v, l]) => (
            <button key={v} onClick={() => setVariant(v)} className={`btn !min-h-11 !px-1 border-2 text-sm ${variant === v ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[5, 1].map((f) => (
            <button key={f} onClick={() => setStart(f)} className={`btn !min-h-11 border-2 text-sm ${start === f ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}>
              {f === 5 ? 'Tastele 5–8 (mai ușor)' : 'Tastele 1–4'}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">
          Degetul 1 pe tasta {start}, degetul 2 pe tasta {start + 1}, degetul 3 pe {start + 2}, degetul 4 pe {start + 3}. Un deget pe tastă!
        </p>
      </div>
      <TabView key={tab} tab={tab} bpm={60} title="Exercițiul 1-2-3-4" />
    </div>
  )
}
