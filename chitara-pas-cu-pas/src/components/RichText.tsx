import type { ReactNode } from 'react'

/**
 * Formatare minimă pentru textele lecțiilor (ca să le poți scrie ușor în fișierele de date):
 * - paragrafe separate prin rând gol
 * - linii care încep cu "- " devin listă
 * - **text** devine bold
 */
export function RichText({ text }: { text: string }) {
  const paragraphs = text.trim().split(/\n\s*\n/)
  return (
    <div className="prose-lesson">
      {paragraphs.map((p, i) => {
        const lines = p.split('\n')
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={i} className="mb-3 space-y-1.5 pl-1">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wood" aria-hidden />
                  <span>{inline(l.trim().slice(2))}</span>
                </li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{inline(p)}</p>
      })}
    </div>
  )
}

function inline(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') ? (
      <strong key={i} className="font-extrabold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  )
}
