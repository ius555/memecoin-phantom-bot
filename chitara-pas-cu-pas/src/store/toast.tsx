import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

/** Mesaje scurte care apar sus (ex. „+50 XP”, „Insignă nouă!”). */
export interface Toast {
  id: number
  icon: string
  title: string
  text?: string
}

const ToastContext = createContext<(t: Omit<Toast, 'id'>) => void>(() => {})

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = nextId++
    setToasts((list) => [...list, { ...t, id }])
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 3200)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="finger-pop pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-lg"
          >
            <span className="text-2xl" aria-hidden>
              {t.icon}
            </span>
            <div>
              <div className="font-bold">{t.title}</div>
              {t.text && <div className="text-sm text-muted">{t.text}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
