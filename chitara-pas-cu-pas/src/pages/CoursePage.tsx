import { Link } from 'react-router-dom'
import { ALL_LESSONS, LEVELS, LEVEL_COLORS, isUnlocked, nextLesson } from '../data/lessons'
import { useProgress } from '../store/progress'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import { ProgressBar } from '../components/ProgressBar'

/** Harta cursului: nivelurile și lecțiile lor, cu starea fiecăreia (terminată / deschisă / blocată). */
export function CoursePage() {
  const { state } = useProgress()
  const done = state.completedLessons
  const next = nextLesson(done)
  const total = ALL_LESSONS.length
  const doneCount = ALL_LESSONS.filter((r) => done[r.lesson.id]).length

  return (
    <div>
      <PageHeader title="Cursul de chitară" subtitle={`${doneCount} din ${total} lecții terminate`} />
      <ProgressBar value={doneCount / total} className="mb-6" />

      <div className="space-y-8">
        {LEVELS.map((level) => {
          const levelDone = level.lessons.filter((l) => done[l.id]).length
          const complete = levelDone === level.lessons.length
          return (
            <section key={level.id} aria-labelledby={`${level.id}-t`}>
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl shadow-md ${complete ? 'ring-4 ring-good/40' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${LEVEL_COLORS[level.number]}, ${LEVEL_COLORS[level.number]}bb)` }}
                  aria-hidden
                >
                  {level.icon}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-extrabold tracking-wider uppercase" style={{ color: LEVEL_COLORS[level.number] }}>
                    Nivelul {level.number}
                  </div>
                  <h2 id={`${level.id}-t`} className="h-display text-xl leading-tight">
                    {level.title}
                  </h2>
                </div>
                <span className="chip">
                  {levelDone}/{level.lessons.length}
                </span>
              </div>

              <ol className="relative ml-6 space-y-2 border-l-2 border-dashed border-line pl-6">
                {level.lessons.map((lesson) => {
                  const ref = ALL_LESSONS.find((r) => r.lesson.id === lesson.id)!
                  const isDone = Boolean(done[lesson.id])
                  const open = isUnlocked(lesson.id, done)
                  const isNext = next?.lesson.id === lesson.id
                  const dot = isDone || isNext ? 'text-white' : 'bg-surface-2 text-muted'
                  const dotStyle = isDone ? { background: LEVEL_COLORS[level.number] } : isNext ? { background: 'var(--primary)' } : undefined
                  const content = (
                    <>
                      <span
                        className={`absolute -left-[39px] grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold ring-4 ring-bg ${dot}`}
                        style={dotStyle}
                      >
                        {isDone ? <Icon name="check" size={16} strokeWidth={3} /> : ref.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold">{lesson.title}</div>
                        <div className="truncate text-sm text-muted">{lesson.summary}</div>
                      </div>
                      {open ? (
                        <span className="chip shrink-0">{lesson.minutes} min</span>
                      ) : (
                        <Icon name="lock" className="shrink-0 text-muted" />
                      )}
                    </>
                  )
                  return (
                    <li key={lesson.id} className="relative">
                      {open ? (
                        <Link
                          to={`/curs/${lesson.id}`}
                          className={`card flex items-center gap-3 !py-3 transition hover:border-primary ${
                            isNext ? 'border-primary ring-2 ring-primary/30' : ''
                          }`}
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className="card flex items-center gap-3 !py-3 opacity-60" aria-disabled>
                          {content}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>
    </div>
  )
}
