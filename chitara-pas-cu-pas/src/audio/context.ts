/**
 * Un singur AudioContext pentru toată aplicația.
 *
 * Browserele (mai ales pe telefon) pornesc audio doar după o atingere a utilizatorului,
 * de aceea contextul se creează "leneș" și se reia (resume) la fiecare redare.
 * Lanțul de ieșire: surse → master (volum) → compresor → difuzoare.
 */
let ctx: AudioContext | null = null
let master: GainNode | null = null
let volume = 0.8

export function getAudio(): { ctx: AudioContext; out: GainNode } {
  if (!ctx) {
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC({ latencyHint: 'interactive' })
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.knee.value = 12
    comp.ratio.value = 4
    comp.attack.value = 0.003
    comp.release.value = 0.2
    master = ctx.createGain()
    master.gain.value = volume
    master.connect(comp)
    comp.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { ctx, out: master! }
}

/** Timpul curent al ceasului audio (în secunde). */
export function now(): number {
  return getAudio().ctx.currentTime
}

export function setMasterVolume(v: number) {
  volume = Math.max(0, Math.min(1, v))
  if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.02)
}

/** Deblochează audio la prima interacțiune (necesar pe iOS). */
export function installAudioUnlock() {
  const unlock = () => {
    getAudio()
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { once: false })
  window.addEventListener('keydown', unlock, { once: false })
}
