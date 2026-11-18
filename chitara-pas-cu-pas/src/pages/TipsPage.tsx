import { useState } from 'react'
import { TIPS } from '../data/tips'
import { PageHeader } from '../components/PageHeader'

/** Sfaturi pentru probleme frecvente, ca listă de secțiuni care se deschid. */
export function TipsPage() {
  const [open, setOpen] = useState<string | null>(TIPS[0].id)
  return (
    <div>
      <PageHeader back={true} title="Sfaturi utile" subtitle="Soluții pentru problemele pe care le are orice începător." />
      <div className="space-y-3">
        {TIPS.map((tip) => {
          const isOpen = open === tip.id
          return (
            <section key={tip.id} className="card !p-0">
              <button
                className="flex w-full items-center gap-3 p-4 text-left"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : tip.id)}
              >
                <span className="text-2xl" aria-hidden>
                  {tip.icon}
                </span>
                <span className="flex-1 text-lg font-bold">{tip.title}</span>
                <span className={`text-2xl text-muted transition ${isOpen ? 'rotate-45' : ''}`} aria-hidden>
                  +
                </span>
              </button>
              {isOpen && (
                <ul className="space-y-2 px-4 pb-4">
                  {tip.items.map((it, i) => (
                    <li key={i} className="flex gap-3 leading-relaxed">
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      {it}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
