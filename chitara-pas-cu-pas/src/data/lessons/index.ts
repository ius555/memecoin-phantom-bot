/**
 * Toate nivelurile cursului, în ordine.
 * Lecțiile se deblochează pe rând, în ordinea în care apar aici.
 */
import type { Lesson, Level } from './types'
import { level0 } from './level0'
import { level1 } from './level1'
import { level2 } from './level2'
import { level3 } from './level3'
import { level4 } from './level4'
import { level5 } from './level5'

export const LEVELS: Level[] = [level0, level1, level2, level3, level4, level5]

export interface LessonRef {
  lesson: Lesson
  level: Level
  /** numărul global al lecției (1, 2, 3 ...) */
  number: number
  /** indexul global (0-based) */
  index: number
}

/** Lista plată a tuturor lecțiilor, numerotate global. */
export const ALL_LESSONS: LessonRef[] = LEVELS.flatMap((level) => level.lessons.map((lesson) => ({ lesson, level }))).map(
  (r, index) => ({ ...r, index, number: index + 1 }),
)

export function findLesson(id: string): LessonRef | undefined {
  return ALL_LESSONS.find((r) => r.lesson.id === id)
}

/** O lecție e deblocată dacă e prima sau dacă cea dinainte e terminată. */
export function isUnlocked(id: string, completed: Record<string, unknown>): boolean {
  const ref = findLesson(id)
  if (!ref) return false
  if (ref.index === 0) return true
  return Boolean(completed[ALL_LESSONS[ref.index - 1].lesson.id])
}

/** Prima lecție neterminată (sau undefined dacă ai terminat tot). */
export function nextLesson(completed: Record<string, unknown>): LessonRef | undefined {
  return ALL_LESSONS.find((r) => !completed[r.lesson.id])
}
