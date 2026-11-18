/** Forma datelor de progres salvate în localStorage. */
export interface ProgressState {
  /** lecții terminate: id → { data, scor la test (0..1) } */
  completedLessons: Record<string, { date: string; score: number }>
  xp: number
  /** zilele în care s-a exersat (YYYY-MM-DD), sortate */
  practiceDays: string[]
  /** minute de practică pe zi */
  practiceSeconds: Record<string, number>
  /** insigne câștigate: id → data */
  badges: Record<string, string>
  /** rezultate one-minute change */
  oneMinute: { pair: string; count: number; date: string }[]
  /** cel mai bun scor în joc, pe progresie */
  gameBest: Record<string, number>
  /** statistici test de auz */
  ear: { correct: number; total: number }
  /** sarcinile din rutina zilnică bifate: data → id-uri */
  routineDone: Record<string, string[]>
  songsPracticed: string[]
  usedTuner: boolean
}

export const EMPTY_PROGRESS: ProgressState = {
  completedLessons: {},
  xp: 0,
  practiceDays: [],
  practiceSeconds: {},
  badges: {},
  oneMinute: [],
  gameBest: {},
  ear: { correct: 0, total: 0 },
  routineDone: {},
  songsPracticed: [],
  usedTuner: false,
}
