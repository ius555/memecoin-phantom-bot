import { Link } from 'react-router-dom'
import { ROUTINES } from '../data/routines'
import { useSettings } from '../store/settings'
import { useProgress } from '../store/progress'
import { todayKey } from '../store/storage'
import { PageHeader } from '../components/PageHeader'
import { ProgressBar } from '../components/ProgressBar'
import { Icon } from '../components/Icon'

/** Rutina zilnică sugerată: alegi 10/20/30 de minute și bifezi exercițiile. */
export function RoutinePage() {
  const { settings, update } = useSettings()
  const { state, toggleRoutineTask } = useProgress()
  const routine = ROUTINES.find((r) => r.minutes === settings.routineMinutes) ?? ROUTINES[0]
  const done = state.routineDone[todayKey()] ?? []
  const doneCount = routine.tasks.filter((t) => done.includes(t.id)).length

  return (
    <div>
      <PageHeader back={true} title="Rutina zilnică" subtitle="Puțin, dar în fiecare zi – așa se învață chitara." />

      <div className="mb-5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Durata rutinei">
        {ROUTINES.map((r) => (
          <button
            key={r.minutes}
            role="radio"
            aria-checked={r.minutes === routine.minutes}
            onClick={() => update({ routineMinutes: r.minutes })}
            className={`btn flex-col !gap-0 border-2 !py-2 ${
              r.minutes === routine.minutes ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-surface'
            }`}
          >
            <span className="text-xl">{r.minutes} min</span>
            <span className="text-xs font-semibold opacity-80">{r.title}</span>
          </button>
        ))}
      </div>

      <div className="card mb-4">
        <div className="mb-2 flex justify-between font-bold">
          <span>Azi</span>
          <span className="text-muted">
            {doneCount}/{routine.tasks.length}
          </span>
        </div>
        <ProgressBar value={doneCount / routine.tasks.length} />
        {doneCount === routine.tasks.length && <p className="mt-3 font-bold text-good">🎉 Rutina de azi e completă! Ne vedem mâine.</p>}
      </div>

      <ol className="space-y-3">
        {routine.tasks.map((task, i) => {
          const isDone = done.includes(task.id)
          return (
            <li key={task.id} className={`card flex items-center gap-3 ${isDone ? 'border-primary/50' : ''}`}>
              <button
                onClick={() => toggleRoutineTask(task.id)}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition ${
                  isDone ? 'border-primary bg-primary text-primary-ink' : 'border-line'
                }`}
                aria-label={isDone ? `Debifează: ${task.title}` : `Bifează: ${task.title}`}
                aria-pressed={isDone}
              >
                {isDone ? <Icon name="check" strokeWidth={3} /> : <span className="font-extrabold text-muted">{i + 1}</span>}
              </button>
              <div className="min-w-0 flex-1">
                <div className={`font-bold ${isDone ? 'text-muted line-through' : ''}`}>{task.title}</div>
                <div className="text-sm text-muted">
                  {task.minutes} min · {task.description}
                </div>
              </div>
              <Link to={task.to} className="btn-ghost !min-h-11 !px-3" aria-label={`Deschide: ${task.title}`}>
                <Icon name="next" />
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
