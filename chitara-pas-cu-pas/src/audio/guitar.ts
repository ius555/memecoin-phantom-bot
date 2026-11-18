/**
 * Sunet de chitară acustică prin sinteză Karplus-Strong (Web Audio API, fără fișiere audio).
 *
 * Algoritmul: o rafală scurtă de zgomot (= ciupirea corzii) intră într-o buclă de întârziere
 * cu lungimea unei perioade; la fiecare trecere semnalul e mediat (filtru trece-jos),
 * deci armonicele înalte se sting mai repede – exact ca la o coardă reală.
 *
 * Bufferele se generează o singură dată pentru fiecare frecvență și se păstrează în cache.
 */
import { getAudio } from './context'
import { midiAt, midiToFreq } from '../music/theory'

const cache = new Map<string, { buffer: AudioBuffer; rate: number }>()

/**
 * Generează eșantioanele unei coarde ciupite (funcție pură, testabilă fără browser).
 * Returnează datele și `rate` = playbackRate-ul care corectează înălțimea exactă.
 */
export function synthPluck(sr: number, freq: number, bright = 0.5, random: () => number = Math.random) {
  const period = Math.max(2, Math.floor(sr / freq))
  // corzile grave țin mai mult decât cele acute
  const t60 = 1.6 + 2.4 * Math.max(0, Math.min(1, (400 - freq) / 320))
  const duration = Math.min(4.5, t60 + 0.4)
  const length = Math.floor(sr * duration)
  const data = new Float32Array(length)

  // excitația: zgomot alb, netezit în funcție de "bright" (pană moale vs. pană tare)
  let prev = 0
  const smooth = 0.15 + (1 - bright) * 0.6
  for (let i = 0; i < period; i++) {
    const noise = random() * 2 - 1
    prev = prev * smooth + noise * (1 - smooth)
    data[i] = prev
  }
  // eliminăm componenta continuă din excitație
  let mean = 0
  for (let i = 0; i < period; i++) mean += data[i]
  mean /= period
  for (let i = 0; i < period; i++) data[i] -= mean

  // bucla Karplus-Strong: media a două eșantioane consecutive de acum o perioadă,
  // cu o pierdere calculată ca amplitudinea să scadă la 0.001 după t60 secunde
  const g = Math.pow(0.001, 1 / (t60 * freq))
  data[period] = g * 0.5 * data[0]
  for (let i = period + 1; i < length; i++) {
    data[i] = g * 0.5 * (data[i - period] + data[i - period - 1])
  }
  // fade-out la final ca să nu "pocnească"
  const fade = Math.floor(sr * 0.08)
  for (let i = 0; i < fade; i++) data[length - 1 - i] *= i / fade

  // normalizare
  let peak = 0
  for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(data[i]))
  if (peak > 0) for (let i = 0; i < length; i++) data[i] /= peak

  // bucla are de fapt perioada (period + 0.5) eșantioane → corectăm înălțimea prin playbackRate
  const rate = freq / (sr / (period + 0.5))
  return { data, rate }
}

/** Bufferul audio pentru o frecvență (din cache dacă există). */
function pluckBuffer(ctx: BaseAudioContext, freq: number, bright = 0.5) {
  const key = `${freq.toFixed(2)}|${bright.toFixed(2)}`
  const hit = cache.get(key)
  if (hit) return hit
  const { data, rate } = synthPluck(ctx.sampleRate, freq, bright)
  const buffer = ctx.createBuffer(1, data.length, ctx.sampleRate)
  buffer.copyToChannel(data, 0)
  const result = { buffer, rate }
  cache.set(key, result)
  return result
}

// "corpul" chitării: un mic filtru comun pentru toate notele (căldură + rotunjire)
let body: AudioNode | null = null
function bodyChain(): AudioNode {
  if (body) return body
  const { ctx, out } = getAudio()
  const low = ctx.createBiquadFilter()
  low.type = 'peaking'
  low.frequency.value = 110
  low.Q.value = 1.2
  low.gain.value = 4
  const mid = ctx.createBiquadFilter()
  mid.type = 'peaking'
  mid.frequency.value = 230
  mid.Q.value = 1.5
  mid.gain.value = 2.5
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 5200
  low.connect(mid).connect(lp).connect(out)
  body = low
  return body
}

