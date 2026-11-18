/**
 * Progresul utilizatorului: lecții, XP, zile de practică (streak), insigne, statistici.
 * Totul se salvează automat în localStorage (cheia "cpp.progress").
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { loadJSON, saveJSON, todayKey } from './storage'
import { EMPTY_PROGRESS, type ProgressState } from './progressTypes'
import { BADGES } from '../data/badges'
import { useToast } from './toast'

const KEY = 'cpp.progress'

/** Câte XP primești pentru fiecare acțiune */
export const XP = {
  lesson: 50,
  perfectQuiz: 25,
  oneMinute: 10,
  earCorrect: 2,
  song: 15,
  routineTask: 5,
}

interface Ctx {
  state: ProgressState
  completeLesson: (id: string, score: number) => void
  addXp: (n: number, reason?: string) => void
  addPracticeSeconds: (s: number) => void
  recordOneMinute: (pair: string, count: number) => void
  recordGame: (key: string, score: number) => boolean
  recordEar: (correct: boolean) => void
  toggleRoutineTask: (taskId: string) => void
  markSong: (id: string) => void
  markTuner: () => void
  reset: () => void
}

const ProgressContext = createContext<Ctx | null>(null)

/** Adaugă ziua de azi în lista zilelor de practică (dacă nu e deja). */
function withToday(s: ProgressState): ProgressState {
  const t = todayKey()
  if (s.practiceDays.includes(t)) return s
  return { ...s, practiceDays: [...s.practiceDays, t].sort() }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => loadJSON(KEY, EMPTY_PROGRESS))
  const toast = useToast()
  const first = useRef(true)
  // copie mereu actuală a stării, pentru calcule în afara lui setState
  const stateRef = useRef(state)
  stateRef.current = state

  // salvare + verificarea insignelor noi la fiecare schimbare
  useEffect(() => {
    saveJSON(KEY, state)
    const fresh = BADGES.filter((b) => !state.badges[b.id] && b.check(state))
    if (fresh.length) {
      const today = todayKey()
      setState((s) => ({ ...s, badges: { ...s.badges, ...Object.fromEntries(fresh.map((b) => [b.id, today])) } }))
      // la prima încărcare nu arătăm notificări pentru insigne vechi
      if (!first.current) fresh.forEach((b) => toast({ icon: b.icon, title: 'Insignă nouă!', text: b.name }))
    }
    first.current = false
  }, [state, toast])

  const addXp = useCallback(
    (n: number, reason?: string) => {
      setState((s) => withToday({ ...s, xp: s.xp + n }))
      toast({ icon: '✨', title: `+${n} XP`, text: reason })
    },
    [toast],
  )

  const completeLesson = useCallback(
    (id: string, score: number) => {
      const prev = stateRef.current.completedLessons[id]
      // XP doar la prima terminare (+ bonus pentru test perfect, o singură dată)
      const gained = (prev ? 0 : XP.lesson) + (score === 1 && (!prev || prev.score < 1) ? XP.perfectQuiz : 0)
      setState((s) => {
        const best = Math.max(score, s.completedLessons[id]?.score ?? 0)
        return withToday({
          ...s,
          xp: s.xp + gained,
          completedLessons: { ...s.completedLessons, [id]: { date: todayKey(), score: best } },
        })
      })
      if (gained) toast({ icon: '🎉', title: `Lecție terminată! +${gained} XP` })
    },
    [toast],
  )

  const addPracticeSeconds = useCallback((sec: number) => {
    setState((s) => {
      const t = todayKey()
      const total = (s.practiceSeconds[t] ?? 0) + sec
      const next = { ...s, practiceSeconds: { ...s.practiceSeconds, [t]: total } }
      // o zi contează pentru streak după cel puțin un minut de practică
      return total >= 60 ? withToday(next) : next
    })
  }, [])

  const recordOneMinute = useCallback(
    (pair: string, count: number) => {
      setState((s) => withToday({ ...s, xp: s.xp + XP.oneMinute, oneMinute: [...s.oneMinute, { pair, count, date: todayKey() }] }))
      toast({ icon: '⏱️', title: `${count} schimbări! +${XP.oneMinute} XP` })
    },
    [toast],
  )

  const recordGame = useCallback((key: string, score: number) => {
    const isRecord = score > (stateRef.current.gameBest[key] ?? 0)
    setState((s) =>
      withToday({
        ...s,
        xp: s.xp + Math.round(score / 50),
        gameBest: score > (s.gameBest[key] ?? 0) ? { ...s.gameBest, [key]: score } : s.gameBest,
      }),
    )
    return isRecord
  }, [])

  const recordEar = useCallback((correct: boolean) => {
    setState((s) =>
      withToday({
        ...s,
        xp: s.xp + (correct ? XP.earCorrect : 0),
        ear: { correct: s.ear.correct + (correct ? 1 : 0), total: s.ear.total + 1 },
      }),
    )
  }, [])

  const toggleRoutineTask = useCallback((taskId: string) => {
    setState((s) => {
      const t = todayKey()
      const done = s.routineDone[t] ?? []
      const has = done.includes(taskId)
      return withToday({
        ...s,
        xp: s.xp + (has ? -XP.routineTask : XP.routineTask),
        routineDone: { ...s.routineDone, [t]: has ? done.filter((x) => x !== taskId) : [...done, taskId] },
      })
    })
  }, [])

  const markSong = useCallback(
    (id: string) => {
      setState((s) =>
        s.songsPracticed.includes(id)
          ? withToday(s)
          : withToday({ ...s, xp: s.xp + XP.song, songsPracticed: [...s.songsPracticed, id] }),
      )
    },
    [],
  )

  const markTuner = useCallback(() => setState((s) => (s.usedTuner ? s : { ...s, usedTuner: true })), [])

  const reset = useCallback(() => setState(EMPTY_PROGRESS), [])

  const value = useMemo<Ctx>(
    () => ({
      state,
      completeLesson,
      addXp,
      addPracticeSeconds,
      recordOneMinute,
      recordGame,
      recordEar,
      toggleRoutineTask,
      markSong,
      markTuner,
      reset,
    }),
    [state, completeLesson, addXp, addPracticeSeconds, recordOneMinute, recordGame, recordEar, toggleRoutineTask, markSong, markTuner, reset],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress în afara ProgressProvider')
  return ctx
}

/** Nivelul jucătorului calculat din XP (fiecare nivel cere puțin mai mult). */
export function playerLevel(xp: number) {
  let level = 1
  let need = 100
  let rest = xp
  while (rest >= need) {
    rest -= need
    level++
    need = Math.round(need * 1.25)
  }
  return { level, into: rest, need }
}
