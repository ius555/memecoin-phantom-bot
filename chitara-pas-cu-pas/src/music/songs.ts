/**
 * Cântece pentru exersare – DOAR din domeniul public (populare / tradiționale, sau cu autori
 * decedați de peste 70 de ani) și compoziții originale scrise pentru această aplicație.
 *
 * Format: fiecare vers e un șir de caractere în care acordurile stau între paranteze pătrate,
 * chiar înaintea silabei pe care se schimbă: "[C]Hai să dăm [G]mână cu mână".
 * Implicit, fiecare acord ține `beatsPerChord` timpi; poți scrie și "[G:2]" pentru 2 timpi.
 * Acordurile sunt un acompaniament simplu, potrivit pentru începători.
 */
export interface Song {
  id: string
  title: string
  /** sursa / drepturile */
  origin: string
  level: 1 | 2 | 3
  bpm: number
  strum: string // id-ul modelului de strumming recomandat
  beatsPerChord: number
  sections: { name: string; lines: string[] }[]
}

export const SONGS: Song[] = [
  {
    id: 'primul-cantec',
    title: 'Primul meu cântec',
    origin: 'Compoziție originală pentru Chitara Pas cu Pas',
    level: 1,
    bpm: 66,
    strum: 'jos-4',
    beatsPerChord: 4,
    sections: [
      {
        name: 'Strofa 1',
        lines: ['[Em]Am luat chitara-n [Am]brațe', '[Em]Prima coardă, primul [Am]pas,', '[Em]Degetele-ncet se-[Am]nvață,', '[Em]Cântecul rămâne-n [Am]glas.'],
      },
      {
        name: 'Strofa 2',
        lines: ['[Em]Mi și La, două a[Am]corduri,', '[Em]Sună trist, dar sună [Am]bine,', '[Em]Mâine poate-nvăț mai [Am]multe,', '[Em]Azi cânt doar pentru [Am]mine.'],
      },
    ],
  },
  {
    id: 'drumul-spre-casa',
    title: 'Drumul spre casă',
    origin: 'Compoziție originală pentru Chitara Pas cu Pas',
    level: 2,
    bpm: 76,
    strum: 'pop',
    beatsPerChord: 4,
    sections: [
      {
        name: 'Strofa',
        lines: ['[G]Seara coboară pe [D]deal', '[Em]Luna se-aprinde pe [C]cer', '[G]Pașii mă poartă a[D]casă', '[Em]Pe drumul pe care-l [C]știu.'],
      },
      {
        name: 'Refren',
        lines: ['[C]Lumina din [D]geam', '[G]mă cheamă din [Em]nou,', '[C]acolo e [D]tot', '[G]ce am mai fru[G]mos.'],
      },
    ],
  },
  {
    id: 'valsul-frunzelor',
    title: 'Valsul frunzelor',
    origin: 'Compoziție originală pentru Chitara Pas cu Pas',
    level: 2,
    bpm: 96,
    strum: 'vals',
    beatsPerChord: 3,
    sections: [
      {
        name: 'Strofa',
        lines: ['[Am]Frunzele [Am]cad', '[Dm]Toamna a ve[Dm]nit', '[E]Vântul le [E]poartă', '[Am]Încet, liniș[Am]tit.'],
      },
      {
        name: 'Strofa 2',
        lines: ['[Am]Galbene, [Am]roșii', '[Dm]Dansează-n [Dm]vals', '[E]Până se-a[E]șază', '[Am]Pe drumul cel [Am]alb.'],
      },
    ],
  },
  {
    id: 'hora-unirii',
    title: 'Hora Unirii',
    origin: 'Versuri: Vasile Alecsandri · Muzica: Alexandru Flechtenmacher (domeniul public)',
    level: 2,
    bpm: 100,
    strum: 'jos-sus',
    beatsPerChord: 4,
    sections: [
      {
        name: 'Strofa 1',
        lines: ['[C]Hai să dăm mână cu [G]mână', '[G]Cei cu inima ro[C]mână,', '[F]Să-nvârtim hora fră[C]ției', '[G]Pe pământul Româ[C]niei!'],
      },
      {
        name: 'Strofa 2',
        lines: ['[C]Iarba rea din holde [G]piară!', '[G]Piară dușmănia-n [C]țară!', '[F]Între noi să nu mai [C]fie', '[G]Decât flori și ome[C]nie!'],
      },
    ],
  },
  {
    id: 'o-ce-veste',
    title: 'O, ce veste minunată',
    origin: 'Colind tradițional românesc (domeniul public)',
    level: 2,
    bpm: 80,
    strum: 'jos-4',
    beatsPerChord: 4,
    sections: [
      {
        name: 'Strofa 1',
        lines: ['[Am]O, ce veste minu[E]nată,', '[E]În Betleem ni s-a[Am]rată!', '[Dm]Astăzi s-a [Am]născut', '[Dm]Cel făr\' de-n[Am]ceput,', '[E]Cum au spus pro[Am]rocii.'],
      },
      {
        name: 'Strofa 2',
        lines: ['[Am]Că la Betleem Ma[E]ria', '[E]Săvârșind călăto[Am]ria,', '[Dm]Într-un mic să[Am]laș,', '[Dm]Lângă-acel o[Am]raș,', '[E]A născut pe Me[Am]sia.'],
      },
    ],
  },
  {
    id: 'melc-melc',
    title: 'Melc, melc, codobelc',
    origin: 'Cântec popular pentru copii (domeniul public)',
    level: 1,
    bpm: 84,
    strum: 'jos-4',
    beatsPerChord: 4,
    sections: [
      {
        name: 'Strofa',
        lines: ['[D]Melc, melc, codo[A]belc,', '[A]Scoate coarne bou[D]rești', '[D]Și te du la [A]baltă', '[A]Și bea apă [D]caldă.'],
      },
    ],
  },
]

export function getSong(id: string): Song | undefined {
  return SONGS.find((s) => s.id === id)
}

export interface LyricSegment {
  chord?: string
  beats?: number
  text: string
}

/** Desparte un vers în segmente {acord, text}. */
export function parseLine(line: string): LyricSegment[] {
  const out: LyricSegment[] = []
  const re = /\[([^\]:]+)(?::(\d+))?\]/g
  let last = 0
  let m: RegExpExecArray | null
  let pending: { chord: string; beats?: number } | null = null
  while ((m = re.exec(line))) {
    const text = line.slice(last, m.index)
    if (text || pending) out.push({ ...(pending ?? {}), text })
    pending = { chord: m[1], beats: m[2] ? Number(m[2]) : undefined }
    last = m.index + m[0].length
  }
  out.push({ ...(pending ?? {}), text: line.slice(last) })
  return out.filter((s) => s.chord || s.text)
}

/** Lista de acorduri (în ordine) a întregului cântec, cu duratele lor. */
export function songSequence(song: Song): { chord: string; beats: number }[] {
  return song.sections.flatMap((sec) =>
    sec.lines.flatMap((l) =>
      parseLine(l)
        .filter((s) => s.chord)
        .map((s) => ({ chord: s.chord!, beats: s.beats ?? song.beatsPerChord })),
    ),
  )
}

/** Acordurile distincte folosite în cântec. */
export function songChords(song: Song): string[] {
  return [...new Set(songSequence(song).map((x) => x.chord))]
}
