import { Link } from 'react-router-dom'
import { useState } from 'react'
import { playerLevel, useProgress } from '../store/progress'
import { useSettings, type ThemeChoice } from '../store/settings'
import { currentStreak, longestStreak } from '../store/streak'
import { BADGES } from '../data/badges'
import { PageHeader } from '../components/PageHeader'
import { ProgressBar } from '../components/ProgressBar'
import { Icon } from '../components/Icon'
import { todayKey, shiftDay } from '../store/storage'

/** Profil: nivel, statistici, calendarul practicii, insigne și setări. */
export function ProfilePage() {
  const { state, reset } = useProgress()
  const { settings, update } = useSettings()
  const [confirmReset, setConfirmReset] = useState(false)
  const lvl = playerLevel(state.xp)
  const totalMinutes = Math.round(Object.values(state.practiceSeconds).reduce((a, b) => a + b, 0) / 60)

  // ultimele 28 de zile, pentru calendarul de practică
  const today = todayKey()
  const days = Array.from({ length: 28 }, (_, i) => shiftDay(today, i - 27))
  const practiced = new Set(state.practiceDays)

  return (
    <div className="space-y-6">
      <PageHeader title="Profilul meu" subtitle="Progresul tău e salvat pe acest dispozitiv." />

      <section className="card">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent text-2xl font-extrabold text-white dark:text-[#0c2a2a]">
            {lvl.level}
          </div>
          <div className="flex-1">
            <div className="font-extrabold">Chitarist de nivel {lvl.level}</div>
            <ProgressBar value={lvl.into / lvl.need} color="bg-accent" className="mt-2" />
            <div className="mt-1 text-sm text-muted">
              {state.xp} XP în total · încă {lvl.need - lvl.into} XP până la nivelul {lvl.level + 1}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <MiniStat value={currentStreak(state.practiceDays)} label="serie actuală" />
          <MiniStat value={longestStreak(state.practiceDays)} label="cea mai lungă" />
          <MiniStat value={totalMinutes} label="minute exersate" />
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-extrabold">Ultimele 4 săptămâni</h2>
        <div className="grid grid-cols-7 gap-1.5" role="list" aria-label="Zile de practică">
          {days.map((d) => (
            <div
              role="listitem"
              key={d}
              title={d}
              aria-label={`${d}${practiced.has(d) ? ': ai exersat' : ''}`}
              className={`aspect-square rounded-lg ${practiced.has(d) ? 'bg-primary' : 'bg-surface-2'} ${
                d === today ? 'ring-2 ring-accent' : ''
              }`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">
          Insigne ({Object.keys(state.badges).length}/{BADGES.length})
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {BADGES.map((b) => {
            const got = state.badges[b.id]
            return (
              <div key={b.id} className={`card !p-3 text-center ${got ? 'border-accent' : 'opacity-50 grayscale'}`} title={b.description}>
                <div className="text-3xl" aria-hidden>
                  {b.icon}
                </div>
                <div className="mt-1 text-sm leading-tight font-bold">{b.name}</div>
                <div className="mt-1 text-[11px] leading-tight text-muted">{got ? `câștigată ${got}` : b.description}</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="card space-y-5" aria-labelledby="settings-t">
        <h2 id="settings-t" className="flex items-center gap-2 text-lg font-extrabold">
          <Icon name="gear" /> Setări
        </h2>

        <div>
          <div className="mb-2 font-bold">Temă</div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['light', 'Deschisă', 'sun'],
                ['dark', 'Întunecată', 'moon'],
                ['system', 'Automată', 'gear'],
              ] as [ThemeChoice, string, string][]
            ).map(([v, label, icon]) => (
              <button
                key={v}
                onClick={() => update({ theme: v })}
                className={`btn !px-2 border-2 ${settings.theme === v ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}
                aria-pressed={settings.theme === v}
              >
                <Icon name={icon} size={18} /> {label}
              </button>
            ))}
          </div>
        </div>

        <Toggle
          label="Mod pentru stângaci"
          description="Diagramele de acorduri și grifurile se afișează în oglindă."
          checked={settings.leftHanded}
          onChange={(v) => update({ leftHanded: v })}
        />
        <Toggle
          label="Numele notelor pe grif"
          description="Arată numele notelor (E, A, D...) lângă corzi."
          checked={settings.showNoteNames}
          onChange={(v) => update({ showNoteNames: v })}
        />

        <label className="block">
          <div className="mb-2 flex justify-between font-bold">
            <span>Volum</span>
            <span className="text-muted">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            onChange={(e) => update({ volume: Number(e.target.value) })}
            className="w-full accent-[var(--primary)]"
          />
        </label>

        <div>
          <div className="mb-2 font-bold">Rutina zilnică preferată</div>
          <div className="grid grid-cols-3 gap-2">
            {([10, 20, 30] as const).map((m) => (
              <button
                key={m}
                onClick={() => update({ routineMinutes: m })}
                className={`btn border-2 ${settings.routineMinutes === m ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}
                aria-pressed={settings.routineMinutes === m}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>
      </section>

      <Link to="/sfaturi" className="card flex items-center gap-3 transition hover:border-primary">
        <Icon name="bulb" /> <span className="flex-1 font-bold">Sfaturi pentru probleme frecvente</span> <Icon name="next" />
      </Link>

      <section className="card border-bad/30">
        <h2 className="font-extrabold">Resetează progresul</h2>
        <p className="mt-1 text-sm text-muted">Șterge lecțiile terminate, XP-ul, seria și insignele de pe acest dispozitiv.</p>
        {confirmReset ? (
          <div className="mt-3 flex gap-2">
            <button
              className="btn flex-1 bg-bad text-white"
              onClick={() => {
                reset()
                setConfirmReset(false)
              }}
            >
              Da, șterge tot
            </button>
            <button className="btn-ghost flex-1" onClick={() => setConfirmReset(false)}>
              Anulează
            </button>
          </div>
        ) : (
          <button className="btn-ghost mt-3 text-bad" onClick={() => setConfirmReset(true)}>
            <Icon name="trash" /> Resetează
          </button>
        )}
      </section>

      <p className="pb-4 text-center text-xs text-muted">Chitara Pas cu Pas · v1.0 · funcționează și offline</p>
    </div>
  )
}

function MiniStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-2">
      <div className="text-xl font-extrabold tabular-nums">{value}</div>
      <div className="text-xs font-bold text-muted">{label}</div>
    </div>
  )
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-4">
      <div className="flex-1">
        <div className="font-bold">{label}</div>
        {description && <div className="text-sm text-muted">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition ${checked ? 'bg-primary' : 'bg-line'}`}
      >
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </label>
  )
}
