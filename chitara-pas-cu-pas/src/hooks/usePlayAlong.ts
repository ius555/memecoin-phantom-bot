/**
 * Motorul de acompaniament: cântă o secvență de acorduri cu un model de strumming
 * sau de fingerpicking, la un tempo dat, opțional în buclă și cu metronom.
 *
 * Unitatea de timp e optimea (jumătate de timp). Modelul (strum/picking) pornește
 * de la capăt la fiecare acord nou, ca atunci când cânți.
 */
import { useMemo } from 'react'
import { useClock } from './useClock'
import { strum, playNote, muteAll } from '../audio/guitar'
import { click } from '../audio/clicks'
import { emitGuitarEvent } from '../audio/events'
import { chordFrets, getChord } from '../music/chords'
import type { StrumPattern } from '../music/strumming'
import { slotStrings, type PickPattern } from '../music/fingerpicking'

export interface SeqItem {
  chord: string
  beats: number
}

export type PlayMode = { kind: 'strum'; pattern: StrumPattern } | { kind: 'pick'; pattern: PickPattern } | { kind: 'silent' }

interface Slot {
  item: number
  slot: number // optimea din interiorul acordului
}

export function usePlayAlong(opts: {
  items: SeqItem[]
  bpm: number
  mode: PlayMode
  loop?: boolean
  metronome?: boolean
  /** măsuri de numărătoare înainte de start (doar clicuri) */
  countIn?: number
  onEnd?: () => void
}) {
  const { items, bpm, mode, loop = true, metronome = false, countIn = 0 } = opts

  // întinde secvența în optimi
  const timeline = useMemo(() => {
    const t: Slot[] = []
    items.forEach((it, item) => {
      for (let s = 0; s < it.beats * 2; s++) t.push({ item, slot: s })
    })
    return t
  }, [items])

  const countInSlots = countIn * (items[0]?.beats ?? 4) * 2
  const beatsPerBar = mode.kind === 'silent' ? 4 : mode.pattern.beats

  const clock = useClock({
    stepSeconds: () => 30 / bpm,
    totalSteps: loop ? undefined : countInSlots + timeline.length,
    onEnd: () => {
      muteAll()
      opts.onEnd?.()
    },
    onSchedule: (step, time) => {
      // numărătoarea de început: doar clicuri pe timpi
      if (step < countInSlots) {
        if (step % 2 === 0) click(time, step % (beatsPerBar * 2) === 0 ? 'accent' : 'beat')
        return
      }
      if (!timeline.length) return
      const s = step - countInSlots
      const { item, slot } = timeline[s % timeline.length]
      const name = items[item].chord
      if (metronome && slot % 2 === 0) click(time, slot % (beatsPerBar * 2) === 0 ? 'accent' : 'beat')
      if (!getChord(name)) return
      if (mode.kind === 'strum') {
        const sym = mode.pattern.slots[slot % mode.pattern.slots.length]
        if (sym === '-') {
          // mâna continuă pendulul fără să atingă corzile – anunțăm doar pentru animație
          emitGuitarEvent({ type: 'strum', direction: slot % 2 === 0 ? 'down' : 'up', strings: [], when: time, spread: 0.016, ghost: true })
          return
        }
        const accent = slot % (mode.pattern.beats * 2) === 0
        strum(chordFrets(name), {
          when: time,
          direction: sym === 'D' ? 'down' : 'up',
          velocity: sym === 'D' ? (accent ? 0.95 : 0.78) : 0.55,
        })
      } else if (mode.kind === 'pick') {
        const fingers = mode.pattern.slots[slot % mode.pattern.slots.length]
        const frets = chordFrets(name)
        slotStrings(fingers, name).forEach((si) => {
          const f = frets[si]
          if (f !== null) playNote(si, f, { when: time, velocity: fingers[0] === 'p' && si === slotStrings(['p'], name)[0] ? 0.85 : 0.65 })
        })
      }
    },
  })

  // poziția curentă, pentru interfață
  const raw = clock.step
  const inCountIn = raw >= 0 && raw < countInSlots
  const pos = raw >= countInSlots && timeline.length ? timeline[(raw - countInSlots) % timeline.length] : null

  return {
    running: clock.running,
    start: clock.start,
    stop: () => {
      clock.stop()
      muteAll()
    },
    toggle: () => {
      if (clock.running) {
        clock.stop()
        muteAll()
      } else clock.start()
    },
    /** acordul care se aude acum (index în items), -1 dacă nimic */
    index: pos ? pos.item : -1,
    /** optimea din interiorul acordului curent */
    slot: pos ? pos.slot : -1,
    /** numărătoarea de început: 1, 2, 3, 4 (sau 0) */
    countInBeat: inCountIn ? Math.floor(raw / 2) % beatsPerBar + 1 : 0,
    /** pasul absolut (optimi de la start) */
    step: raw,
    countInSlots,
  }
}
