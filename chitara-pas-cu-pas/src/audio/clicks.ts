/** Sunetul de metronom: un "tic" scurt, mai înalt pe primul timp al măsurii. */
import { getAudio } from './context'

export type ClickKind = 'accent' | 'beat' | 'sub'

export function click(time: number, kind: ClickKind = 'beat') {
  const { ctx, out } = getAudio()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = kind === 'sub' ? 'triangle' : 'square'
  osc.frequency.value = kind === 'accent' ? 1760 : kind === 'beat' ? 1180 : 880
  const peak = kind === 'accent' ? 0.35 : kind === 'beat' ? 0.22 : 0.1
  gain.gain.setValueAtTime(0, time)
  gain.gain.linearRampToValueAtTime(peak, time + 0.001)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
  osc.connect(gain).connect(out)
  osc.start(time)
  osc.stop(time + 0.06)
}

/** Sunet de "corect" / "greșit" pentru exerciții și jocuri. */
export function feedbackTone(ok: boolean) {
  const { ctx, out } = getAudio()
  const t = ctx.currentTime
  const notes = ok ? [880, 1320] : [330, 247]
  notes.forEach((f, i) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = f
    g.gain.setValueAtTime(0, t + i * 0.09)
    g.gain.linearRampToValueAtTime(0.18, t + i * 0.09 + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.18)
    osc.connect(g).connect(out)
    osc.start(t + i * 0.09)
    osc.stop(t + i * 0.09 + 0.2)
  })
}
