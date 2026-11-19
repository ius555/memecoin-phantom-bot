/**
 * Ilustrații pentru lecția 2: postura, cum ții pana, poziția mâinii stângi.
 * Desene plate, simple, cu puncte numerotate care corespund listei de verificare.
 */
import { useState } from 'react'

const TABS = [
  {
    id: 'postura',
    label: 'Postura',
    checks: [
      'Spatele drept, umerii relaxați (nu ridicați).',
      'Chitara stă pe piciorul drept, lipită de corp.',
      'Gâtul chitarei e ușor ridicat, nu orizontal și nu în jos.',
      'Antebrațul drept se sprijină pe marginea corpului chitarei.',
      'Ambele tălpi pe podea. Un scaun fără brațe e ideal.',
    ],
  },
  {
    id: 'pana',
    label: 'Pana',
    checks: [
      'Prinde pana între buricul degetului mare și partea laterală a arătătorului.',
      'Vârful penei iese doar 2–3 mm. Prea mult = se agață de corzi.',
      'Ține-o ferm, dar fără să strângi. Mișcarea vine din încheietură, nu din tot brațul.',
      'Pentru început, o pană subțire sau medie (0,5–0,7 mm) e cea mai ușoară.',
    ],
  },
  {
    id: 'mana',
    label: 'Mâna stângă',
    checks: [
      'Degetul mare stă în spatele gâtului, cam în dreptul degetului 2.',
      'Degetele sunt arcuite, ca niște ciocănele; apeși cu vârful lor.',
      'Palma nu se lipește de gât – lasă un mic spațiu, ca un tunel.',
      'Încheietura e relaxată, cât mai dreaptă.',
    ],
  },
] as const

function Badge({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill="var(--accent)" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">
        {n}
      </text>
    </g>
  )
}

function PostureSvg() {
  return (
    <svg viewBox="0 0 260 290" className="mx-auto w-full max-w-sm" role="img" aria-label="Postura corectă când stai pe scaun cu chitara">
      {/* scaunul */}
      <rect x={62} y={196} width={120} height={10} rx={4} fill="var(--fret)" />
      <rect x={70} y={206} width={7} height={70} fill="var(--fret)" />
      <rect x={167} y={206} width={7} height={70} fill="var(--fret)" />
      {/* picioarele */}
      <rect x={90} y={192} width={22} height={78} rx={10} fill="#4b5f7a" />
      <rect x={130} y={192} width={22} height={78} rx={10} fill="#4b5f7a" />
      <ellipse cx={98} cy={274} rx={17} ry={7} fill="#3a2c20" />
      <ellipse cx={145} cy={274} rx={17} ry={7} fill="#3a2c20" />
      <line x1={30} x2={230} y1={281} y2={281} stroke="var(--line)" strokeWidth={3} />
      {/* trunchiul */}
      <path d="M96 76h50c8 0 12 6 12 14l-4 100H88l-4-100c0-8 4-14 12-14Z" fill="var(--primary)" />
      <rect x={114} y={60} width={14} height={18} fill="#e8c4a0" />
      <circle cx={121} cy={44} r={21} fill="#e8c4a0" />
      <path d="M100 40c0-14 10-22 21-22s21 8 21 22c-6-8-14-10-21-10s-15 2-21 10Z" fill="#5a3b26" />
      {/* chitara, înclinată */}
      <g transform="rotate(-24 100 172)">
        <rect x={110} y={164} width={120} height={12} rx={3} fill="#5c3a22" />
        <path d="M226 160h20v20h-20z" fill="#5c3a22" />
        <ellipse cx={74} cy={170} rx={40} ry={33} fill="#c98d55" />
        <ellipse cx={106} cy={170} rx={22} ry={22} fill="#c98d55" />
        <circle cx={100} cy={170} r={10} fill="#2b1c12" />
      </g>
      {/* brațul drept (pe corpul chitarei) */}
      <path d="M92 86 C70 110 66 140 84 168" stroke="#e8c4a0" strokeWidth={13} fill="none" strokeLinecap="round" />
      {/* brațul stâng (spre gât) */}
      <path d="M152 86 C182 104 196 116 206 118" stroke="#e8c4a0" strokeWidth={12} fill="none" strokeLinecap="round" />
      <Badge x={174} y={62} n={1} />
      <Badge x={60} y={206} n={2} />
      <Badge x={236} y={96} n={3} />
      <Badge x={58} y={126} n={4} />
      <Badge x={186} y={262} n={5} />
    </svg>
  )
}

