import type { Level } from './types'

/** Nivelul 5 – Avansat */
export const level5: Level = {
  id: 'nivel-5',
  number: 5,
  title: 'Avansat',
  subtitle: 'Barré, culori noi și solo',
  icon: '🏔️',
  lessons: [
    // ------------------------------------------------------------------ 18
    {
      id: 'acordul-f',
      title: 'Acordul F și barré-ul',
      summary: 'Exerciții pregătitoare și primul barré.',
      minutes: 15,
      blocks: [
        {
          type: 'text',
          text: `Acordul **F** (Fa major) e „marele examen” al chitaristului începător. Folosește un **barré**: arătătorul (1) apasă **toate corzile** deodată, culcat peste grif, ca o bară.

E greu la început pentru toată lumea – durează de obicei câteva săptămâni până sună curat. Nu te descuraja! Mergem pas cu pas:

- **Pasul 1:** mini-barré pe 2 corzi (corzile 1 și 2).
- **Pasul 2:** „F mic” – fără barré complet.
- **Pasul 3:** barré complet pe toate corzile, întâi mai sus pe grif (tasta 5), apoi la tasta 1.`,
        },
        { type: 'widget', widget: 'barreDrill' },
        {
          type: 'tip',
          text: `**Secretele barré-ului:**
- Rotește ușor arătătorul spre partea lui **osoasă** (spre degetul mare) – partea moale cu cute „înghite” corzile.
- Pune arătătorul **chiar lângă bara** tastei.
- Forța vine și din **brațul care trage ușor înapoi**, nu doar din strânsoarea degetului mare.
- Degetul mare coboară mai jos, în spatele gâtului, cam în dreptul degetului 2.`,
        },
        { type: 'chords', chords: ['F'], caption: 'Atinge diagrama ca să auzi; vezi și „F mic” în biblioteca de acorduri.' },
        {
          type: 'exercise',
          title: 'Drumul spre F',
          minutes: 6,
          steps: [
            'Mini-barré: arătătorul pe corzile 1 și 2, tasta 1. Ciupește-le separat până sună amândouă.',
            'F mic (xx3211): adaugă degetele 2 și 3. Schimbă C ↔ F mic de 10 ori.',
            'Barré complet la tasta 5, doar cu arătătorul: verifică fiecare coardă.',
            'F complet la tasta 1. Nu-ți face griji dacă o coardă e înfundată – în fiecare zi va suna mai bine.',
          ],
        },
      ],
      quiz: [
        {
          q: 'Ce este un barré?',
          options: ['Un deget care apasă mai multe corzi deodată', 'O coardă care nu se cântă', 'Un tip de pană'],
          answer: 0,
          explain: 'Arătătorul se culcă peste grif și apasă mai multe corzi (uneori toate) la aceeași tastă.',
        },
        {
          q: 'Cu ce parte a arătătorului faci barré-ul?',
          options: ['Partea moale, din mijloc', 'Partea mai osoasă, rotind ușor degetul', 'Cu unghia'],
          answer: 1,
          explain: 'Partea osoasă e mai dreaptă și nu are cute în care să „cadă” corzile.',
        },
        {
          q: 'De unde e mai ușor să începi exercițiile de barré?',
          options: ['De la tasta 1', 'De la tasta 5 (corzile sunt mai moi acolo)', 'De la tasta 12'],
          answer: 1,
          explain: 'Mai sus pe grif corzile cer mai puțină forță. Apoi cobori treptat.',
        },
      ],
    },
    // ------------------------------------------------------------------ 19
    {
      id: 'barre-mobile',
      title: 'Acorduri barré mobile',
      summary: 'Forma E și forma A, oriunde pe grif.',
      minutes: 12,
      blocks: [
        {
          type: 'text',
          text: `Marele avantaj al barré-ului: o formă se poate **muta oriunde pe grif**, iar acordul își schimbă numele după tasta la care stă.

- **Forma E**: acordul E, „împins” mai sus, cu arătătorul ținând locul prăguşului. **Nota de bază e pe coarda 6** – deci te uiți ce notă e pe coarda 6 la tasta respectivă. Exemplu: tasta 1 = F, tasta 3 = G, tasta 5 = A.
- **Forma A**: acordul A, mutat la fel. **Nota de bază e pe coarda 5**. Tasta 2 = B, tasta 3 = C, tasta 5 = D.

Fiecare formă are și varianta **minoră** (Em-shape, Am-shape). Cu aceste 4 forme poți cânta **orice acord major sau minor**!`,
        },
        { type: 'widget', widget: 'barreShapes' },
        {
          type: 'tip',
          text: 'Învață notele de pe corzile 6 și 5 până la tasta 12. Ajută și un truc: tastele cu puncte (3, 5, 7, 9, 12) pe coarda 6 sunt G, A, B, C#, E.',
        },
        { type: 'chords', chords: ['Bm', 'F#m'], caption: 'Două barré-uri foarte folosite: Bm (forma Am, tasta 2) și F#m (forma Em, tasta 2).' },
        {
          type: 'exercise',
          title: 'Mută formele',
          steps: [
            'Forma E la tasta 3 (G), apoi la tasta 5 (A). Lovește de 4 ori fiecare.',
            'Forma A la tasta 3 (C), apoi la tasta 5 (D).',
            'Cântă progresia D – A – Bm – G, cu Bm barré.',
            'Găsește singur: unde e acordul Cm cu forma Am? (Indiciu: tasta 3.)',
          ],
        },
      ],
      quiz: [
        {
          q: 'Cu forma E la tasta 3, ce acord obții?',
          options: ['F', 'G', 'A'],
          answer: 1,
          explain: 'Coarda 6 la tasta 3 e nota G, deci acordul e G.',
        },
        {
          q: 'La forma A, pe ce coardă e nota de bază?',
          options: ['Coarda 6', 'Coarda 5', 'Coarda 4'],
          answer: 1,
          explain: 'Coarda 5 (A liberă) – la tasta 2 e B, la tasta 3 e C...',
        },
        {
          q: 'Ce acord e acesta?',
          options: ['Bm', 'B', 'Am'],
          answer: 0,
          explain: 'Forma Am cu barré la tasta 2: Bm.',
          chord: 'Bm',
        },
      ],
    },
    // ------------------------------------------------------------------ 20
    {
      id: 'sus-7-maj7',
      title: 'Acorduri sus2, sus4, 7, maj7',
      summary: 'Culori noi pentru acordurile tale.',
      minutes: 12,
      blocks: [
        {
          type: 'text',
          text: `Acordurile majore și minore sunt „culorile de bază”. Acum adăugăm nuanțe:

- **7** (de ex. **E7, A7, D7, G7**): sună „neliniștit”, cere să meargă mai departe. Foarte folosit în blues și înainte de a reveni la acordul de bază.
- **maj7** (de ex. **Cmaj7, Fmaj7**): sunet visător, cald, de jazz și bossa nova.
- **sus2 / sus4** („suspendat”): treapta a 3-a e înlocuită cu a 2-a sau a 4-a. Sună „în aer”, neterminat. De obicei se rezolvă înapoi pe acordul normal: **Dsus4 → D**.
- **m7** (de ex. **Am7, Em7**): un minor mai moale.

Multe dintre ele sunt chiar **mai ușoare** decât acordurile normale – de exemplu Em7 sau Cmaj7.`,
        },
        { type: 'chords', chords: ['E7', 'A7', 'G7', 'Cmaj7', 'Fmaj7', 'Am7'] },
        { type: 'text', text: 'Ascultă cum **sus4** și **sus2** „trag” spre acordul D, și apoi se liniștesc pe el:' },
        { type: 'chords', chords: ['Dsus2', 'D', 'Dsus4'] },
        {
          type: 'exercise',
          title: 'Culori',
          minutes: 5,
          steps: [
            'Cântă D → Dsus4 → D → Dsus2 → D, câte 2 lovituri fiecare. Doar degetul de pe coarda 1 se mișcă.',
            'Cântă A → A7 → D (blues).',
            'Cântă C → Cmaj7 → F → Fmaj7 – ascultă cum sună „visător”.',
            'Înlocuiește într-o progresie învățată un acord cu varianta lui 7 sau maj7.',
          ],
        },
      ],
      quiz: [
        {
          q: 'Cum sună un acord „sus4”?',
          options: ['Neterminat, „în aer” – vrea să revină la acordul normal', 'Foarte trist', 'Exact ca un acord minor'],
          answer: 0,
          explain: 'Cvarta suspendată creează tensiune care se rezolvă pe acordul major.',
        },
        {
          q: 'Ce acord e în diagramă?',
          options: ['Cmaj7', 'C', 'Am7'],
          answer: 0,
          explain: 'Ca un C, dar fără degetul 1 – coarda 2 rămâne liberă (nota B = septima mare).',
          chord: 'Cmaj7',
        },
        {
          q: 'Unde se folosesc des acordurile „7” (E7, A7...)?',
          options: ['În blues', 'Doar în muzica clasică', 'Nicăieri'],
          answer: 0,
          explain: 'Blues-ul se construiește aproape în întregime pe acorduri cu septimă.',
        },
      ],
    },
    // ------------------------------------------------------------------ 21
    {
      id: 'pentatonica',
      title: 'Gama pentatonică',
      summary: 'Primul tău „solo”: pentatonica minoră.',
      minutes: 12,
      blocks: [
        {
          type: 'text',
          text: `O **gamă** e un șir de note care „se potrivesc” împreună. **Pentatonica** are doar **5 note** (penta = cinci) și e cea mai folosită gamă pentru improvizație în rock, blues și folk – pentru că e aproape imposibil să sune „greșit”.

Învățăm **„cutia 1”** a pentatonicii minore: o formă de două note pe fiecare coardă, care se poate muta pe grif ca un barré. Pentru **La minor (Am)**, cutia începe la **tasta 5**.

Degetele: **1** pe tasta 5, **3** pe tasta 7, **4** pe tasta 8. Notele marcate cu **R** sunt fundamentala (A) – acolo „se termină” frumos o frază.`,
        },
        { type: 'widget', widget: 'pentatonic' },
        {
          type: 'tab',
          title: 'O frază scurtă în Am pentatonic',
          bpm: 80,
          tab: `
e|-------------5-8-|-5---------------|
B|-------5-8-------|---8-5-----------|
G|-5-7-------------|-------7-5-------|
D|-----------------|-----------7-----|
A|-----------------|-----------------|
E|-----------------|-----------------|`,
        },
        {
          type: 'exercise',
          title: 'Primul solo',
          minutes: 5,
          steps: [
            'Cântă gama în sus și în jos, rar, cu degetele corecte (1, 3, 4).',
            'Cântă fraza din tab de mai sus.',
            'Pornește progresia Am – F – C – G din „Editorul de progresii” și improvizează peste ea cu notele din cutie.',
            'Termină fiecare frază pe o notă R (A). Ascultă cum sună „acasă”.',
          ],
        },
        {
          type: 'tip',
          text: 'Mai puțin e mai mult: 3–4 note bine alese, cu pauze între fraze, sună mai muzical decât multe note repezi. Gândește-te la solo ca la o conversație.',
        },
      ],
      quiz: [
        {
          q: 'Câte note are o gamă pentatonică?',
          options: ['5', '7', '12'],
          answer: 0,
          explain: 'Penta = cinci.',
        },
        {
          q: 'Unde începe cutia 1 a pentatonicii La minor?',
          options: ['La tasta 1', 'La tasta 5', 'La tasta 12'],
          answer: 1,
          explain: 'Pe coarda 6, tasta 5 e nota A – fundamentala.',
        },
        {
          q: 'Ce înseamnă „R” pe grif?',
          options: ['Notă repetată', 'Fundamentala (nota de bază) a gamei', 'Coarda care nu se cântă'],
          answer: 1,
          explain: 'R vine de la „root” (rădăcină) – nota pe care gama „se odihnește”.',
        },
      ],
    },
  ],
}
