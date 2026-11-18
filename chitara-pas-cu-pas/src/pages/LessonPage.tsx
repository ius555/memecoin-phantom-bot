import { Link, Navigate, useParams } from 'react-router-dom'
import { ALL_LESSONS, findLesson, isUnlocked } from '../data/lessons'
import { useProgress } from '../store/progress'
import { PageHeader } from '../components/PageHeader'
import { LessonBlockView } from '../components/lesson/LessonBlockView'
import { Quiz } from '../components/Quiz'
import { Icon } from '../components/Icon'
import { useState } from 'react'

/** O lecție: blocurile de conținut, apoi mini-testul. Testul trecut → lecția următoare se deblochează. */
export function LessonPage() {
  const { lessonId = '' } = useParams()
  const ref = findLesson(lessonId)
  const { state, completeLesson } = useProgress()
  const [quizKey, setQuizKey] = useState(0)
  const [justPassed, setJustPassed] = useState(false)

  if (!ref) return <Navigate to="/curs" replace />
  if (!isUnlocked(lessonId, state.completedLessons)) {
    return (
      <div className="py-16 text-center">
        <div className="text-5xl">🔒</div>
        <h1 className="h-display mt-3 text-2xl">Lecția e încă blocată</h1>
        <p className="mt-2 text-muted">Termină lecția dinainte ca să ajungi aici.</p>
        <Link to="/curs" className="btn-primary mt-6">
          Înapoi la curs
        </Link>
      </div>
    )
  }

  const { lesson, level, number, index } = ref
  const next = ALL_LESSONS[index + 1]
  const done = state.completedLessons[lesson.id]

  function onFinish(score: number) {
    const passed = score >= 2 / 3 - 1e-9
    if (passed) {
      completeLesson(lesson.id, score)
      setJustPassed(true)
    }
  }

  return (
    <article key={lesson.id}>
      <PageHeader
        back="/curs"
        title={lesson.title}
        subtitle={
          <span className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold text-wood">
              Nivelul {level.number} · Lecția {number}
            </span>
            <span>· {lesson.minutes} min</span>
            {done && <span className="chip !bg-primary-soft !text-primary">✓ Terminată</span>}
          </span>
        }
      />

      <div className="space-y-5">
        {lesson.blocks.map((block, i) => (
          <LessonBlockView key={i} block={block} />
        ))}
      </div>

      <section className="card mt-8 border-2 border-wood/40" aria-labelledby="quiz-t">
        <h2 id="quiz-t" className="h-display mb-4 flex items-center gap-2 text-xl">
          <span aria-hidden>📝</span> Mini-test
        </h2>
        <Quiz key={quizKey} questions={lesson.quiz} onFinish={onFinish} />
        {(justPassed || done) && (
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {next ? (
              <Link to={`/curs/${next.lesson.id}`} className="btn-primary flex-1">
                Lecția următoare: {next.lesson.title} <Icon name="next" />
              </Link>
            ) : (
              <Link to="/profil" className="btn-primary flex-1">
                🎓 Ai terminat cursul! Vezi insignele
              </Link>
            )}
            {done && !justPassed && (
              <button className="btn-ghost" onClick={() => setQuizKey((k) => k + 1)}>
                <Icon name="repeat" /> Reia testul
              </button>
            )}
          </div>
        )}
      </section>
    </article>
  )
}
