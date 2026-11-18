/** Stub temporar (etapa 1) – tabulatorul SVG vine în etapa 3. */
export function TabView({ tab, title }: { tab: string; title?: string; bpm?: number }) {
  return (
    <figure className="card">
      {title && <figcaption className="mb-2 font-bold">{title}</figcaption>}
      <pre className="overflow-x-auto font-mono text-sm">{tab}</pre>
    </figure>
  )
}
