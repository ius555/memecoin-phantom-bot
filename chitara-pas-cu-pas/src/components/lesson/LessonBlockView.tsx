import type { LessonBlock } from '../../data/lessons/types'
import { RichText } from '../RichText'
import { ExerciseCard } from './ExerciseCard'
import { ChordBlock } from '../ChordViews'
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
      return <ChordBlock chords={block.chords} caption={block.caption} />
    case 'tab':
      return <TabView tab={block.tab} title={block.title} bpm={block.bpm} />
    case 'exercise':
      return <ExerciseCard title={block.title} steps={block.steps} minutes={block.minutes} />
    case 'widget':
      return <WidgetBlock name={block.widget} props={block.props} />
  }
}
