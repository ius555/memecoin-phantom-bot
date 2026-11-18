import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useProgress } from '../store/progress'

/**
 * Numără timpul petrecut pe paginile de lecții și de exersare (doar când aplicația e vizibilă).
 * După un minut de practică într-o zi, ziua intră în seria de zile consecutive (streak).
 */
export function usePracticeTracker() {
  const { pathname } = useLocation()
  const { addPracticeSeconds } = useProgress()
  const active = /^\/(curs\/.+|exersare|cantece\/.+|rutina)/.test(pathname)

  useEffect(() => {
    if (!active) return
    let acc = 0
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      acc += 5
      if (acc >= 15) {
        addPracticeSeconds(acc)
        acc = 0
      }
    }, 5000)
    return () => {
      clearInterval(id)
      if (acc > 0) addPracticeSeconds(acc)
    }
  }, [active, addPracticeSeconds])
}
