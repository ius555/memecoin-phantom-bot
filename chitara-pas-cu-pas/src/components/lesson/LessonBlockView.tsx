import type { LessonBlock } from '../../data/lessons/types'
import { RichText } from '../RichText'
import { ExerciseCard } from './ExerciseCard'
import { ChordDiagram } from '../ChordDiagram'
import { WidgetBlock } from './WidgetBlock'
import { TabView } from '../TabView'

/** Afișează un bloc de conținut al lecției, după tipul lui. */
export function LessonBlockView({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'text':
      return <RichText text={block.text} />
    case 'tip':
      return (
        <aside
          className={`flex gap-3 rounded-2xl border p-4 ${
            block.tone === 'warn' ? 'border-warn/40 bg-warn/10' : 'border-primary/30 bg-primary-soft'
          }`}
        >
          <span className="text-xl" aria-hidden>
            {block.tone === 'warn' ? '⚠️' : '💡'}
          </span>
          <div className="min-w-0 flex-1">
            <RichText text={block.text} />
          </div>
        </aside>
      )
    case 'chords':
      return (
        <figure>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {block.chords.map((c) => (
              <div key={c} className="card !p-2">
                <ChordDiagram chord={c} playable />
              </div>
            ))}
          </div>
          {block.caption && <figcaption className="mt-2 text-center text-sm text-muted">{block.caption}</figcaption>}
        </figure>
      )
    case 'tab':
      return <TabView tab={block.tab} title={block.title} bpm={block.bpm} />
    case 'exercise':
      return <ExerciseCard title={block.title} steps={block.steps} minutes={block.minutes} />
    case 'widget':
      return <WidgetBlock name={block.widget} props={block.props} />
  }
}
