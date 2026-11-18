import type { Level } from './types'

/** Nivelul 1 – Primele sunete */
export const level1: Level = {
  id: 'nivel-1',
  number: 1,
  title: 'Primele sunete',
  subtitle: 'Degete puternice, sunet curat',
  icon: '🌱',
  lessons: [
    // ------------------------------------------------------------------ 6
    {
      id: 'o-singura-coarda',
      title: 'Exerciții pe o singură coardă',
      summary: 'Apăsarea corectă pe tastă, fără bâzâit.',
      minutes: 8,
      blocks: [
        {
          type: 'text',
          text: `E timpul să apeși prima notă! Secretul unui sunet curat stă în **unde** și **cum** apeși coarda.

- Apasă cu **vârful degetului**, nu cu partea plată.
- Pune degetul **chiar lângă bara din dreapta** tastei (spre corpul chitarei), nu în mijlocul tastei.
- Apasă **doar cât e nevoie**. Mai multă forță nu înseamnă sunet mai bun – doar oboseală.

Dacă auzi un **bâzâit**, degetul e prea departe de bară sau nu apasă destul. Dacă nota sună **înfundat**, probabil o atingi cu alt deget sau cu palma.`,
        },
        {
          type: 'tip',
          text: '**Testul apăsării:** apasă coarda 1 la tasta 3 și ciupește-o. Slăbește apăsarea treptat până începe să bâzâie. Apoi apasă puțin mai tare – acela e nivelul de forță corect.',
        },
        {
          type: 'tab',
          title: 'Pe coarda 1 (e): liberă, tasta 1, tasta 3',
          bpm: 60,
          tab: `
e|-0---1---3---1---|-0---1---3-------|
B|-----------------|-----------------|
G|-----------------|-----------------|
D|-----------------|-----------------|
A|-----------------|-----------------|
E|-----------------|-----------------|`,
        },
        {
          type: 'tab',
          title: 'Pe coarda 2 (B), apoi coarda 1: o mică melodie',
          bpm: 70,
          tab: `
e|-----------------|-0---1---3---0---|
B|-0---1---3---1---|-----------------|
G|-----------------|-----------------|
D|-----------------|-----------------|
A|-----------------|-----------------|
E|-----------------|-----------------|`,
        },
        {
          type: 'tab',
          title: 'Pe coarda 6 (E groasă): bas',
          bpm: 70,
          tab: `
e|-----------------|-----------------|
B|-----------------|-----------------|
G|-----------------|-----------------|
D|-----------------|-----------------|
A|-----------------|-----------------|
E|-0---3---5---3---|-0---3---0-------|`,
        },
        {
          type: 'exercise',
          title: 'Sunet curat pe fiecare notă',
          minutes: 5,
          steps: [
            'Cântă fiecare tab de mai sus încet, cu tempoul la 60.',
            'Folosește degetul 1 pentru tasta 1, degetul 3 pentru tasta 3, degetul 4 pentru tasta 5 (sau 3 dacă e prea greu).',
            'Ascultă fiecare notă: dacă bâzâie, mută degetul mai aproape de bară.',
            'Ține degetele aproape de corzi când nu apeși, nu le ridica sus.',
          ],
        },
      ],
      quiz: [
        {
          q: 'Unde pui degetul ca nota să sune curat?',
          options: ['În mijlocul tastei', 'Chiar lângă bara din dreapta tastei', 'Fix pe bara de metal'],
          answer: 1,
          explain: 'Lângă bară ai nevoie de cea mai mică forță și nota nu bâzâie.',
        },
        {
          q: 'O notă bâzâie. Care e cea mai probabilă cauză?',
          options: ['Chitara e prea veche', 'Degetul e prea departe de bară sau apasă prea slab', 'Pana e prea subțire'],
          answer: 1,
          explain: 'Apropie degetul de bară și verifică dacă apeși cu vârful.',
        },
        {
          q: 'Cu ce parte a degetului apeși coarda?',
          options: ['Cu vârful', 'Cu partea plată (amprenta)', 'Cu unghia'],
          answer: 0,
          explain: 'Vârful degetului ocupă puțin loc și nu atinge corzile vecine.',
        },
      ],
    },
    // ------------------------------------------------------------------ 7
    {
      id: 'cromatic',
      title: 'Exercițiul 1-2-3-4',
      summary: 'Încălzirea degetelor cu exercițiul cromatic.',
      minutes: 8,
      blocks: [
        {
          type: 'text',
          text: `Exercițiul „1-2-3-4” (sau **cromatic**) e încălzirea preferată a chitariștilor din toată lumea. Fiecare deget are tasta lui: **un deget pe tastă**.

Te ajută să:
- îți întărești degetele, mai ales degetul mic (4);
- îți coordonezi mâna stângă cu cea dreaptă;
- îți întinzi mâna ca să ajungi ușor la acorduri.

Începe la **tastele 5–8**: acolo tastele sunt mai înguste și e mai ușor. Când merge bine, coboară la tastele 1–4.`,
        },
        { type: 'widget', widget: 'chromatic' },
        {
          type: 'tip',
          text: '**Lasă degetele jos.** Când pui degetul 2, degetul 1 poate rămâne apăsat. Când treci pe coarda următoare, le ridici pe toate. Așa economisești mișcare.',
        },
        {
          type: 'exercise',
          title: 'Încălzirea zilnică',
          minutes: 3,
          steps: [
            'Pornește cu tempoul la 60 bpm și varianta „O coardă”.',
            'Treci la „Toate corzile” când nu mai greșești.',
            'Fă varianta „Dus-întors” o dată pe zi, ca încălzire.',
            'Crește tempoul cu 5 bpm doar după 3 repetări curate.',
          ],
        },
      ],
      quiz: [
        {
          q: 'Ce înseamnă „un deget pe tastă”?',
          options: ['Folosești doar un deget pentru tot', 'Fiecare deget are tasta lui (1, 2, 3, 4 pe taste vecine)', 'Apeși o singură tastă pe minut'],
          answer: 1,
          explain: 'Mâna stă într-o „poziție” de patru taste, iar fiecare deget o acoperă pe a lui.',
        },
        {
          q: 'De ce e bine să începi la tastele 5–8?',
          options: ['Tastele sunt mai înguste, deci mâna se întinde mai puțin', 'Sună mai frumos', 'Corzile sunt mai groase acolo'],
          answer: 0,
          explain: 'Spre corpul chitarei, tastele devin mai mici – e mai ușor pentru o mână încă neantrenată.',
        },
        {
          q: 'Când crești tempoul?',
          options: ['Imediat, ca să progresezi repede', 'După câteva repetări fără greșeli', 'Niciodată'],
          answer: 1,
          explain: 'Viteza vine din precizie. Repetă curat, apoi crește cu câte 5 bpm.',
        },
      ],
    },
    // ------------------------------------------------------------------ 8
    {
      id: 'ritm-de-baza',
      title: 'Ritm de bază',
      summary: 'Metronomul și numărătoarea „1 și 2 și 3 și 4 și”.',
      minutes: 8,
      blocks: [
        {
          type: 'text',
          text: `Muzica are un „puls” constant, ca bătăile inimii. Fiecare bătaie e un **timp**. De obicei, timpii se grupează câte 4 într-o **măsură**: 1, 2, 3, 4, 1, 2, 3, 4...

Între doi timpi mai e o jumătate de timp, pe care o numim **„și”**: **1 și 2 și 3 și 4 și**. Asta e baza tuturor ritmurilor de strumming de mai târziu.

**Metronomul** e un aparat care bate pulsul perfect constant. Cântând cu el, înveți să nu grăbești și să nu încetinești.`,
        },
        { type: 'widget', widget: 'counting' },
        {
          type: 'exercise',
          title: 'Simte pulsul',
          steps: [
            'Pornește metronomul la 60 bpm și bate din palme pe fiecare clic, numărând cu voce tare „1, 2, 3, 4”.',
            'Activează „Numără și «și»” și spune „1 și 2 și 3 și 4 și”, bătând din palme doar pe cifre.',
            'Ia chitara și lovește toate corzile libere în jos pe fiecare cifră (1, 2, 3, 4).',
            'Apoi lovește în jos pe cifre și în sus pe „și”. Mâna se mișcă tot timpul, ca un pendul.',
          ],
        },
        {
          type: 'tip',
          text: 'Primul timp al măsurii (1) are un clic mai înalt. Îl auzi ca un „acum începe din nou”. În muzică, timpul 1 e de obicei puțin mai apăsat.',
        },
      ],
      quiz: [
        {
          q: 'Câți timpi are o măsură obișnuită (4/4)?',
          options: ['2', '3', '4'],
          answer: 2,
          explain: '4/4 înseamnă 4 timpi pe măsură: 1, 2, 3, 4.',
        },
        {
          q: 'Ce înseamnă „și” în numărătoarea „1 și 2 și”?',
          options: ['Jumătatea dintre doi timpi', 'O pauză lungă', 'Sfârșitul cântecului'],
          answer: 0,
          explain: '„Și” cade exact la mijloc între două bătăi.',
        },
        {
          q: 'Ce măsoară „bpm”?',
          options: ['Volumul', 'Bătăi pe minut – tempoul', 'Numărul de corzi'],
          answer: 1,
          explain: '60 bpm = o bătaie pe secundă. Cu cât e mai mare, cu atât e mai repede.',
        },
      ],
    },
  ],
}
