import { useState } from 'react'
import type { QuizQuestion } from '../data/lessons/types'
import { feedbackTone } from '../audio/clicks'
import { ChordDiagram } from './ChordDiagram'
import { Icon } from './Icon'

/**
 * Mini-testul de la finalul unei lecții.
 * Trece testul cine răspunde corect la cel puțin 2/3 din întrebări.
 */
export function Quiz({ questions, onFinish }: { questions: QuizQuestion[]; onFinish: (score: number) => void }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[index]
  const passNeeded = Math.ceil((questions.length * 2) / 3)

  function choose(i: number) {
    if (picked !== null) return
    setPicked(i)
    const ok = i === q.answer
    feedbackTone(ok)
    if (ok) setCorrect((c) => c + 1)
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setPicked(null)
    } else {
      setDone(true)
      onFinish(correct / questions.length)
    }
  }

  function restart() {
    setIndex(0)
    setPicked(null)
    setCorrect(0)
    setDone(false)
  }

  if (done) {
    const passed = correct >= passNeeded
    return (
      <div className="text-center">
        <div className="text-5xl" aria-hidden>
          {passed ? (correct === questions.length ? '🏅' : '🎉') : '💪'}
        </div>
        <p className="mt-2 text-xl font-extrabold">
          {correct} din {questions.length} corecte
        </p>
        <p className="mt-1 text-muted">
          {passed ? 'Bravo! Ai trecut testul.' : `Ai nevoie de cel puțin ${passNeeded} răspunsuri corecte. Mai încearcă!`}
        </p>
        {!passed && (
          <button className="btn-primary mt-4" onClick={restart}>
            <Icon name="repeat" /> Reia testul
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-muted">
        <span>
          Întrebarea {index + 1} / {questions.length}
        </span>
        <span className="flex gap-1" aria-hidden>
          {questions.map((_, i) => (
            <span key={i} className={`h-2 w-6 rounded-full ${i < index ? 'bg-primary' : i === index ? 'bg-wood' : 'bg-surface-2'}`} />
          ))}
        </span>
      </div>
      <p className="mb-3 text-lg font-bold">{q.q}</p>
      {q.chord && (
        <div className="mx-auto mb-3 w-40">
          <ChordDiagram chord={q.chord} hideName />
        </div>
      )}
      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          const state =
            picked === null ? 'idle' : i === q.answer ? 'right' : i === picked ? 'wrong' : 'dim'
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={`flex min-h-12 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-semibold transition ${
                state === 'right'
                  ? 'border-good bg-good/10'
                  : state === 'wrong'
                    ? 'border-bad bg-bad/10'
                    : state === 'dim'
                      ? 'border-line opacity-60'
                      : 'border-line bg-surface hover:border-primary active:scale-[0.99]'
              }`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-extrabold">
                {state === 'right' ? '✓' : state === 'wrong' ? '✗' : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <div className="mt-4">
          {q.explain && (
            <p className={`rounded-xl p-3 text-sm ${picked === q.answer ? 'bg-good/10' : 'bg-bad/10'}`}>
              <strong>{picked === q.answer ? 'Corect! ' : 'Nu chiar. '}</strong>
              {q.explain}
            </p>
          )}
          <button className="btn-primary mt-3 w-full" onClick={next}>
            {index + 1 < questions.length ? 'Următoarea întrebare' : 'Vezi rezultatul'}
          </button>
        </div>
      )}
    </div>
  )
}
