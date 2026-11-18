import type { ComponentType } from 'react'
import type { WidgetName } from '../../data/lessons/types'
import { GuitarAnatomy } from '../widgets/GuitarAnatomy'
import { Posture } from '../widgets/Posture'
import { StringsWidget, FingersWidget } from '../widgets/StringsAndFingers'
import { ChordReading, TabReading } from '../widgets/Reading'
import { Tuner } from '../Tuner'
import { Chromatic } from '../widgets/Chromatic'
import { OneMinuteChange } from '../OneMinuteChange'
import { StrumPatternView } from '../StrumPatternView'
import { ProgressionPlayer } from '../ProgressionPlayer'
import { PickingPatternView } from '../PickingPatternView'
import { BarreDrill, BarreShapes, Pentatonic } from '../widgets/Advanced'
import { Metronome } from '../Metronome'

/**
 * Registrul widget-urilor interactive folosite în lecții.
 * Pentru un widget nou: creează componenta și adaug-o aici.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WIDGETS: Partial<Record<WidgetName, ComponentType<any>>> = {
  anatomy: GuitarAnatomy,
  posture: Posture,
  strings: StringsWidget,
  fingers: FingersWidget,
  chordReading: ChordReading,
  tabReading: TabReading,
  tuner: Tuner,
  metronome: Metronome,
  counting: (p: Record<string, unknown>) => <Metronome initialBpm={60} showSubdivision {...p} />,
  chromatic: Chromatic,
  oneMinute: OneMinuteChange,
  strumDown: (p: Record<string, unknown>) => <StrumPatternView patternIds={['jos-4', 'jos-8', 'jos-sus']} {...p} />,
  strumPatterns: StrumPatternView,
  progressions: ProgressionPlayer,
  pima: (p: Record<string, unknown>) => <PickingPatternView patternIds={['pima', 'pami', 'pinch']} sets={['Am', 'C', 'Em', 'G']} {...p} />,
  arpeggios: PickingPatternView,
  barreDrill: BarreDrill,
  barreShapes: BarreShapes,
  pentatonic: Pentatonic,
}

export function WidgetBlock({ name, props }: { name: WidgetName; props?: Record<string, unknown> }) {
  const W = WIDGETS[name]
  if (!W) return <div className="card text-center text-muted">Exercițiu interactiv „{name}” – în curând</div>
  return <W {...(props ?? {})} />
}
