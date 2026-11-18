import type { Level } from './types'

/** Nivelul 1 – Primele sunete */
export const level1: Level = {
  id: 'nivel-1',
  number: 1,
  title: 'Primele sunete',
  subtitle: 'Degete puternice, sunet curat',
  icon: '🌱',
  lessons: [
    {
      id: 'o-singura-coarda',
      title: 'Exerciții pe o singură coardă',
      summary: 'Apăsarea corectă pe tastă, fără bâzâit.',
      minutes: 8,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'cromatic',
      title: 'Exercițiul 1-2-3-4',
      summary: 'Încălzirea degetelor cu exercițiul cromatic.',
      minutes: 8,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'ritm-de-baza',
      title: 'Ritm de bază',
      summary: 'Metronomul și numărătoarea „1 și 2 și 3 și 4 și”.',
      minutes: 8,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
  ],
}
