/**
 * Citire/scriere sigură în localStorage.
 * În modul privat sau cu stocarea blocată, accesul poate arunca excepții –
 * aplicația trebuie să meargă oricum (doar că nu ține minte progresul).
 */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) } as T
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* stocare indisponibilă – ignorăm */
  }
}

/** Data de azi în format YYYY-MM-DD, după ora locală. */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Adaugă (sau scade) zile la o cheie de dată. */
export function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + delta)
  return todayKey(date)
}
