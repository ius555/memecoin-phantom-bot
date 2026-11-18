import type { Level } from './types'

/** Nivelul 4 – Fingerpicking */
export const level4: Level = {
  id: 'nivel-4',
  number: 4,
  title: 'Fingerpicking',
  subtitle: 'Cânți cu degetele',
  icon: '🤌',
  lessons: [
    // ------------------------------------------------------------------ 16
    {
      id: 'pima',
      title: 'Notația p-i-m-a',
      summary: 'Ce deget ciupește ce coardă; modele simple.',
      minutes: 10,
      blocks: [
        {
          type: 'text',
          text: `La **fingerpicking** lași pana deoparte și ciupești corzile cu degetele mâinii drepte. Sunetul devine mai delicat și poți cânta basul și melodia în același timp.

Degetele mâinii drepte au litere (din spaniolă), ca să nu le confunzi cu cifrele mâinii stângi:
- **p** (pulgar) = **degetul mare** → corzile de bas: 6, 5, 4
- **i** (indice) = **arătătorul** → coarda 3
- **m** (medio) = **mijlociul** → coarda 2
- **a** (anular) = **inelarul** → coarda 1

Așa fiecare deget are „coarda lui” și mâna stă pe loc. Degetul mare cântă **basul acordului** – nota lui de bază, pe coarda cea mai groasă a acordului.`,
        },
        { type: 'widget', widget: 'pima' },
        {
          type: 'tip',
          text: 'Ciupește coarda trăgând degetul spre palmă (i, m, a), iar degetul mare împinge în jos, spre podea. Încheietura stă relaxată, deasupra corzilor, fără să se sprijine pe ele.',
        },
        {
          type: 'exercise',
          title: 'p-i-m-a pe corzi libere, apoi pe acord',
          minutes: 4,
          steps: [
            'Pe corzile libere: p pe coarda 5, apoi i, m, a pe corzile 3, 2, 1. Repetă de 20 de ori.',
            'Pune acordul Am și cântă același model.',
            'Treci la C: degetul mare se mută tot pe coarda 5. La Em și G se mută pe coarda 6.',
            'Încearcă modelul „ciupitură” (p+a împreună).',
          ],
        },
      ],
      quiz: [
        {
          q: 'Ce deget e „p”?',
          options: ['Degetul mic', 'Degetul mare', 'Arătătorul'],
          answer: 1,
          explain: 'p = pulgar = degetul mare; el cântă basul.',
        },
        {
          q: 'Ce coardă ciupește de obicei „m” (mijlociul)?',
          options: ['Coarda 2', 'Coarda 5', 'Coarda 1'],
          answer: 0,
          explain: 'i = coarda 3, m = coarda 2, a = coarda 1.',
        },
        {
          q: 'Pe acordul Em, pe ce coardă cânți basul cu degetul mare?',
          options: ['Coarda 4', 'Coarda 5', 'Coarda 6'],
          answer: 2,
          explain: 'Basul e nota de bază a acordului: E, pe coarda 6.',
        },
      ],
    },
    // ------------------------------------------------------------------ 17
    {
      id: 'arpegii',
      title: 'Arpegii pe acorduri',
      summary: 'Modele de arpegiu pe acordurile învățate.',
      minutes: 12,
      blocks: [
        {
          type: 'text',
          text: `Un **arpegiu** e un acord cântat „desfăcut”: notele lui una după alta, nu toate deodată. E sunetul multor balade și al cântecelor de leagăn.

Acum combini fingerpicking-ul cu schimbările de acorduri. Mâna stângă ține acordul toată măsura, iar mâna dreaptă cântă modelul. La acord nou, **degetul mare** trece pe basul noului acord.

Basurile de ținut minte:
- **Coarda 6**: E, Em, G, F (cu barré)
- **Coarda 5**: A, Am, C
- **Coarda 4**: D, Dm, „F mic”`,
        },
        { type: 'widget', widget: 'arpeggios' },
        {
          type: 'exercise',
          title: 'Arpegii pe progresii',
          minutes: 6,
          steps: [
            'Alege „Am → E” și modelul p-i-m-a. Cântă rar, la 50–60 bpm.',
            'Treci la „C → Am → F → G” cu modelul „val” (p-i-m-a-m-i).',
            'Încearcă „Arpegiu de vals” pe „G → Em → C → D”.',
            'Ascultă-ți basul: trebuie să fie puțin mai tare decât restul notelor.',
          ],
        },
        {
          type: 'tip',
          text: 'Dacă F-ul (barré) e încă greu, folosește „F mic” (fără barré) din biblioteca de acorduri – sună foarte bine în arpegii.',
        },
      ],
      quiz: [
        {
          q: 'Ce este un arpegiu?',
          options: ['Un acord cu notele cântate una după alta', 'Un acord foarte tare', 'O gamă rapidă'],
          answer: 0,
          explain: 'Arpegiu = acord „desfăcut”, notă cu notă.',
        },
        {
          q: 'Pe ce coardă e basul acordului C?',
          options: ['Coarda 6', 'Coarda 5', 'Coarda 4'],
          answer: 1,
          explain: 'La C, nota C de bază e pe coarda 5, tasta 3.',
          chord: 'C',
        },
        {
          q: 'Ce face mâna stângă în timpul unui arpegiu?',
          options: ['Schimbă nota la fiecare ciupitură', 'Ține acordul toată măsura', 'Stă pe genunchi'],
          answer: 1,
          explain: 'Ții acordul apăsat, iar mâna dreaptă alege ce coarde cântă.',
        },
      ],
    },
  ],
}