function PickSvg() {
  return (
    <svg viewBox="0 0 260 220" className="mx-auto w-full max-w-sm" role="img" aria-label="Cum ții pana între degetul mare și arătător">
      {/* arătătorul (în spate, punctat) */}
      <path d="M40 60 C110 40 170 70 190 120 C196 136 186 150 170 146 C150 120 110 100 50 100Z" fill="#e8c4a0" opacity={0.55} stroke="#c7a07a" strokeDasharray="4 3" />
      {/* pana */}
      <path d="M120 96c-26 0-46 8-46 26 0 26 26 60 46 74 20-14 46-48 46-74 0-18-20-26-46-26Z" fill="var(--accent)" />
      {/* degetul mare (deasupra) */}
      <path d="M30 120 C80 98 140 96 168 116 C180 126 172 140 158 138 C120 132 80 140 34 156Z" fill="#e8c4a0" stroke="#c7a07a" />
      <ellipse cx={160} cy={126} rx={10} ry={7} fill="#f3dcc2" />
      {/* cota vârfului */}
      <line x1={196} x2={196} y1={160} y2={196} stroke="var(--ink)" strokeWidth={1.5} />
      <line x1={190} x2={202} y1={160} y2={160} stroke="var(--ink)" strokeWidth={1.5} />
      <line x1={190} x2={202} y1={196} y2={196} stroke="var(--ink)" strokeWidth={1.5} />
      <text x={206} y={182} fontSize={12} fontWeight={800} fill="var(--ink)">
        2–3 mm
      </text>
      <Badge x={22} y={140} n={1} />
      <Badge x={140} y={200} n={2} />
    </svg>
  )
}

function HandSvg() {
  return (
    <svg viewBox="0 0 260 230" className="mx-auto w-full max-w-sm" role="img" aria-label="Secțiune prin gâtul chitarei: degetul mare în spate, degetul arcuit apasă coarda">
      {/* secțiunea gâtului */}
      <path d="M70 110h120c0 44-26 70-60 70s-60-26-60-70Z" fill="#5c3a22" />
      <rect x={70} y={104} width={120} height={8} fill="#3b2414" />
      {[80, 100, 120, 140, 160, 180].map((x, i) => (
        <circle key={x} cx={x} cy={100} r={2 + (5 - i) * 0.25} fill="#c9c3b5" />
      ))}
      {/* degetul mare, în spate */}
      <ellipse cx={130} cy={196} rx={22} ry={13} fill="#e8c4a0" stroke="#c7a07a" />
      {/* palma și degetul arcuit */}
      <path d="M232 200 C240 150 226 92 196 60 C176 40 150 40 136 62 C128 76 128 88 134 96" stroke="#e8c4a0" strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d="M232 200 C240 150 226 92 196 60 C176 40 150 40 136 62 C128 76 128 88 134 96" stroke="#c7a07a" strokeWidth={1} fill="none" strokeDasharray="0" opacity={0.6} />
      {/* spațiul ("tunelul") dintre palmă și gât */}
      <path d="M196 118 Q214 140 206 170" stroke="var(--primary)" strokeWidth={2} strokeDasharray="4 4" fill="none" />
      <Badge x={98} y={210} n={1} />
      <Badge x={124} y={46} n={2} />
      <Badge x={228} y={140} n={3} />
    </svg>
  )
}

export function Posture() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('postura')
  const current = TABS.find((t) => t.id === tab)!
  return (
    <div className="card">
      <div className="mb-4 grid grid-cols-3 gap-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`btn !min-h-11 !px-2 border-2 text-sm ${tab === t.id ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'postura' ? <PostureSvg /> : tab === 'pana' ? <PickSvg /> : <HandSvg />}
      <ol className="mt-4 space-y-2">
        {current.checks.map((c, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-extrabold text-white">{i + 1}</span>
            <span>{c}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
