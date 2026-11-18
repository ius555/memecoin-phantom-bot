import type { Level } from './types'

/** Nivelul 5 – Avansat */
export const level5: Level = {
  id: 'nivel-5',
  number: 5,
  title: 'Avansat',
  subtitle: 'Barré, culori noi și solo',
  icon: '🏔️',
  lessons: [
    {
      id: 'acordul-f',
      title: 'Acordul F și barré-ul',
      summary: 'Exerciții pregătitoare și primul barré.',
      minutes: 15,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'barre-mobile',
      title: 'Acorduri barré mobile',
      summary: 'Forma E și forma A, oriunde pe grif.',
      minutes: 12,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'sus-7-maj7',
      title: 'Acorduri sus2, sus4, 7, maj7',
      summary: 'Culori noi pentru acordurile tale.',
      minutes: 12,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'pentatonica',
      title: 'Gama pentatonică',
      summary: 'Primul tău „solo”: pentatonica minoră.',
      minutes: 12,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
  ],
}
