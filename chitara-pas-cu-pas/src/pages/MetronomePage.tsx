import { PageHeader } from '../components/PageHeader'
import { Metronome } from '../components/Metronome'

/** Pagina metronomului, cu sfaturi de folosire. */
export function MetronomePage() {
  return (
    <div>
      <PageHeader back={true} title="Metronom" subtitle="Ține ritmul constant – cel mai bun prieten al chitaristului." />
      <Metronome initialBpm={70} />
      <div className="card mt-4 space-y-2 text-sm leading-relaxed">
        <p>
          <strong>Regula de aur:</strong> începe atât de rar încât să nu greșești deloc. Crește tempoul cu 5 bpm doar după
          ce reușești de 3–5 ori la rând fără greșeli.
        </p>
        <p>
          <strong>Tap:</strong> atinge butonul în ritmul unui cântec ca să afli tempoul lui.
        </p>
      </div>
    </div>
  )
}
