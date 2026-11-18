/**
 * Chitara interactivă (lecția 1): atingi o parte a chitarei și afli cum se numește și ce face.
 * Desen plat, în SVG, al unei chitare acustice (vertical, ca să încapă pe telefon).
 */
import { useState } from 'react'
import { playNote } from '../../audio/guitar'

interface Part {
  id: string
  name: string
  text: string
}

const PARTS: Part[] = [
  { id: 'head', name: 'Capul (paleta)', text: 'Partea de sus a chitarei. Aici sunt prinse cheile de acordaj și, de obicei, numele producătorului.' },
  { id: 'pegs', name: 'Cheile de acordaj', text: 'Rotindu-le, întinzi sau slăbești corzile. Coarda mai întinsă sună mai sus (mai acut), cea slăbită sună mai jos. Cu ele acordezi chitara.' },
  { id: 'nut', name: 'Prăguşul (nut-ul)', text: 'O bucată mică din os sau plastic, cu șanțuri prin care trec corzile. De aici începe partea care vibrează a corzii.' },
  { id: 'neck', name: 'Gâtul și grifura', text: 'Bucata lungă de lemn. Pe fața ei (grifura) apeși corzile cu degetele mâinii stângi ca să schimbi notele.' },
  { id: 'frets', name: 'Barele și tastele', text: 'Barele sunt firele de metal de pe grif. Spațiul dintre două bare se numește tastă. Tasta 1 e cea mai apropiată de cap. Apeși coarda chiar lângă bara din dreapta tastei.' },
  { id: 'inlays', name: 'Semnele de poziție', text: 'Punctele de pe grif (la tastele 3, 5, 7, 9 și dublu la 12) te ajută să te orientezi rapid.' },
  { id: 'strings', name: 'Corzile', text: 'Chitara are 6 corzi. Cea mai groasă (sus, când ții chitara) e coarda 6, cea mai subțire e coarda 1. Atinge-le ca să le auzi!' },
  { id: 'body', name: 'Corpul (cutia de rezonanță)', text: 'Cutia goală de lemn care amplifică vibrația corzilor. Fără ea, corzile s-ar auzi foarte încet.' },
  { id: 'hole', name: 'Gura (rozeta)', text: 'Gaura rotundă prin care iese sunetul din cutia de rezonanță. Lovești corzile cu pana cam deasupra ei.' },
  { id: 'guard', name: 'Placa de protecție', text: 'Protejează lemnul de zgârieturile făcute de pană.' },
  { id: 'bridge', name: 'Căluşul și ştegul', text: 'Căluşul ține corzile prinse de corp. Pe el stă ştegul (o bucată albă subțire) peste care trec corzile; el transmite vibrația către corp.' },
]

// poziția verticală a barelor (formula reală a tastelor: fiecare tastă e cu ~5,6% mai scurtă)
const NUT_Y = 92
const SADDLE_Y = 470
const fretY = (n: number) => NUT_Y + (SADDLE_Y - NUT_Y) * (1 - Math.pow(2, -n / 12))
const STRING_X = [91, 95.6, 100.2, 104.8, 109.4, 114]