/** Voci active pe fiecare coardă: o coardă nouă ciupită o oprește pe cea veche (ca în realitate). */
const activeVoices = new Map<number, { src: AudioBufferSourceNode; gain: GainNode }>()

function stopVoice(stringIndex: number, at: number) {
  const v = activeVoices.get(stringIndex)
  if (!v) return
  try {
    v.gain.gain.cancelScheduledValues(at)
    v.gain.gain.setTargetAtTime(0, at, 0.015)
    v.src.stop(at + 0.12)
  } catch {
    /* deja oprită */
  }
  activeVoices.delete(stringIndex)
}

export interface PlayOpts {
  /** momentul (timp audio) la care pornește; implicit acum */
  when?: number
  /** 0..1 */
  velocity?: number
  bright?: number
  /** coarda pe care o "ocupă" nota (pentru a opri nota veche de pe aceeași coardă); -1 = nicio coardă */
  stringIndex?: number
  /** durată maximă în secunde (apoi nota e amortizată) */
  duration?: number
}

/** Cântă o frecvență oarecare cu timbru de chitară. */
export function playFreq(freq: number, opts: PlayOpts = {}) {
  const { ctx } = getAudio()
  const when = opts.when ?? ctx.currentTime
  const { buffer, rate } = pluckBuffer(ctx, freq, opts.bright ?? 0.5)
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.playbackRate.value = rate
  const gain = ctx.createGain()
  const vel = opts.velocity ?? 0.8
  gain.gain.value = vel * 0.55
  src.connect(gain).connect(bodyChain())
  const si = opts.stringIndex ?? -1
  if (si >= 0) {
    stopVoice(si, when)
    activeVoices.set(si, { src, gain })
    src.onended = () => {
      if (activeVoices.get(si)?.src === src) activeVoices.delete(si)
    }
  }
  src.start(when)
  if (opts.duration) {
    gain.gain.setTargetAtTime(0, when + opts.duration, 0.05)
    src.stop(when + opts.duration + 0.4)
  }
  return src
}

export function playMidi(midi: number, opts: PlayOpts = {}) {
  return playFreq(midiToFreq(midi), opts)
}

/** Cântă o notă de pe o coardă (0 = coarda 6) și o tastă. */
export function playNote(stringIndex: number, fret: number, opts: PlayOpts = {}) {
  return playMidi(midiAt(stringIndex, fret), { stringIndex, ...opts })
}

/** Poziția unui acord: 6 valori, de la coarda 6 la coarda 1; null = coardă care nu se cântă (x). */
export type Frets = (number | null)[]

export interface StrumOpts extends PlayOpts {
  direction?: 'down' | 'up'
  /** timpul dintre corzi într-o lovitură (secunde) */
  spread?: number
  /** la lovitura în sus se ating de obicei doar corzile subțiri */
  upStrings?: number
}

/** Lovitura de pană peste toate corzile unui acord (în jos sau în sus). */
export function strum(frets: Frets, opts: StrumOpts = {}) {
  const { ctx } = getAudio()
  const when = opts.when ?? ctx.currentTime
  const dir = opts.direction ?? 'down'
  const spread = opts.spread ?? (dir === 'down' ? 0.016 : 0.012)
  let indices = frets.map((f, i) => (f === null ? -1 : i)).filter((i) => i >= 0)
  if (dir === 'up') {
    indices = indices.reverse().slice(0, opts.upStrings ?? 4)
  }
  const vel = opts.velocity ?? (dir === 'down' ? 0.85 : 0.6)
  indices.forEach((si, k) => {
    // corzile cântate primele sunt puțin mai tari
    playNote(si, frets[si] as number, {
      when: when + k * spread,
      velocity: vel * (1 - k * 0.03),
      bright: opts.bright ?? (dir === 'up' ? 0.65 : 0.5),
      duration: opts.duration,
    })
  })
}

/** Oprește toate corzile (palmă peste corzi). */
export function muteAll(when?: number) {
  const { ctx } = getAudio()
  const t = when ?? ctx.currentTime
  for (const si of [...activeVoices.keys()]) stopVoice(si, t)
}

/** Arpegiu simplu: corzile una câte una, de jos în sus. */
export function arpeggio(frets: Frets, gap = 0.12, when?: number) {
  const { ctx } = getAudio()
  const t = when ?? ctx.currentTime
  frets.forEach((f, i) => {
    if (f !== null) playNote(i, f, { when: t + i * gap, velocity: 0.7 })
  })
}
