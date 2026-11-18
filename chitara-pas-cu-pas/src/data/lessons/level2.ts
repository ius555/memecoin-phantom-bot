import type { Level } from './types'

/** Nivelul 2 – Primele acorduri */
export const level2: Level = {
  id: 'nivel-2',
  number: 2,
  title: 'Primele acorduri',
  subtitle: 'Acordurile deschise de bază',
  icon: '🎸',
  lessons: [
    {
      id: 'em-am',
      title: 'Em și Am',
      summary: 'Primele două acorduri, cele mai ușoare.',
      minutes: 10,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'e-a-d',
      title: 'E, A și D',
      summary: 'Trei acorduri majore foarte folosite.',
      minutes: 12,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'c-g-dm',
      title: 'C, G și Dm',
      summary: 'Completăm setul de acorduri deschise.',
      minutes: 12,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'schimbari',
      title: 'Schimbarea dintre acorduri',
      summary: 'Exercițiul „one-minute change” cu cronometru.',
      minutes: 10,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
  ],
}
