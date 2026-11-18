import { useEffect, useRef, useState } from 'react'
import { Clock } from '../audio/scheduler'

/**
 * Hook React peste ceasul audio precis (audio/scheduler.ts).
 * - `stepSeconds`: durata unui pas (citită mereu actualizat, deci tempoul se poate schimba din mers)
 * - `onSchedule(step, time)`: programează sunetele pasului
 * - `step`: pasul care se aude acum (pentru animații), -1 când e oprit
 */
export function useClock(opts: {
  stepSeconds: (step: number) => number
  onSchedule: (step: number, time: number) => void
  /** oprește automat după acest număr de pași */
  totalSteps?: number
  onEnd?: () => void
}) {
  const optsRef = useRef(opts)
  optsRef.current = opts
  const clockRef = useRef<Clock | null>(null)
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(-1)

  function stop() {
    clockRef.current?.stop()
    clockRef.current = null
    setRunning(false)
    setStep(-1)
  }

  function start() {
    stop()
    const clock = new Clock({
      stepDuration: (s) => optsRef.current.stepSeconds(s),
      onSchedule: (s, t) => {
        const total = optsRef.current.totalSteps
        if (total === undefined || s < total) optsRef.current.onSchedule(s, t)
      },
      onStep: (s) => {
        const total = optsRef.current.totalSteps
        if (total !== undefined && s >= total) {
          stop()
          optsRef.current.onEnd?.()
          return
        }
        setStep(s)
      },
    })
    clockRef.current = clock
    clock.start()
    setRunning(true)
  }

  // oprim ceasul când componenta dispare
  useEffect(() => () => clockRef.current?.stop(), [])

  return { running, step, start, stop, toggle: () => (clockRef.current ? stop() : start()) }
}
