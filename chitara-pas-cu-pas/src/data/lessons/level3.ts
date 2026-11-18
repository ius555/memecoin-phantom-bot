import type { Level } from './types'

/** Nivelul 3 – Ritm și strumming */
export const level3: Level = {
  id: 'nivel-3',
  number: 3,
  title: 'Ritm și strumming',
  subtitle: 'Mâna dreaptă intră în joc',
  icon: '🥁',
  lessons: [
    // ------------------------------------------------------------------ 13
    {
      id: 'strum-jos-sus',
      title: 'Strumming în jos, apoi jos-sus',
      summary: 'Mișcarea de pendul a mâinii drepte.',
      minutes: 10,
      blocks: [
        {
          type: 'text',
          text: `**Strumming** înseamnă să lovești mai multe corzi deodată cu pana, în ritm. E motorul acompaniamentului.

Regula de aur: **mâna dreaptă se mișcă tot timpul, ca un pendul** – în jos pe timpi (1, 2, 3, 4) și în sus pe „și”. Chiar și când nu lovești corzile, mâna continuă mișcarea. Așa rămâi mereu în ritm.

- **În jos (↓)**: mișcare din încheietură, relaxată, ca și cum ai scutura apa de pe mână.
- **În sus (↑)**: mai ușoară, atinge mai ales corzile subțiri (1, 2, 3).
- Nu lovi din tot brațul – cotul stă aproape pe loc.`,
        },
        { type: 'widget', widget: 'strumDown' },
        {
          type: 'tip',
          text: 'Ține pana relaxat. Dacă se agață în corzi sau sună „țăcănit”, scoate mai puțin din vârful ei și lovește corzile la un unghi ușor înclinat.',
        },
        {
          type: 'exercise',
          title: 'Pendulul',
          minutes: 4,
          steps: [
            'Pe acordul Em: 4 lovituri în jos pe măsură, la 60 bpm, timp de un minut.',
            'Apoi 8 lovituri în jos („1 și 2 și...”).',
            'Apoi jos-sus continuu: ↓ pe cifre, ↑ pe „și”.',
            'Schimbă acordul la fiecare măsură: Em → Am → Em → Am, fără să oprești mâna dreaptă.',
          ],
        },
      ],
      quiz: [
        {
          q: 'Când lovești în sus (↑) în ritmul jos-sus?',
          options: ['Pe cifre (1, 2, 3, 4)', 'Pe „și”', 'Doar la sfârșitul măsurii'],
          answer: 1,
          explain: 'Jos pe timp, sus pe „și” – ca un pendul.',
        },
        {
          q: 'De unde vine mișcarea de strumming?',
          options: ['Din tot brațul și umăr', 'Mai ales din încheietură', 'Din degete'],
          answer: 1,
          explain: 'Încheietura relaxată dă un sunet uniform și nu obosești.',
        },
        {
          q: 'Ce faci cu mâna dreaptă când într-un ritm „sari” peste o lovitură?',
          options: ['O opresc', 'Continuă mișcarea, dar nu atinge corzile', 'Lovesc mai tare data următoare'],
          answer: 1,
          explain: 'Pendulul nu se oprește niciodată – așa rămâi în tempo.',
        },
      ],
    },
    // ------------------------------------------------------------------ 14
    {
      id: 'modele-strumming',
      title: 'Modele de strumming',
      summary: 'D-DU-UDU și alte modele, cu săgeți animate.',
      minutes: 12,
      blocks: [
        {
          type: 'text',
          text: `Un **model de strumming** e o combinație fixă de lovituri jos (D, de la „down”) și sus (U, „up”) care se repetă în fiecare măsură. Liniuța (-) înseamnă că mâna trece pe lângă corzi fără să le atingă.

Cel mai cunoscut e **D-DU-UDU**: „**1** – **2** și – și **4** și”. Observă că pe timpul 3 mâna coboară „în gol”: de aici vine senzația de „leagăn” a ritmului.

Urmărește săgețile: se luminează exact când se aude lovitura. Încearcă întâi doar să bați din palme modelul, apoi cântă-l pe un acord.`,
        },
        { type: 'widget', widget: 'strumPatterns', props: { initial: 'pop', chord: 'G' } },
        {
          type: 'tip',
          text: 'Dacă un model nu „iese”, scade tempoul la 50–60 bpm și spune-l cu voce tare: „jos – jos sus – sus jos sus”. Ritmul intră întâi în cap, apoi în mână.',
        },
        {
          type: 'exercise',
          title: 'Trei modele',
          minutes: 5,
          steps: [
            'Exersează „Ritmul pop” (D-DU-UDU) pe G, timp de un minut.',
            'Exersează „Folk” pe C.',
            'Exersează „Vals” (3/4) pe Am – numără „1 2 și 3 și”.',
            'Alege modelul preferat și cântă-l pe Em → Am.',
          ],
        },
      ],
      quiz: [
        {
          q: 'Ce înseamnă „-” într-un model de strumming?',
          options: ['Pauză lungă de o măsură', 'Mâna se mișcă, dar nu atinge corzile', 'Lovești mai încet'],
          answer: 1,
          explain: 'Mâna păstrează pendulul, doar că trece pe lângă corzi.',
        },
        {
          q: 'În modelul D-DU-UDU, ce se întâmplă pe timpul 3?',
          options: ['Lovitură în jos', 'Mâna coboară fără să lovească', 'Lovitură în sus'],
          answer: 1,
          explain: 'Sloturile sunt: 1=D, și=-, 2=D, și=U, 3=-, și=U, 4=D, și=U.',
        },
        {
          q: 'Câți timpi are măsura de vals?',
          options: ['2', '3', '4'],
          answer: 1,
          explain: 'Valsul e în 3/4: „1 2 3, 1 2 3”.',
        },
      ],
    },
    // ------------------------------------------------------------------ 15
    {
      id: 'progresii',
      title: 'Primele progresii',
      summary: 'I–V–vi–IV și I–vi–IV–V, cu redare audio.',
      minutes: 12,
      blocks: [
        {
          type: 'text',
          text: `O **progresie** e o succesiune de acorduri care se repetă. Multe cântece folosesc aceleași câteva progresii – de aceea, odată învățate, le vei recunoaște peste tot.

Muzicienii le notează cu **cifre romane**, după locul acordului în tonalitate. În tonalitatea **Sol major**:
- **I** = G (acordul „acasă”)
- **IV** = C
- **V** = D
- **vi** = Em (cifră mică = acord minor)

**I – V – vi – IV** (G – D – Em – C) e progresia celor mai multe cântece pop din ultimii 50 de ani. **I – vi – IV – V** (G – Em – C – D) are sunetul baladelor din anii ’50.`,
        },
        { type: 'widget', widget: 'progressions', props: { progressionIds: ['i-v-vi-iv-g', 'i-vi-iv-v-g', 'i-v-vi-iv-c', 'i-vi-iv-v-c', 'am-f-c-g'], bpm: 72 } },
        {
          type: 'tip',
          text: '**Schimbă pe ultimul „și”.** Ca schimbarea să fie la timp, ridică degetele de pe acordul vechi pe ultima jumătate de timp a măsurii (lovești corzile libere atunci – e perfect normal) și ajungi pe acordul nou exact pe „1”.',
        },
        {
          type: 'exercise',
          title: 'Cântă împreună cu aplicația',
          minutes: 5,
          steps: [
            'Alege G – D – Em – C și ascult-o de două ori.',
            'Cântă împreună cu ea, cu „Doar în jos, pe timpi”, la 60 bpm.',
            'Când merge, schimbă ritmul în „Ritmul pop”.',
            'Încearcă și I – vi – IV – V (G – Em – C – D).',
          ],
        },
      ],
      quiz: [
        {
          q: 'În Sol major, ce acord e „vi”?',
          options: ['C', 'Em', 'D'],
          answer: 1,
          explain: 'I=G, IV=C, V=D, vi=Em.',
        },
        {
          q: 'Ce înseamnă o cifră romană scrisă cu litere mici (de ex. „vi”)?',
          options: ['Acordul e minor', 'Acordul se cântă încet', 'Acordul e cu barré'],
          answer: 0,
          explain: 'Majuscule = major, litere mici = minor.',
        },
        {
          q: 'Când e bine să începi mutarea degetelor spre acordul următor?',
          options: ['Pe ultimul „și” al măsurii', 'După ce începe măsura nouă', 'Cu o măsură înainte'],
          answer: 0,
          explain: 'Așa ajungi pe acordul nou exact pe timpul 1.',
        },
      ],
    },
  ],
}
