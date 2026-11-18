import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

const TOOLS = [
  { to: '/rutina', icon: '🗓️', title: 'Rutina zilnică', text: '10, 20 sau 30 de minute, gata planificate' },
  { to: '/exersare/acordor', icon: '🎚️', title: 'Acordor', text: 'Acordează chitara cu microfonul' },
  { to: '/exersare/metronom', icon: '⏱️', title: 'Metronom', text: 'Tempo, accente și numărătoare' },
  { to: '/exersare/schimbari', icon: '⚡', title: 'One-minute change', text: 'Câte schimbări faci într-un minut?' },
  { to: '/exersare/progresii', icon: '🔁', title: 'Editor de progresii', text: 'Construiește-ți secvența și ascult-o în buclă' },
  { to: '/exersare/joc', icon: '🎯', title: 'Jocul schimbărilor', text: 'Schimbă acordul la timp și adună puncte' },
  { to: '/exersare/auz', icon: '👂', title: 'Test de auz', text: 'Ce acord ai auzit?' },
  { to: '/exersare/recunoastere', icon: '🎤', title: 'Verifică acordul', text: 'Cântă un acord, aplicația îți spune dacă e corect' },
  { to: '/cantece', icon: '🎶', title: 'Cântece', text: 'Cântece populare și compoziții originale' },
  { to: '/sfaturi', icon: '💡', title: 'Sfaturi', text: 'Degete care dor, corzi care bâzâie...' },
]

/** Centrul de exersare: toate uneltele, într-o grilă de carduri mari. */
export function PracticePage() {
  return (
    <div>
      <PageHeader title="Exersează" subtitle="Unelte pentru practica de zi cu zi." />
      <div className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="card flex items-center gap-4 transition hover:border-primary active:scale-[0.99]">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-wood-soft text-3xl" aria-hidden>
              {t.icon}
            </span>
            <span>
              <span className="block text-lg font-bold">{t.title}</span>
              <span className="block text-sm text-muted">{t.text}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
