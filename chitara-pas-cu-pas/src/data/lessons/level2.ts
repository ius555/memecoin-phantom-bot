import type { Level } from './types'

/** Nivelul 2 – Primele acorduri */
export const level2: Level = {
  id: 'nivel-2',
  number: 2,
  title: 'Primele acorduri',
  subtitle: 'Acordurile deschise de bază',
  icon: '🎸',
  lessons: [
    // ------------------------------------------------------------------ 9
    {
      id: 'em-am',
      title: 'Em și Am',
      summary: 'Primele două acorduri, cele mai ușoare.',
      minutes: 10,
      blocks: [
        {
          type: 'text',
          text: `Un **acord** înseamnă mai multe note cântate deodată. Cu doar câteva acorduri poți acompania sute de cântece!

Începem cu cele mai prietenoase două: **Em** (Mi minor) și **Am** (La minor). Literele mari sunt nota de bază, iar „m” înseamnă **minor** – un sunet mai melancolic. Fără „m”, acordul e **major** – un sunet mai luminos.

**Em** folosește doar două degete și toate cele 6 corzi. Uită-te cum apar degetele pe rând în diagramă și atinge-o ca s-o auzi.`,
        },
        { type: 'chords', chords: ['Em', 'Am'], caption: 'Atinge diagrama pentru sunet. „1·2·3” cântă corzile pe rând.' },
        {
          type: 'text',
          text: `**Am** seamănă mult cu Em: degetele 2 și 3 au aceeași formă, doar că se mută cu o coardă mai jos (spre corzile subțiri), iar degetul 1 se adaugă pe coarda 2. Și atenție: la Am **nu cânți coarda 6** (are „×”).`,
        },
        {
          type: 'tip',
          text: '**Verifică acordul coardă cu coardă**: pune degetele, apoi ciupește fiecare coardă pe rând, de la cea mai groasă. Fiecare trebuie să sune clar. Dacă una e înfundată, ajustează degetul vecin.',
        },
        {
          type: 'exercise',
          title: 'Em ↔ Am',
          minutes: 4,
          steps: [
            'Pune Em și lovește toate corzile în jos de 4 ori.',
            'Mută degetele 2 și 3 cu o coardă mai jos și adaugă degetul 1: ai Am. Lovește de 4 ori (de la coarda 5).',
            'Revino la Em. Repetă de 10 ori, fără grabă.',
            'Încearcă să muți degetele 2 și 3 împreună, ca un bloc.',
          ],
        },
        { type: 'widget', widget: 'progressions', props: { progressionIds: ['em-am'], bpm: 60, allowPicking: false } },
      ],
      quiz: [
        {
          q: 'Ce înseamnă litera „m” din „Am”?',
          options: ['Major', 'Minor', 'Mic'],
          answer: 1,
          explain: 'Am = La minor. Acordurile minore sună mai triste, cele majore mai luminoase.',
        },
        {
          q: 'Ce acord e în diagramă?',
          options: ['Em', 'Am', 'C'],
          answer: 0,
          explain: 'Două degete pe tasta 2, corzile 5 și 4, toate corzile se cântă: Em.',
          chord: 'Em',
        },
        {
          q: 'La acordul Am, ce coardă NU se cântă?',
          options: ['Coarda 1', 'Coarda 6', 'Coarda 3'],
          answer: 1,
          explain: 'Coarda 6 are „×” – începi strumming-ul de la coarda 5.',
          chord: 'Am',
        },
      ],
    },
    // ------------------------------------------------------------------ 10
    {
      id: 'e-a-d',
      title: 'E, A și D',
      summary: 'Trei acorduri majore foarte folosite.',
      minutes: 12,
      blocks: [
        {
          type: 'text',
          text: `Acum trei acorduri **majore**. Împreună, A, D și E formează „familia” tonalității La major: cu ele poți cânta multe cântece populare, blues și rock.

**E** (Mi major) e exact ca Em, plus degetul 1 pe coarda 3, tasta 1. Ascultă diferența dintre Em și E: o singură notă schimbă tot caracterul!`,
        },
        { type: 'chords', chords: ['E', 'A', 'D'] },
        {
          type: 'text',
          text: `**A** (La major): trei degete înghesuite pe tasta 2. Dacă degetele nu încap, pot sta ușor în diagonală. Coarda 6 nu se cântă.

**D** (Re major): forma de triunghi. Lovești doar **4 corzi** (de la coarda 4 în jos) – corzile 6 și 5 au „×”. Acesta e cel mai frecvent motiv pentru care D „sună ciudat” la început.`,
        },
        {
          type: 'tip',
          text: '**Degetul pivot:** între A și D, degetul 3 stă pe coarda 2. La A e pe tasta 2, la D pe tasta 3 – doar alunecă pe coardă, fără să-l ridici!',
        },
        {
          type: 'exercise',
          title: 'Familia La major',
          minutes: 5,
          steps: [
            'Exersează fiecare acord: pune degetele, verifică fiecare coardă, ridică mâna, repetă de 5 ori.',
            'Schimbă A ↔ D de 10 ori, folosind degetul 3 ca pivot.',
            'Schimbă A ↔ E de 10 ori.',
            'Cântă progresia A – D – A – E de mai jos, la 60 bpm.',
          ],
        },
        { type: 'widget', widget: 'progressions', props: { progressionIds: ['a-d-e'], bpm: 60, allowPicking: false } },
      ],
      quiz: [
        {
          q: 'Câte corzi lovești la acordul D?',
          options: ['Toate 6', '5 (fără coarda 6)', '4 (de la coarda 4 la coarda 1)'],
          answer: 2,
          explain: 'Corzile 6 și 5 au „×”. Începi de la coarda 4 (D).',
          chord: 'D',
        },
        {
          q: 'Ce diferență e între Em și E?',
          options: ['La E se adaugă degetul 1 pe coarda 3, tasta 1', 'E se cântă fără coarda 6', 'Nu e nicio diferență'],
          answer: 0,
          explain: 'Acea notă (G#) transformă acordul din minor în major.',
        },
        {
          q: 'Ce acord e acesta?',
          options: ['D', 'A', 'E'],
          answer: 1,
          explain: 'Trei degete pe tasta 2, corzile 4, 3, 2: acordul A.',
          chord: 'A',
        },
      ],
    },
    // ------------------------------------------------------------------ 11
    {
      id: 'c-g-dm',
      title: 'C, G și Dm',
      summary: 'Completăm setul de acorduri deschise.',
      minutes: 12,
      blocks: [
        {
          type: 'text',
          text: `Cu C, G și Dm vei ști **8 acorduri** – suficient pentru mii de cântece!

**C** (Do major) cere o mică întindere: degetele 1, 2, 3 pe tastele 1, 2, 3, ca o scară. Coarda 6 nu se cântă. Degetul 3 trebuie să fie bine arcuit ca să nu atingă coarda 4.

**G** (Sol major) folosește toată lățimea grifului: degetul 2 pe coarda 6, degetul 1 pe coarda 5, degetul 3 pe coarda 1. Toate corzile se cântă.

**Dm** (Re minor): ca D, dar cu o formă puțin diferită. Tot 4 corzi.`,
        },
        { type: 'chords', chords: ['C', 'G', 'Dm'] },
        {
          type: 'tip',
          text: 'Între **C și Am** degetele 1 și 2 rămân pe loc – mută doar degetul 3! Încearcă: C → Am → C → Am. Așa de ușor se leagă acordurile care au note comune.',
        },
        { type: 'chords', chords: ['C', 'Am'], caption: 'C și Am: doar degetul 3 se mută.' },
        {
          type: 'exercise',
          title: 'Opt acorduri',
          minutes: 5,
          steps: [
            'Exersează C ↔ Am de 10 ori (doar degetul 3 se mișcă).',
            'Exersează G ↔ C de 10 ori.',
            'Exersează Dm ↔ Am de 10 ori.',
            'Cântă progresia G – Em – C – D de mai jos, rar.',
          ],
        },
        { type: 'widget', widget: 'progressions', props: { progressionIds: ['i-vi-iv-v-g', 'am-dm-e'], bpm: 60, allowPicking: false } },
      ],
      quiz: [
        {
          q: 'Care e acordul din diagramă?',
          options: ['G', 'C', 'Am'],
          answer: 1,
          explain: 'Degetele în „scară” pe tastele 1, 2, 3 și coarda 6 neatinsă: C.',
          chord: 'C',
        },
        {
          q: 'Între C și Am, ce deget se mută?',
          options: ['Degetul 1', 'Degetul 2', 'Doar degetul 3'],
          answer: 2,
          explain: 'Degetele 1 și 2 sunt pe aceleași locuri în ambele acorduri.',
        },
        {
          q: 'La acordul G, pe ce coardă stă degetul 2?',
          options: ['Coarda 6', 'Coarda 1', 'Coarda 4'],
          answer: 0,
          explain: 'La G: degetul 2 pe coarda 6 (tasta 3), degetul 1 pe coarda 5 (tasta 2), degetul 3 pe coarda 1 (tasta 3).',
          chord: 'G',
        },
      ],
    },
    // ------------------------------------------------------------------ 12
    {
      id: 'schimbari',
      title: 'Schimbarea dintre acorduri',
      summary: 'Exercițiul „one-minute change” cu cronometru.',
      minutes: 10,
      blocks: [
        {
          type: 'text',
          text: `Să știi acordurile e doar jumătate din treabă. Cealaltă jumătate e să **schimbi repede între ele**, fără să oprești ritmul.

Exercițiul **„one-minute change”** (schimbarea de un minut) e cel mai eficient mod de a exersa asta:

- Alegi **două** acorduri.
- Timp de un minut, schimbi între ele cât poți de repede, lovind corzile o dată pe fiecare acord.
- Numeri câte schimbări ai reușit și notezi rezultatul.

Făcut zilnic, câte un minut pe perechile grele, vei vedea cum numărul crește de la 10 la 30, 40, 50... Ținta: **30 de schimbări pe minut** – atunci poți cânta acea pereche în cântece.`,
        },
        { type: 'widget', widget: 'oneMinute' },
        {
          type: 'tip',
          text: '**Calitate, nu doar viteză.** Contează doar schimbările în care acordul sună (aproape) curat. Gândește-te la degete ca la un grup care „aterizează” împreună.',
        },
        {
          type: 'exercise',
          title: 'Trei minute pe zi',
          steps: [
            'Alege perechea care ți se pare cea mai grea.',
            'Fă un minut, notează rezultatul.',
            'Mai fă un minut pe altă pereche grea.',
            'Mâine, repetă – urmărește graficul cum crește.',
          ],
        },
      ],
      quiz: [
        {
          q: 'Ce numeri în exercițiul „one-minute change”?',
          options: ['Câte note cânți', 'Câte schimbări de acord reușești într-un minut', 'Câte greșeli faci'],
          answer: 1,
          explain: 'Fiecare acord nou pus corect = o schimbare.',
        },
        {
          q: 'Care e un rezultat bun ca să poți folosi perechea în cântece?',
          options: ['5 schimbări', 'În jur de 30 de schimbări pe minut', '200 de schimbări'],
          answer: 1,
          explain: 'La ~30 pe minut, poți schimba la timp în majoritatea cântecelor lente.',
        },
        {
          q: 'Cum muți degetele cel mai eficient?',
          options: ['Pe rând, câte unul', 'Toate deodată, ca un bloc', 'Nu contează'],
          answer: 1,
          explain: 'Mișcarea „în bloc” e mai rapidă și devine automată cu timpul.',
        },
      ],
    },
  ],
}
