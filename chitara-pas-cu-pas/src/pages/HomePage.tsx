import { Link } from 'react-router-dom'
import { ALL_LESSONS, nextLesson } from '../data/lessons'
import { playerLevel, useProgress } from '../store/progress'
import { currentStreak } from '../store/streak'
import { todayKey } from '../store/storage'
import { Icon } from '../components/Icon'
import { ProgressBar } from '../components/ProgressBar'
import { Brand } from '../components/layout/Layout'
import { TIPS } from '../data/tips'
import { ROUTINES } from '../data/routines'
import { useSettings } from '../store/settings'

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Bună dimineața'
  if (h < 18) return 'Bună ziua'
  return 'Bună seara'
}

/** Ecranul principal: seria de zile, XP, lecția următoare, rutina de azi, unelte rapide. */
export function HomePage() {
  const { state } = useProgress()
  const { settings } = useSettings()
  const next = nextLesson(state.completedLessons)
  const streak = currentStreak(state.practiceDays)
  const lvl = playerLevel(state.xp)
  const doneCount = Object.keys(state.completedLessons).length
  const practicedToday = state.practiceDays.includes(todayKey())
  const routine = ROUTINES.find((r) => r.minutes === settings.routineMinutes) ?? ROUTINES[0]
  const routineDone = (state.routineDone[todayKey()] ?? []).filter((id) => routine.tasks.some((t) => t.id === id)).length
  // sfatul zilei se schimbă în fiecare zi
  const tip = TIPS[new Date().getDate() % TIPS.length]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between md:hidden">
        <Brand />
      </div>

      <div>
        <p className="font-bold text-muted">{greeting()}!</p>
        <h1 className="h-display text-3xl leading-tight">
          {doneCount === 0 ? 'Hai să începem să cântăm.' : practicedToday ? 'Ai exersat azi. Bravo!' : 'Gata de exersat?'}
        </h1>
      </div>

      {/* statistici */}
      <div className="grid grid-cols-3 gap-3">
        <Stat icon="🔥" value={streak} label={streak === 1 ? 'zi la rând' : 'zile la rând'} highlight={practicedToday} />
        <Stat icon="⭐" value={state.xp} label="XP" />
        <Stat icon="🎓" value={`${doneCount}/${ALL_LESSONS.length}`} label="lecții" />
      </div>

      <div className="card">
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span>Nivel de chitarist {lvl.level}</span>
          <span className="text-muted">
            {lvl.into}/{lvl.need} XP
          </span>
        </div>
        <ProgressBar value={lvl.into / lvl.need} color="bg-wood" />
      </div>

      {/* lecția următoare */}
      {next ? (
        <Link
          to={`/curs/${next.lesson.id}`}
          className="card block overflow-hidden !border-0 !bg-primary !p-0 text-primary-ink transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-4 p-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl" aria-hidden>
              {next.level.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold tracking-wider uppercase opacity-80">
                {doneCount === 0 ? 'Începe cursul' : 'Continuă'} · Lecția {next.number}
              </div>
              <div className="h-display text-xl leading-tight">{next.lesson.title}</div>
              <div className="mt-0.5 truncate text-sm opacity-85">{next.lesson.summary}</div>
            </div>
            <Icon name="next" size={28} />
          </div>
        </Link>
      ) : (
        <div className="card text-center">
          <div className="text-4xl">🎓</div>
          <p className="mt-2 font-bold">Ai terminat tot cursul! Acum exersează cântece și progresii.</p>
        </div>
      )}

      {/* rutina de azi */}
      <Link to="/rutina" className="card flex items-center gap-4 transition hover:border-primary">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-wood-soft text-2xl" aria-hidden>
          🗓️
        </div>
        <div className="flex-1">
          <div className="font-bold">Rutina de azi · {routine.minutes} minute</div>
          <ProgressBar value={routineDone / routine.tasks.length} className="mt-2 !h-2" />
          <div className="mt-1 text-sm text-muted">
            {routineDone}/{routine.tasks.length} exerciții făcute
          </div>
        </div>
        <Icon name="next" className="text-muted" />
      </Link>

      {/* unelte rapide */}
      <div>
        <h2 className="mb-3 text-lg font-extrabold">Unelte rapide</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Quick to="/exersare/acordor" icon="🎚️" label="Acordor" />
          <Quick to="/exersare/metronom" icon="⏱️" label="Metronom" />
          <Quick to="/acorduri" icon="🎼" label="Acorduri" />
          <Quick to="/cantece" icon="🎶" label="Cântece" />
        </div>
      </div>

      {/* sfatul zilei */}
      <Link to="/sfaturi" className="card flex gap-3 border-dashed transition hover:border-primary">
        <span className="text-2xl" aria-hidden>
          💡
        </span>
        <div>
          <div className="text-xs font-extrabold tracking-wider text-wood uppercase">Sfatul zilei</div>
          <div className="font-bold">{tip.title}</div>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{tip.items[0]}</p>
        </div>
      </Link>
    </div>
  )
}

function Stat({ icon, value, label, highlight }: { icon: string; value: number | string; label: string; highlight?: boolean }) {
  return (
    <div className={`card !p-3 text-center ${highlight ? 'border-wood bg-wood-soft' : ''}`}>
      <div className="text-xl" aria-hidden>
        {icon}
      </div>
      <div className="text-2xl font-extrabold tabular-nums">{value}</div>
      <div className="text-xs font-bold text-muted">{label}</div>
    </div>
  )
}

function Quick({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link to={to} className="card flex flex-col items-center gap-1 !py-4 font-bold transition hover:border-primary active:scale-[0.97]">
      <span className="text-3xl" aria-hidden>
        {icon}
      </span>
      {label}
    </Link>
  )
}
