import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Icon } from '../Icon'
import { usePracticeTracker } from '../../hooks/usePracticeTracker'

const NAV = [
  { to: '/', label: 'Acasă', icon: 'home', end: true },
  { to: '/curs', label: 'Curs', icon: 'course' },
  { to: '/exersare', label: 'Exersează', icon: 'practice' },
  { to: '/acorduri', label: 'Acorduri', icon: 'chords' },
  { to: '/profil', label: 'Profil', icon: 'user' },
]

/** Scheletul aplicației: conținutul paginii + bara de navigare de jos (pe telefon) / laterală (pe desktop). */
export function Layout() {
  const { pathname } = useLocation()
  usePracticeTracker()

  // la schimbarea paginii pornim de sus
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl md:gap-6 md:px-4">
      {/* navigare laterală pe ecrane late */}
      <nav className="sticky top-0 hidden h-dvh w-52 shrink-0 flex-col gap-1 py-6 md:flex" aria-label="Navigare principală">
        <Brand />
        <div className="mt-6 flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 font-bold transition ${
                  isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-surface-2'
                }`
              }
            >
              <Icon name={n.icon} />
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="min-w-0 flex-1 px-4 pt-4 pb-28 md:pt-8 md:pb-12">
        <Outlet />
      </main>

      {/* navigare jos pe telefon */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden"
        aria-label="Navigare principală"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${isActive ? 'text-primary' : 'text-muted'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`rounded-full px-4 py-1 transition ${isActive ? 'bg-primary-soft' : ''}`}>
                    <Icon name={n.icon} size={22} />
                  </span>
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export function Brand() {
  return (
    <div className="flex items-center gap-2 px-2">
      <img src="./icon.svg" alt="" className="h-10 w-10" />
      <div className="leading-tight">
        <div className="h-display text-lg">Chitara</div>
        <div className="text-xs font-bold tracking-wide text-wood uppercase">pas cu pas</div>
      </div>
    </div>
  )
}
