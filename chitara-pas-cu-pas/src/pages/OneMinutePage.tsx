import { PageHeader } from '../components/PageHeader'
import { OneMinuteChange } from '../components/OneMinuteChange'

/** Pagina exercițiului „one-minute change”. */
export function OneMinutePage() {
  return (
    <div>
      <PageHeader back={true} title="One-minute change" subtitle="Câte schimbări de acord reușești într-un minut?" />
      <OneMinuteChange />
    </div>
  )
}
