import type { Level } from './types'

/** Nivelul 0 – Înainte să cânți */
export const level0: Level = {
  id: 'nivel-0',
  number: 0,
  title: 'Înainte să cânți',
  subtitle: 'Cunoaște-ți instrumentul',
  icon: '🪵',
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'partile-chitarei',
      title: 'Părțile chitarei',
      summary: 'Atinge fiecare parte a chitarei și află ce rol are.',
      minutes: 5,
      blocks: [
        {
          type: 'text',
          text: `Bine ai venit! Înainte să cânți prima notă, hai să cunoaștem instrumentul. Nu trebuie să ții minte tot acum – vei folosi aceste cuvinte în lecțiile următoare și le vei învăța pe parcurs.

Chitara acustică are trei zone mari: **capul** (sus, cu cheile), **gâtul** (partea lungă pe care apeși corzile) și **corpul** (cutia de lemn care face sunetul mai puternic).`,
        },
        { type: 'widget', widget: 'anatomy' },
        {
          type: 'tip',
          text: 'Atinge și **corzile** din desen – fiecare are sunetul ei. În lecția 3 vei învăța cum se numesc.',
        },
        {
          type: 'exercise',
          title: 'Fă cunoștință cu chitara ta',
          steps: [
            'Ia chitara și găsește pe ea fiecare parte din desen.',
            'Numără barele de metal de pe grif de la cap spre corp: 1, 2, 3...',
            'Găsește semnele de poziție (punctele) de la tastele 3, 5, 7, 9 și 12.',
            'Ciupește ușor fiecare coardă și ascultă diferența dintre cea groasă și cea subțire.',
          ],
        },
      ],
      quiz: [
        {
          q: 'Cu ce parte a chitarei o acordezi?',
          options: ['Căluşul', 'Cheile de acordaj', 'Gura (rozeta)'],
          answer: 1,
          explain: 'Rotind cheile întinzi sau slăbești corzile, deci schimbi nota pe care o cântă.',
        },
        {
          q: 'Ce este o „tastă”?',
          options: ['Spațiul dintre două bare de metal de pe grif', 'O cheie de acordaj', 'Gaura din corpul chitarei'],
          answer: 0,
          explain: 'Barele sunt firele de metal; spațiul dintre ele e tasta. Tasta 1 e cea mai apropiată de cap.',
        },
        {
          q: 'De ce are chitara acustică un corp gol pe dinăuntru?',
          options: ['Ca să fie mai ușoară', 'Ca să amplifice sunetul corzilor', 'Ca să țină corzile'],
          answer: 1,
          explain: 'Cutia de rezonanță vibrează împreună cu corzile și face sunetul mult mai puternic.',
        },
      ],
    },
    // ------------------------------------------------------------------ 2
    {
      id: 'postura',
      title: 'Cum ții chitara și pana',
      summary: 'Postura corectă, pana și poziția mâinii stângi.',
      minutes: 7,
      blocks: [
        {
          type: 'text',
          text: `O postură bună te ajută să cânți mai ușor, să nu obosești și să nu te doară spatele. Merită să o înveți corect de la început – obiceiurile proaste se corectează greu mai târziu.

**Mâna dreaptă** lovește sau ciupește corzile (cu pana sau cu degetele). **Mâna stângă** apasă corzile pe grif ca să schimbe notele. (Dacă ești stângaci și ai o chitară pentru stângaci, e invers – poți activa „Mod pentru stângaci” din Profil.)`,
        },
        { type: 'widget', widget: 'posture' },
        {
          type: 'tip',
          tone: 'warn',
          text: 'Dacă simți **durere** în încheietură, umăr sau spate, oprește-te și verifică postura. Disconfortul din vârful degetelor e normal la început; durerea în articulații nu este.',
        },
        {
          type: 'exercise',
          title: 'Verifică-ți postura în oglindă',
          minutes: 2,
          steps: [
            'Așază-te pe un scaun fără brațe, cu ambele tălpi pe podea.',
            'Pune chitara pe piciorul drept, cu spatele ei lipit de burtă și piept.',
            'Ține pana corect și lovește ușor toate corzile în jos, de câteva ori.',
            'Pune degetul mare al mâinii stângi în spatele gâtului și arcuiește celelalte degete deasupra corzilor.',
            'Privește-te într-o oglindă: umerii sunt relaxați? Gâtul chitarei e ușor ridicat?',
          ],
        },
      ],
      quiz: [
        {
          q: 'Cât de mult trebuie să iasă vârful penei dintre degete?',
          options: ['Aproape toată pana', 'Doar 2–3 milimetri', 'Deloc'],
          answer: 1,
          explain: 'Un vârf scurt îți dă control; dacă iese prea mult, pana se agață în corzi.',
        },
        {
          q: 'Unde stă degetul mare al mâinii stângi?',
          options: ['Peste grif, apăsând corzile', 'În spatele gâtului, cam în dreptul degetului 2', 'Pe corpul chitarei'],
          answer: 1,
          explain: 'Degetul mare sprijină din spate, iar celelalte degete apasă din față.',
        },
        {
          q: 'Cum trebuie să fie degetele mâinii stângi?',
          options: ['Întinse și drepte', 'Arcuite, apăsând cu vârful', 'Lipite unul de altul'],
          answer: 1,
          explain: 'Degetele arcuite nu ating corzile vecine, așa că toate notele sună curat.',
        },
      ],
    },
    // ------------------------------------------------------------------ 3
    {
      id: 'corzile-si-degetele',
      title: 'Corzile și degetele',
      summary: 'Numele corzilor (E A D G B E) și numerotarea degetelor.',
      minutes: 6,
      blocks: [
        {
          type: 'text',
          text: `Chitara are 6 corzi. Le numerotăm **de la cea mai subțire (1) la cea mai groasă (6)**. Când ții chitara în brațe, coarda 6 e cea de sus, cea mai apropiată de fața ta.

Fiecare coardă liberă cântă o notă. De la groasă la subțire: **E A D G B E**. În solfegiu: Mi, La, Re, Sol, Si, Mi. În aplicație folosim literele, pentru că așa se scriu și acordurile (C, Am, G...).

Un truc ca să ții minte ordinea E-A-D-G-B-E: **„Elena Are Două Gutui Bune, Enorme”**.`,
        },
        { type: 'widget', widget: 'strings' },
        {
          type: 'text',
          text: `Degetele mâinii stângi au și ele numere. Le vei vedea în fiecare diagramă de acord: **1 = arătătorul, 2 = mijlociul, 3 = inelarul, 4 = degetul mic**. Degetul mare nu are număr: el stă în spatele gâtului.`,
        },
        { type: 'widget', widget: 'fingers' },
        {
          type: 'exercise',
          title: 'Corzi și degete',
          steps: [
            'Ciupește fiecare coardă de la 6 la 1 și spune-i numele cu voce tare: E, A, D, G, B, E.',
            'Fă invers, de la 1 la 6.',
            'Joacă jocul „ce coardă e?” de mai sus până nimerești de 5 ori la rând.',
            'Mișcă pe rând degetele 1, 2, 3, 4 ale mâinii stângi, spunând numărul fiecăruia.',
          ],
        },
      ],
      quiz: [
        {
          q: 'Care este coarda 6?',
          options: ['Cea mai subțire', 'Cea mai groasă', 'Cea din mijloc'],
          answer: 1,
          explain: 'Coarda 6 e cea mai groasă (E grav). Coarda 1 e cea mai subțire (E acut).',
        },
        {
          q: 'Care e ordinea corzilor, de la groasă la subțire?',
          options: ['E B G D A E', 'E A D G B E', 'A B C D E F'],
          answer: 1,
          explain: '„Elena Are Două Gutui Bune, Enorme” – E A D G B E.',
        },
        {
          q: 'În diagrame, ce înseamnă cifra 3 într-un cerc?',
          options: ['Apeși cu inelarul', 'Apeși cu arătătorul', 'Apeși 3 corzi deodată'],
          answer: 0,
          explain: '1 arătătorul, 2 mijlociul, 3 inelarul, 4 degetul mic.',
        },
        {
          q: 'Ce notă cântă coarda 5 liberă?',
          options: ['D (Re)', 'E (Mi)', 'A (La)'],
          answer: 2,
          explain: 'Coarda 6 = E, coarda 5 = A, coarda 4 = D.',
        },
      ],
    },
    // ------------------------------------------------------------------ 4
    {
      id: 'acordarea',
      title: 'Acordarea chitarei',
      summary: 'Acordorul cu microfon: aduci fiecare coardă la nota corectă.',
      minutes: 8,
      blocks: [
        {
          type: 'text',
          text: `O chitară neacordată sună „fals” chiar dacă pui degetele perfect. Corzile se dezacordează mereu puțin (din cauza temperaturii, a umidității sau doar pentru că le cânți), așa că **acordează chitara de fiecare dată când începi să exersezi**.

Cum funcționează: ciupești o coardă, acordorul ascultă prin microfon și îți arată dacă nota e **prea joasă** (acul în stânga) sau **prea înaltă** (acul în dreapta).

- Notă prea joasă → **strângi** coarda (rotești cheia ca să se întindă).
- Notă prea înaltă → **slăbești** coarda.
- Rotește cheia încet, puțin câte puțin, și ciupește din nou.`,
        },
        {
          type: 'tip',
          text: 'Un truc sigur: dacă nota e prea înaltă, slăbește coarda puțin **sub** nota corectă, apoi urc-o încet până la ea. Corzile țin acordajul mai bine când ajungi la notă „de jos în sus”.',
        },
        { type: 'widget', widget: 'tuner' },
        {
          type: 'tip',
          tone: 'warn',
          text: 'Nu strânge prea mult! O coardă întinsă cu mult peste notă se poate rupe. Dacă acordorul arată o notă cu mult mai sus decât trebuie (de ex. vrei E și arată G), probabil ai rotit cheia greșită.',
        },
        {
          type: 'exercise',
          title: 'Acordează toate cele 6 corzi',
          steps: [
            'Stai într-o cameră liniștită și permite accesul la microfon.',
            'Începe cu coarda 6 (E). Ciupește-o și lasă-o să sune.',
            'Rotește cheia până când acul stă în mijloc și indicatorul devine verde.',
            'Repetă pentru corzile A, D, G, B și E.',
            'Verifică încă o dată toate corzile – acordarea uneia le poate mișca puțin pe celelalte.',
          ],
        },
      ],
      quiz: [
        {
          q: 'Acordorul arată că nota e prea joasă. Ce faci?',
          options: ['Slăbești coarda', 'Strângi (întinzi) coarda', 'Apeși coarda mai tare pe grif'],
          answer: 1,
          explain: 'O coardă mai întinsă vibrează mai repede, deci sună mai sus.',
        },
        {
          q: 'Când e bine să acordezi chitara?',
          options: ['O dată pe lună', 'Doar când e nouă', 'De fiecare dată înainte să exersezi'],
          answer: 2,
          explain: 'Corzile se dezacordează puțin tot timpul; o verificare de un minut face diferența.',
        },
        {
          q: 'Pe ce notă se acordează coarda 3?',
          options: ['G (Sol)', 'B (Si)', 'D (Re)'],
          answer: 0,
          explain: 'E A D G B E: coarda 3 este G.',
        },
      ],
    },
    // ------------------------------------------------------------------ 5
    {
      id: 'diagrame-si-tab',
      title: 'Diagrame de acord și tabulator',
      summary: 'Cum citești o diagramă de acord și un tab.',
      minutes: 8,
      blocks: [
        {
          type: 'text',
          text: `Muzica pentru chitară se scrie de obicei în două feluri, mult mai ușor de citit decât portativul:

- **Diagrama de acord** – un „desen” al grifului care îți arată unde pui degetele pentru un acord.
- **Tabulatorul (tab)** – o scriere pe 6 linii care îți arată ce note cânți, una după alta.

Hai să le luăm pe rând.`,
        },
        { type: 'widget', widget: 'chordReading' },
        { type: 'text', text: `Acum **tabulatorul**. E perfect pentru melodii și exerciții, unde cânți câte o notă.` },
        { type: 'widget', widget: 'tabReading' },
        {
          type: 'exercise',
          title: 'Citește și cântă',
          steps: [
            'Ascultă exemplul de tab de mai sus de două ori.',
            'Cântă-l încet pe chitară: cifra îți spune tasta, linia îți spune coarda.',
            'Atinge cifrele din tab ca să auzi fiecare notă separat.',
            'Mărește tempoul când îl poți cânta fără greșeli.',
          ],
        },
      ],
      quiz: [
        {
          q: 'Într-o diagramă de acord, ce înseamnă „×” deasupra unei corzi?',
          options: ['Coarda se cântă liberă', 'Coarda nu se cântă', 'Apeși coarda cu degetul 1'],
          answer: 1,
          explain: '„×” = nu cânți acea coardă. „o” = o cânți liberă.',
          chord: 'D',
        },
        {
          q: 'În tab, ce înseamnă cifra 0 pe o linie?',
          options: ['Coarda liberă', 'Pauză', 'Tasta 10'],
          answer: 0,
          explain: '0 înseamnă că ciupești coarda fără să apeși nimic.',
        },
        {
          q: 'Ce coardă e linia de SUS dintr-un tab?',
          options: ['Coarda 6 (E gros)', 'Coarda 1 (e subțire)', 'Coarda 3 (G)'],
          answer: 1,
          explain: 'Tabul are sus coarda subțire, iar jos pe cea groasă.',
        },
        {
          q: 'În diagrama aceasta, ce deget apasă coarda 5 (A)?',
          options: ['Degetul 1', 'Degetul 2', 'Degetul 3'],
          answer: 2,
          explain: 'La acordul C, inelarul (3) apasă coarda 5 la tasta 3.',
          chord: 'C',
        },
      ],
    },
  ],
}
