import type { Level } from './types'

/** Nivelul 0 – Înainte să cânți */
export const level0: Level = {
  id: 'nivel-0',
  number: 0,
  title: 'Înainte să cânți',
  subtitle: 'Cunoaște-ți instrumentul',
  icon: '🪵',
  lessons: [
    {
      id: 'partile-chitarei',
      title: 'Părțile chitarei',
      summary: 'Atinge fiecare parte a chitarei și află ce rol are.',
      minutes: 5,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'postura',
      title: 'Cum ții chitara și pana',
      summary: 'Postura corectă, pana și poziția mâinii stângi.',
      minutes: 7,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'corzile-si-degetele',
      title: 'Corzile și degetele',
      summary: 'Numele corzilor (E A D G B E) și numerotarea degetelor.',
      minutes: 6,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'acordarea',
      title: 'Acordarea chitarei',
      summary: 'Acordorul cu microfon: aduci fiecare coardă la nota corectă.',
      minutes: 8,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
    {
      id: 'diagrame-si-tab',
      title: 'Diagrame de acord și tabulator',
      summary: 'Cum citești o diagramă de acord și un tab.',
      minutes: 8,
      blocks: [{ type: 'text', text: 'Conținut în lucru.' }],
      quiz: [{ q: 'Ești gata?', options: ['Da', 'Nu'], answer: 0 }],
    },
  ],
}
