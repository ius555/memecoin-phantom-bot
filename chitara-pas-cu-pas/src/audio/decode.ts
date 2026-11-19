/**
 * Citește un fișier audio (mp3, m4a, wav, ogg...) și îl pregătește pentru analiză:
 * decodare cu Web Audio, apoi conversie la mono, 11 025 Hz (suficient pentru acorduri și de 4× mai rapid).
 */
import { ANALYSIS_RATE } from './analysis'

export const MAX_MINUTES = 12

export async function decodeForAnalysis(file: File): Promise<{ samples: Float32Array; sampleRate: number; duration: number }> {
  const data = await file.arrayBuffer()
  const AC: typeof AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const tmp = new AC()
  let audio: AudioBuffer
  try {
    audio = await tmp.decodeAudioData(data)
  } catch {
    throw new Error('Fișierul nu a putut fi citit. Încearcă un fișier audio obișnuit (mp3, m4a, wav, ogg).')
  } finally {
    void tmp.close()
  }
  if (audio.duration > MAX_MINUTES * 60) throw new Error(`Melodia e prea lungă (maxim ${MAX_MINUTES} minute).`)
  // unele browsere (Safari mai vechi) nu acceptă 11 025 Hz în OfflineAudioContext → încercăm 22 050 și înjumătățim
  for (const rate of [ANALYSIS_RATE, ANALYSIS_RATE * 2]) {
    try {
      const off = new OfflineAudioContext(1, Math.ceil(audio.duration * rate), rate)
      const src = off.createBufferSource()
      src.buffer = audio
      src.connect(off.destination)
      src.start()
      const rendered = await off.startRendering()
      let samples = rendered.getChannelData(0)
      if (rate !== ANALYSIS_RATE) {
        const half = new Float32Array(Math.floor(samples.length / 2))
        for (let i = 0; i < half.length; i++) half[i] = (samples[2 * i] + samples[2 * i + 1]) / 2
        samples = half
      }
      return { samples, sampleRate: ANALYSIS_RATE, duration: audio.duration }
    } catch {
      /* încercăm următoarea frecvență */
    }
  }
  throw new Error('Browserul nu a putut pregăti fișierul pentru analiză.')
}
