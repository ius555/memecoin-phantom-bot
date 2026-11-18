import { useEffect, useRef, useState } from 'react'
import { openMic, micErrorMessage, type MicHandle } from '../audio/mic'
import { chromaFromSpectrum } from '../audio/chroma'

/**
 * Ascultă microfonul și ține la zi o chromagramă netezită (ultimele ~0,5 s).
 * `level` = cât de tare e sunetul (0..1), ca să știm când chiar cânți ceva.
 */
export function useChordListener() {
  const [mic, setMic] = useState<MicHandle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chroma, setChroma] = useState<Float32Array>(() => new Float32Array(12))
  const [level, setLevel] = useState(0)
  const chromaRef = useRef(chroma)
  const levelRef = useRef(0)

  async function start() {
    setError(null)
    try {
      setMic(await openMic(8192))
    } catch (e) {
      setError(micErrorMessage(e))
    }
  }

  function stop() {
    mic?.stop()
    setMic(null)
    setLevel(0)
  }

  useEffect(() => {
    if (!mic) return
    const { analyser } = mic
    const db = new Float32Array(analyser.frequencyBinCount)
    const time = new Float32Array(analyser.fftSize)
    const sr = analyser.context.sampleRate
    let smooth = new Float32Array(12)
    const id = window.setInterval(() => {
      analyser.getFloatTimeDomainData(time)
      let rms = 0
      for (let i = 0; i < time.length; i++) rms += time[i] * time[i]
      rms = Math.sqrt(rms / time.length)
      const lvl = Math.min(1, rms * 8)
      levelRef.current = lvl
      setLevel(lvl)
      if (rms < 0.006) return
      analyser.getFloatFrequencyData(db)
      const c = chromaFromSpectrum(db, sr, analyser.fftSize)
      // netezire exponențială
      const next = new Float32Array(12)
      for (let i = 0; i < 12; i++) next[i] = smooth[i] * 0.55 + c[i] * 0.45
      const max = Math.max(...next)
      if (max > 0) for (let i = 0; i < 12; i++) next[i] /= max
      smooth = next
      chromaRef.current = next
      setChroma(next)
    }, 100)
    return () => clearInterval(id)
  }, [mic])

  useEffect(() => () => mic?.stop(), [mic])

  return { active: !!mic, start, stop, error, chroma, level, chromaRef, levelRef }
}
