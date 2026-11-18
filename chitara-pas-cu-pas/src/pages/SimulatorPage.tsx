import { PageHeader } from '../components/PageHeader'
import { Guitar3D } from '../components/three/Guitar3D'

/** Simulatorul 3D: alegi un acord și îl vezi/auzi pe o chitară 3D. */
export function SimulatorPage() {
  return (
    <div>
      <PageHeader title="Simulator 3D" subtitle="Rotește chitara, alege unghiul și atinge corzile." />
      <Guitar3D chord="C" height={380} />
    </div>
  )
}
