import type { ComponentType } from 'react'
import type { WidgetName } from '../../data/lessons/types'

/**
 * Registrul widget-urilor interactive folosite în lecții.
 * Pentru un widget nou: creează componenta și adaug-o aici.
 */
const WIDGETS: Partial<Record<WidgetName, ComponentType<Record<string, unknown>>>> = {}

export function WidgetBlock({ name, props }: { name: WidgetName; props?: Record<string, unknown> }) {
  const W = WIDGETS[name]
  if (!W) return <div className="card text-center text-muted">Exercițiu interactiv „{name}” – în curând</div>
  return <W {...(props ?? {})} />
}
