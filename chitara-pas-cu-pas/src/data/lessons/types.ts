/**
 * Tipurile pentru conținutul cursului.
 *
 * O lecție este o listă de "blocuri" afișate în ordine + un mini-test.
 * Pentru a adăuga o lecție nouă: adaugă un obiect `Lesson` în fișierul nivelului
 * (ex. `level2.ts`). Ordinea din fișier = ordinea de deblocare.
 */

/** Widget-uri interactive care pot fi puse într-o lecție (vezi components/lesson/WidgetBlock.tsx) */
export type WidgetName =
  | 'anatomy' // chitara interactivă: atingi o parte
  | 'posture' // ilustrații: cum ții chitara și pana
  | 'strings' // cele 6 corzi, cu sunet
  | 'fingers' // numerotarea degetelor
  | 'tuner' // acordor cu microfon
  | 'chordReading' // cum citești o diagramă
  | 'tabReading' // cum citești un tab
  | 'singleString' // exercițiu pe o coardă
  | 'chromatic' // exercițiul 1-2-3-4
  | 'metronome'
  | 'counting' // numărat "1 și 2 și"
  | 'oneMinute' // one-minute change
  | 'strumDown' // strumming jos / jos-sus
  | 'strumPatterns' // modele de strumming animate
  | 'progressions' // progresii I–V–vi–IV etc.
  | 'pima' // notația p-i-m-a
  | 'arpeggios' // arpegii pe acorduri
  | 'barreDrill' // exerciții pregătitoare barré
  | 'barreShapes' // forma E și forma A, mobile
  | 'pentatonic' // gama pentatonică pe grif

export type LessonBlock =
  /** Text simplu. Suportă **bold**, paragrafe (rând gol) și liste cu "- ". */
  | { type: 'text'; text: string }
  /** Una sau mai multe diagrame de acord, cu sunet */
  | { type: 'chords'; chords: string[]; caption?: string }
  /** Tabulator în format ASCII (6 rânduri, e→E), poate fi redat */
  | { type: 'tab'; title?: string; tab: string; bpm?: number }
  /** Componentă interactivă */
  | { type: 'widget'; widget: WidgetName; props?: Record<string, unknown> }
  /** Exercițiu practic cu pași și (opțional) cronometru */
  | { type: 'exercise'; title: string; steps: string[]; minutes?: number }
  /** Casetă de sfat sau avertisment */
  | { type: 'tip'; text: string; tone?: 'info' | 'warn' }

export interface QuizQuestion {
  q: string
  options: string[]
  /** indexul răspunsului corect */
  answer: number
  /** explicația afișată după răspuns */
  explain?: string
  /** opțional: afișează o diagramă de acord în întrebare */
  chord?: string
}

export interface Lesson {
  id: string
  title: string
  summary: string
  /** durata estimată, în minute */
  minutes: number
  blocks: LessonBlock[]
  quiz: QuizQuestion[]
}

export interface Level {
  id: string
  number: number
  title: string
  subtitle: string
  /** emoji afișat pe hartă */
  icon: string
  lessons: Lesson[]
}
