/**
 * Citirea textelor cu acorduri, așa cum se găsesc pe site-urile de acorduri:
 *
 *   C           G
 *   Hai să dăm mână cu mână          ← acordurile pe rândul de deasupra versului
 *
 * sau cu acordurile în text:  "[C]Hai să dăm [G]mână cu mână".
 * Rezultatul e în formatul cântecelor din aplicație (src/music/songs.ts), deci se afișează și se cântă la fel.
 */
import { getChord } from './chords'
import type { Song } from './songs'

const TOKEN = /^\(?([A-H])([#b]?)(maj7|maj|min|m7|m|sus2|sus4|add9|dim7|dim|aug|7|6|9|5|11|13)?(\/[A-H][#b]?)?\)?$/

/** Transformă un acord scris oricum (Hm, Cmaj, Asus4, D/F#, Bdim) într-un acord din bibliotecă. */
export function normalizeChord(token: string): string | null {
  const m = token.trim().match(TOKEN)
  if (!m) return null
  const root = (m[1] === 'H' ? 'B' : m[1]) + m[2]
  const q = m[3] ?? ''
  const candidates: string[] = []
  if (q === 'm' || q === 'min') candidates.push(root + 'm')
  else if (q === 'maj') candidates.push(root)
  else if (q === 'dim' || q === 'dim7') candidates.push(root + 'm')
  else if (q === '6' || q === '9' || q === '11' || q === '13' || q === '5' || q === 'aug') candidates.push(root + (q === '9' || q === '13' ? '7' : ''), root)
  else candidates.push(root + q, root + (q.startsWith('m') && q !== 'maj7' ? 'm' : ''), root)
  for (const c of candidates) {
    const ch = getChord(c)
    if (ch) return ch.name
  }
  return null
}

/** Un rând care conține numai acorduri (și spații). */
export function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter((t) => t && t !== '|' && t !== '-' && t !== '/')
  return tokens.length > 0 && tokens.every((t) => TOKEN.test(t))
}

/** Pune acordurile de pe rândul de sus în versul de dedesubt, la aceeași coloană: "[C]Hai să...". */
function mergeChordLine(chords: string, lyric: string): string {
  const marks: { col: number; chord: string }[] = []
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(chords))) {
    const name = normalizeChord(m[0])
    if (name) marks.push({ col: m.index, chord: name })
  }
  let out = lyric.padEnd(Math.max(lyric.length, (marks[marks.length - 1]?.col ?? 0) + 1), ' ')
  for (const mk of [...marks].reverse()) out = out.slice(0, mk.col) + `[${mk.chord}]` + out.slice(mk.col)
  return out.replace(/\s+$/, '')
}

/** Citește un text cu acorduri și întoarce un cântec. */
export function parseChordSheet(text: string, title = 'Melodia mea'): Song {
  const lines = text.replace(/\r/g, '').split('\n')
  const sections: Song['sections'] = []
  let current: Song['sections'][number] = { name: 'Melodia', lines: [] }
  const push = () => {
    if (current.lines.length) sections.push(current)
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) continue
    // titluri de secțiune: "Refren:", "[Strofa 2]", "Verse 1"
    const header = trimmed.match(/^\[?((?:strofa|refren|refrenul|verse|chorus|bridge|intro|outro|pod|final)[^\]:]*)\]?:?$/i)
    if (header) {
      push()
      current = { name: header[1].trim().replace(/^./, (c) => c.toUpperCase()), lines: [] }
      continue
    }
    // „Intro: Am F C G” – o etichetă urmată numai de acorduri
    const labeled = trimmed.match(/^(intro|outro|interludiu|solo|final|pod|bridge)\s*:\s*(.+)$/i)
    if (labeled && isChordLine(labeled[2])) {
      push()
      current = { name: labeled[1].replace(/^./, (c) => c.toUpperCase()), lines: [mergeChordLine(labeled[2], '')] }
      continue
    }
    // acorduri scrise direct în text: [C]Hai să dăm...
    if (/\[[A-H][^\]]*\]/.test(line)) {
      current.lines.push(line.replace(/\[([^\]]+)\]/g, (_, c) => (normalizeChord(c) ? `[${normalizeChord(c)}]` : '')).trim())
      continue
    }
    if (isChordLine(line)) {
      const next = lines[i + 1]
      if (next !== undefined && next.trim() && !isChordLine(next)) {
        current.lines.push(mergeChordLine(line, next))
        i++
      } else {
        // rând doar cu acorduri (ex. intro): îl păstrăm ca atare
        current.lines.push(mergeChordLine(line, ''))
      }
      continue
    }
    current.lines.push(trimmed)
  }
  push()
  return { id: 'import', title, origin: 'Importat de tine', level: 2, bpm: 80, strum: 'jos-4', beatsPerChord: 4, sections }
}