export function GuitarAnatomy() {
  const [sel, setSel] = useState<string>('body')
  const part = PARTS.find((p) => p.id === sel)!
  const on = (id: string) => sel === id
  const hl = (id: string) => ({
    stroke: on(id) ? 'var(--primary)' : undefined,
    strokeWidth: on(id) ? 3 : undefined,
    onClick: () => setSel(id),
    className: 'cursor-pointer',
    role: 'button',
    'aria-label': PARTS.find((p) => p.id === id)!.name,
  })
  const glow = 'drop-shadow(0 0 6px var(--primary))'

  return (
    <div className="card grid items-start gap-4 sm:grid-cols-[minmax(0,240px)_1fr]">
      <svg viewBox="0 0 205 540" className="mx-auto w-full max-w-[240px]" role="group" aria-label="Chitara interactivă">
        {/* corpul */}
        <path
          {...hl('body')}
          d="M102 250C62 250 38 266 38 306c0 34 17 46 15 62-2 18-36 33-36 79 0 50 46 74 85 74s85-24 85-74c0-46-34-61-36-79-2-16 15-28 15-62 0-40-24-56-64-56Z"
          fill="#c98d55"
          style={{ filter: on('body') ? glow : undefined }}
        />
        <path d="M102 258C66 258 46 272 46 306c0 31 16 42 14 61-2 17-35 33-35 79 0 45 41 67 77 67s77-22 77-67c0-46-33-62-35-79-2-19 14-30 14-61 0-34-20-48-56-48Z" fill="#e2b07a" pointerEvents="none" />
        {/* placa de protecție */}
        <path {...hl('guard')} d="M128 372c18 2 30 16 28 34-2 14-14 22-26 20 4-16 4-36-2-54Z" fill="#7a4a2a" style={{ filter: on('guard') ? glow : undefined }} />
        {/* gura */}
        <g {...hl('hole')} style={{ filter: on('hole') ? glow : undefined }}>
          <circle cx={102} cy={378} r={30} fill="#a5643a" />
          <circle cx={102} cy={378} r={25} fill="#2b1c12" />
        </g>
        {/* căluşul */}
        <g {...hl('bridge')} style={{ filter: on('bridge') ? glow : undefined }}>
          <rect x={70} y={462} width={64} height={16} rx={6} fill="#4a2c18" />
          <rect x={86} y={467} width={32} height={3} rx={1.5} fill="#f5ecd8" />
        </g>
        {/* gâtul */}
        <rect {...hl('neck')} x={86} y={NUT_Y} width={33} height={258} rx={3} fill="#5c3a22" style={{ filter: on('neck') ? glow : undefined }} />
        {/* barele */}
        <g {...hl('frets')} style={{ filter: on('frets') ? glow : undefined }}>
          <rect x={86} y={NUT_Y + 6} width={33} height={244} fill="transparent" />
          {Array.from({ length: 19 }, (_, i) => (
            <line key={i} x1={86} x2={119} y1={fretY(i + 1)} y2={fretY(i + 1)} stroke={on('frets') ? 'var(--primary)' : '#d9d2c3'} strokeWidth={on('frets') ? 2.4 : 1.6} />
          ))}
        </g>
        {/* semnele de poziție */}
        <g {...hl('inlays')} style={{ filter: on('inlays') ? glow : undefined }}>
          {[3, 5, 7, 9, 15, 17].map((n) => (
            <circle key={n} cx={102.5} cy={(fretY(n - 1) + fretY(n)) / 2} r={3} fill={on('inlays') ? 'var(--primary)' : '#efe6d2'} />
          ))}
          {[96, 109].map((x) => (
            <circle key={x} cx={x} cy={(fretY(11) + fretY(12)) / 2} r={2.6} fill={on('inlays') ? 'var(--primary)' : '#efe6d2'} />
          ))}
        </g>
        {/* capul */}
        <path {...hl('head')} d="M84 92 78 22c0-8 6-14 14-14h21c8 0 14 6 14 14l-6 70Z" fill="#5c3a22" style={{ filter: on('head') ? glow : undefined }} />
        {/* cheile */}
        <g {...hl('pegs')} style={{ filter: on('pegs') ? glow : undefined }}>
          {[28, 50, 72].map((y) => (
            <g key={y}>
              <rect x={64} y={y - 3} width={18} height={6} rx={2} fill="#c9c3b5" />
              <ellipse cx={60} cy={y} rx={8} ry={6} fill="#ece6d8" stroke="#a49c8b" />
              <rect x={123} y={y - 3} width={18} height={6} rx={2} fill="#c9c3b5" />
              <ellipse cx={145} cy={y} rx={8} ry={6} fill="#ece6d8" stroke="#a49c8b" />
            </g>
          ))}
        </g>
        {/* prăguşul */}
        <rect {...hl('nut')} x={85} y={NUT_Y - 4} width={35} height={6} rx={1.5} fill="#f5ecd8" style={{ filter: on('nut') ? glow : undefined }} />
        {/* corzile: fiecare se poate atinge și cântă */}
        <g style={{ filter: on('strings') ? glow : undefined }}>
          {STRING_X.map((x, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onClick={() => {
                setSel('strings')
                playNote(i, 0)
              }}
              role="button"
              aria-label={`Coarda ${6 - i}`}
            >
              <line x1={x} x2={x} y1={NUT_Y - 2} y2={469} stroke="transparent" strokeWidth={5} />
              <line x1={x} x2={x} y1={NUT_Y - 2} y2={469} stroke={on('strings') ? 'var(--primary)' : '#ddd5c3'} strokeWidth={1.6 - i * 0.18} />
            </g>
          ))}
        </g>
      </svg>

      <div className="sm:sticky sm:top-4">
        <div className="rounded-2xl bg-primary-soft p-4" aria-live="polite">
          <div className="text-xs font-extrabold tracking-wider text-primary uppercase">Ai atins</div>
          <div className="h-display text-2xl">{part.name}</div>
          <p className="mt-1 leading-relaxed">{part.text}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PARTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSel(p.id)}
              className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold ${on(p.id) ? 'border-primary bg-primary text-primary-ink' : 'border-line'}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
