import type { Level } from './types'

/** Nivelul 4 – Fingerpicking */
export const level4: Level = {
  id: 'nivel-4',
  number: 4,
  title: 'Fingerpicking',
  subtitle: 'Cânți cu degetele',
  icon: '🤌',
  lessons: [
    {
      id: 'pima',
      title: 'Notația p-i-m-a',
      summary: 'Ce deget ciupește ce coardă; modele simple.',
      minutes: 10,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'arpegii',
      title: 'Arpegii pe acorduri',
      summary: 'Modele de arpegiu pe acordurile învățate.',
      minutes: 12,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
  ],
}
