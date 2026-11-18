/**
 * Ceas muzical precis, după tehnica "lookahead" (Chris Wilson, "A Tale of Two Clocks").
 *
 * setTimeout/setInterval nu sunt precise, dar ceasul AudioContext este.
 * La fiecare 25 ms ne uităm puțin în viitor (120 ms) și programăm sunetele exact
 * pe ceasul audio. Separat, cu requestAnimationFrame, anunțăm interfața când
 * fiecare pas chiar se aude – ca animațiile să fie sincronizate cu sunetul.
 */
import { getAudio } from './context'

export interface ClockOptions {
  /** durata pasului curent, în secunde (poate varia, ex. la schimbarea tempoului) */
  stepDuration: (step: number) => number
  /** programează sunetele pasului `step` la momentul audio `time` */
  onSchedule?: (step: number, time: number) => void
  /** apelat (în firul UI) când pasul începe să se audă */
  onStep?: (step: number) => void
  /** întârziere înainte de primul pas (secunde) */
  startDelay?: number
}

export class Clock {
  private timer: number | null = null
  private raf: number | null = null
  private nextTime = 0
  private step = 0
  private queue: { step: number; time: number }[] = []
  private opts: ClockOptions

  constructor(opts: ClockOptions) {
    this.opts = opts
  }

  /** Permite schimbarea callback-urilor fără repornire. */
  setOptions(opts: Partial<ClockOptions>) {
    this.opts = { ...this.opts, ...opts }
  }

  get running() {
    return this.timer !== null
  }

  start() {
    if (this.running) return
    const { ctx } = getAudio()
    this.step = 0
    this.queue = []
    this.nextTime = ctx.currentTime + (this.opts.startDelay ?? 0.1)
    this.timer = window.setInterval(() => this.pump(), 25)
    this.pump()
    const draw = () => {
      const t = getAudio().ctx.currentTime
      while (this.queue.length && this.queue[0].time <= t) {
        const s = this.queue.shift()!
        this.opts.onStep?.(s.step)
      }
      this.raf = requestAnimationFrame(draw)
    }
    this.raf = requestAnimationFrame(draw)
  }

  stop() {
    if (this.timer !== null) clearInterval(this.timer)
    if (this.raf !== null) cancelAnimationFrame(this.raf)
    this.timer = null
    this.raf = null
    this.queue = []
  }

  private pump() {
    const { ctx } = getAudio()
    while (this.nextTime < ctx.currentTime + 0.12) {
      this.opts.onSchedule?.(this.step, this.nextTime)
      this.queue.push({ step: this.step, time: this.nextTime })
      this.nextTime += this.opts.stepDuration(this.step)
      this.step++
    }
  }
}
