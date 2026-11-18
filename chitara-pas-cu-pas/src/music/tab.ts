/**
 * Citirea unui tabulator scris în ASCII, de exemplu:
 *
 *   e|-----0---|
 *   B|---1---1-|
 *   G|-2-------|
 *   D|---------|
 *   A|3--------|
 *   E|---------|
 *
 * Rezultatul: o listă de "evenimente" (coloane) cu notele care se cântă simultan,
 * plus pozițiile barelor de măsură.
 */
export interface TabEvent {
  /** notele din coloană: string = index 0..5 (0 = coarda 6) */
  notes: { string: number; fret: number }[]
  /** dacă înaintea acestei coloane e o bară de măsură */
  barBefore: boolean
}

export function parseTab(src: string): TabEvent[] {
  const lines = src
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length !== 6) throw new Error('Un tab trebuie să aibă exact 6 rânduri')
  // eliminăm eticheta (ex. "e|") de la început
  const rows = lines.map((l) => l.replace(/^[a-gA-G]#?\|?/, ''))
  const len = Math.max(...rows.map((r) => r.length))
  const events = new Map<number, TabEvent>()
  const bars = new Set<number>()

  rows.forEach((row, r) => {
    const stringIndex = 5 - r // primul rând = coarda 1 (e) = index 5
    for (let i = 0; i < len; i++) {
      const ch = row[i]
      if (ch === '|') bars.add(i)
      if (ch && /\d/.test(ch) && !/\d/.test(row[i - 1] ?? '')) {
        let j = i
        while (/\d/.test(row[j] ?? '')) j++
        const fret = Number(row.slice(i, j))
        const ev = events.get(i) ?? { notes: [], barBefore: false }
        ev.notes.push({ string: stringIndex, fret })
        events.set(i, ev)
      }
    }
  })

  const cols = [...events.keys()].sort((a, b) => a - b)
  let lastCol = -1
  return cols.map((col) => {
    const ev = events.get(col)!
    ev.barBefore = [...bars].some((b) => b > lastCol && b < col)
    lastCol = col
    return ev
  })
}
