import { shiftDay, todayKey } from './storage'

/**
 * Câte zile consecutive de practică ai, până azi.
 * Dacă n-ai exersat încă azi, dar ai exersat ieri, seria e încă "vie".
 */
export function currentStreak(days: string[], today = todayKey()): number {
  const set = new Set(days)
  let cursor = set.has(today) ? today : shiftDay(today, -1)
  let n = 0
  while (set.has(cursor)) {
    n++
    cursor = shiftDay(cursor, -1)
  }
  return n
}

/** Cea mai lungă serie din istoric. */
export function longestStreak(days: string[]): number {
  const sorted = [...new Set(days)].sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const d of sorted) {
    run = prev && shiftDay(prev, 1) === d ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return best
}
