/**
 * Accesul la microfon. Dezactivăm prelucrările telefonului (anulare ecou, reducere zgomot,
 * control automat al volumului) – ele strică semnalul pentru acordor și recunoașterea acordurilor.
 */
import { getAudio } from './context'

export interface MicHandle {
  analyser: AnalyserNode
  stop: () => void
}

export async function openMic(fftSize = 4096): Promise<MicHandle> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Browserul nu permite accesul la microfon (încearcă Chrome sau Safari, pe https).')
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  })
  const { ctx } = getAudio()
  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = fftSize
  analyser.smoothingTimeConstant = 0
  source.connect(analyser)
  return {
    analyser,
    stop: () => {
      source.disconnect()
      stream.getTracks().forEach((t) => t.stop())
    },
  }
}

/** Mesaj prietenos pentru erorile de microfon. */
export function micErrorMessage(e: unknown): string {
  const name = (e as { name?: string })?.name
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Nu ai permis accesul la microfon. Permite-l din setările browserului (iconița de lângă adresă) și încearcă din nou.'
  if (name === 'NotFoundError') return 'Nu am găsit niciun microfon pe acest dispozitiv.'
  return (e as Error)?.message || 'Microfonul nu a putut fi pornit.'
}
