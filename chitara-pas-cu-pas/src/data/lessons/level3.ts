import type { Level } from './types'

/** Nivelul 3 – Ritm și strumming */
export const level3: Level = {
  id: 'nivel-3',
  number: 3,
  title: 'Ritm și strumming',
  subtitle: 'Mâna dreaptă intră în joc',
  icon: '🥁',
  lessons: [
    {
      id: 'strum-jos-sus',
      title: 'Strumming în jos, apoi jos-sus',
      summary: 'Mișcarea de pendul a mâinii drepte.',
      minutes: 10,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'modele-strumming',
      title: 'Modele de strumming',
      summary: 'D-DU-UDU și alte modele, cu săgeți animate.',
      minutes: 12,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'progresii',
      title: 'Primele progresii',
      summary: 'I–V–vi–IV și I–vi–IV–V, cu redare audio.',
      minutes: 12,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
  ],
}
