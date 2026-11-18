import { Link, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

/** Antetul unei pagini: buton înapoi (opțional), titlu, subtitlu și acțiuni în dreapta. */
export function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: ReactNode
  subtitle?: ReactNode
  /** ruta pentru „înapoi”; true = istoric */
  back?: string | true
  right?: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <header className="mb-5 flex items-start gap-3">
      {back &&
        (back === true ? (
          <button onClick={() => navigate(-1)} className="btn-ghost !min-h-11 !px-3" aria-label="Înapoi">
            <Icon name="back" />
          </button>
        ) : (
          <Link to={back} className="btn-ghost !min-h-11 !px-3" aria-label="Înapoi">
            <Icon name="back" />
          </Link>
        ))}
      <div className="min-w-0 flex-1">
        <h1 className="h-display text-2xl leading-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}
