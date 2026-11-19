/**
 * Lecția 5: cum citești o diagramă de acord și un tabulator – explicații pas cu pas,
 * cu elementul despre care se vorbește evidențiat în desen.
 */
import { useState } from 'react'
import { ChordDiagram } from '../ChordDiagram'
import { TabView } from '../TabView'
import { Icon } from '../Icon'

const CHORD_STEPS = [
  { title: 'Corzile sunt verticale', text: 'Liniile verticale sunt cele 6 corzi. În stânga e coarda 6 (Mi gros), în dreapta coarda 1 (Mi subțire). Ca și cum ai privi chitara ținută vertical, din față.', focus: 'strings' },
  { title: 'Linia groasă de sus = prăguşul', text: 'Bara neagră groasă de sus e prăguşul. Liniile orizontale sunt barele de metal, iar spațiile dintre ele sunt tastele: 1, 2, 3...', focus: 'frets' },
  { title: 'Cercurile colorate = unde apeși', text: 'Un cerc arată unde pui un deget. Numărul din cerc spune ce deget: 1 arătătorul, 2 mijlociul, 3 inelarul, 4 degetul mic.', focus: 'dots' },
  { title: '„o” și „×” deasupra', text: '„o” înseamnă că acea coardă se cântă liberă (fără să apeși). „×” înseamnă că acea coardă NU se cântă: o eviți cu pana sau o atingi ușor ca să nu sune.', focus: 'top' },
  { title: 'Ascultă și verifică', text: 'Atinge diagrama și ascultă acordul. Apoi încearcă pe chitară și compară. Sub corzi vezi și notele care se aud.', focus: 'play' },
]

export function ChordReading() {
  const [step, setStep] = useState(0)
  const s = CHORD_STEPS[step]
  return (
    <div className="card grid items-center gap-4 sm:grid-cols-2">
      <ChordDiagram
        chord="C"
        playable={s.focus === 'play'}
        showNotes={s.focus === 'play'}
        maxWidth={220}
        className="mx-auto w-full"
        highlight={s.focus === 'play' ? undefined : (s.focus as 'strings' | 'frets' | 'dots' | 'top')}
      />
      <div>
        <div className="text-xs font-extrabold tracking-wider text-accent uppercase">
          Pasul {step + 1} din {CHORD_STEPS.length}
        </div>
        <h4 className="h-display text-xl">{s.title}</h4>
        <p className="mt-1 leading-relaxed">{s.text}</p>
        <div className="mt-3 flex gap-2">
          <button className="btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)} aria-label="Pasul anterior">
            <Icon name="back" />
          </button>
          <button className="btn-primary flex-1" disabled={step === CHORD_STEPS.length - 1} onClick={() => setStep(step + 1)}>
            Mai departe <Icon name="next" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function TabReading() {
  return (
    <div className="space-y-3">
      <div className="card">
        <ul className="space-y-2">
          <li>
            <strong>6 linii = 6 corzi.</strong> Sus e coarda subțire (e mic), jos e cea groasă (E mare) – invers decât te-ai aștepta, ca și cum ai privi chitara de sus în jos, în brațe.
          </li>
          <li>
            <strong>Cifra = tasta</strong> pe care apeși. <strong>0</strong> = coarda liberă.
          </li>
          <li>
            <strong>Citești de la stânga la dreapta</strong>, ca un text. Cifrele una sub alta se cântă deodată.
          </li>
          <li>
            Tabul nu spune <em>ce deget</em> folosești și nici ritmul exact – de aceea îl asculți întâi.
          </li>
        </ul>
      </div>
      <TabView
        title="Exemplu: o melodie scurtă pe coarda 1 și 2"
        bpm={80}
        tab={`
e|-0---1---3---1---|-0-------0-------|
B|-----------------|-----3-------1---|
G|-----------------|-----------------|
D|-----------------|-----------------|
A|-----------------|-----------------|
E|-----------------|-----------------|`}
      />
    </div>
  )
}
