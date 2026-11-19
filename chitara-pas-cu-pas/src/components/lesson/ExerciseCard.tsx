import { useEffect, useState } from 'react'
import { Icon } from '../Icon'

/** Exercițiu practic: pași de bifat + cronometru opțional (numărătoare inversă). */
export function ExerciseCard({ title, steps, minutes }: { title: string; steps: string[]; minutes?: number }) {
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false))
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    if (left === null || left <= 0) return
    const id = setTimeout(() => setLeft((l) => (l === null ? null : l - 1)), 1000)
    return () => clearTimeout(id)
  }, [left])

  const allDone = checked.every(Boolean)
  const mm = left !== null ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : ''

  return (
    <section className="card border-l-4 border-l-accent">
      <h3 className="mb-3 flex items-center gap-2 text-lg font-extrabold">
        <span aria-hidden>🎯</span> {title}
      </h3>
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-surface-2">
              <input
                type="checkbox"
                className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--primary)]"
                checked={checked[i]}
                onChange={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
              />
              <span className={checked[i] ? 'text-muted line-through' : ''}>{s}</span>
            </label>
          </li>
        ))}
      </ol>
      {minutes && (
        <div className="mt-3 flex items-center gap-3">
          {left === null || left === 0 ? (
            <button className="btn-ghost" onClick={() => setLeft(minutes * 60)}>
              <Icon name="timer" /> {left === 0 ? 'Gata! Încă o dată' : `Pornește ${minutes} min`}
            </button>
          ) : (
            <>
              <span className="font-mono text-2xl font-bold tabular-nums">{mm}</span>
              <button className="btn-ghost" onClick={() => setLeft(null)}>
                Oprește
              </button>
            </>
          )}
        </div>
      )}
      {allDone && <p className="mt-3 font-bold text-good">✓ Exercițiu bifat. Continuă!</p>}
    </section>
  )
}
