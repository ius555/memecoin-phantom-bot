import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadJSON, saveJSON } from './storage'
import { setMasterVolume } from '../audio/context'

export type ThemeChoice = 'system' | 'light' | 'dark'

export interface Settings {
  theme: ThemeChoice
  /** Mod pentru stângaci: diagramele și grifurile se oglindesc. */
  leftHanded: boolean
  /** Volum general 0..1 */
  volume: number
  /** Afișează numele notelor pe grif */
  showNoteNames: boolean
  /** Durata rutinei zilnice preferate (minute) */
  routineMinutes: 10 | 20 | 30
  /** Cum se afișează acordurile: diagramă 2D sau simulator 3D */
  chordView: '2d' | '3d'
}

const KEY = 'cpp.settings'
const DEFAULTS: Settings = {
  theme: 'system',
  leftHanded: false,
  volume: 0.8,
  showNoteNames: true,
  routineMinutes: 10,
  chordView: '2d',
}

interface Ctx {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  isDark: boolean
}

const SettingsContext = createContext<Ctx | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadJSON(KEY, DEFAULTS))
  const [systemDark, setSystemDark] = useState(
    () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches,
  )

  // urmărim tema sistemului
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && systemDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#1b1713' : '#3f6b4a')
  }, [isDark])

  useEffect(() => {
    saveJSON(KEY, settings)
    setMasterVolume(settings.volume)
  }, [settings])

  const value = useMemo<Ctx>(
    () => ({ settings, isDark, update: (patch) => setSettings((s) => ({ ...s, ...patch })) }),
    [settings, isDark],
  )
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings în afara SettingsProvider')
  return ctx
}
