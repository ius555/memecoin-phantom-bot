import { PageHeader } from '../components/PageHeader'
import { Tuner } from '../components/Tuner'

/** Pagina acordorului. */
export function TunerPage() {
  return (
    <div>
      <PageHeader back={true} title="Acordor" subtitle="Acordaj standard: E A D G B E" />
      <Tuner />
      <div className="card mt-4 text-sm leading-relaxed">
        <strong>Cum acordezi:</strong> ciupește o coardă și las-o să sune. Dacă acul e în stânga, nota e prea joasă: strânge
        coarda rotind cheia încet. Dacă e în dreapta, slăbește-o. Când acul stă în mijloc și devine verde, treci la coarda
        următoare.
      </div>
    </div>
  )
}
