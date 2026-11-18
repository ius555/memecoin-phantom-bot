/** Rutine zilnice de practică (10 / 20 / 30 de minute). */
export interface RoutineTask {
  id: string
  title: string
  minutes: number
  description: string
  /** ruta din aplicație unde faci exercițiul */
  to: string
}

export interface Routine {
  minutes: 10 | 20 | 30
  title: string
  tasks: RoutineTask[]
}

const t = (id: string, title: string, minutes: number, description: string, to: string): RoutineTask => ({
  id,
  title,
  minutes,
  description,
  to,
})

export const ROUTINES: Routine[] = [
  {
    minutes: 10,
    title: 'Scurt și zilnic',
    tasks: [
      t('tune', 'Acordează chitara', 1, 'Verifică toate cele 6 corzi cu acordorul.', '/exersare/acordor'),
      t('warmup', 'Încălzire 1-2-3-4', 2, 'Exercițiul cromatic, încet, cu metronomul la 60.', '/exersare/metronom'),
      t('changes', 'Schimbări de acorduri', 3, 'Un „one-minute change” pe perechea care ți se pare cea mai grea.', '/exersare/schimbari'),
      t('lesson', 'Lecția curentă', 4, 'Continuă cursul de unde ai rămas.', '/curs'),
    ],
  },
  {
    minutes: 20,
    title: 'Echilibrat',
    tasks: [
      t('tune', 'Acordează chitara', 1, 'Verifică toate cele 6 corzi cu acordorul.', '/exersare/acordor'),
      t('warmup', 'Încălzire 1-2-3-4', 3, 'Exercițiul cromatic pe toate corzile, cu metronomul.', '/exersare/metronom'),
      t('changes', 'Schimbări de acorduri', 4, 'Două runde „one-minute change” pe perechi diferite.', '/exersare/schimbari'),
      t('strum', 'Ritm și strumming', 4, 'Un model de strumming pe o progresie, în buclă.', '/exersare/progresii'),
      t('lesson', 'Lecția curentă', 5, 'Continuă cursul de unde ai rămas.', '/curs'),
      t('ear', 'Test de auz', 3, 'Ghicește acordurile după ureche.', '/exersare/auz'),
    ],
  },
  {
    minutes: 30,
    title: 'Sesiune completă',
    tasks: [
      t('tune', 'Acordează chitara', 1, 'Verifică toate cele 6 corzi cu acordorul.', '/exersare/acordor'),
      t('warmup', 'Încălzire 1-2-3-4', 4, 'Exercițiul cromatic, urcă tempoul cu 5 bpm față de ieri.', '/exersare/metronom'),
      t('changes', 'Schimbări de acorduri', 5, 'Trei runde „one-minute change”.', '/exersare/schimbari'),
      t('game', 'Jocul de schimbări', 5, 'Schimbă la timp pe o progresie și adună puncte.', '/exersare/joc'),
      t('lesson', 'Lecția curentă', 8, 'Continuă cursul de unde ai rămas.', '/curs'),
      t('song', 'Un cântec', 5, 'Cântă un cântec din colecție, de la cap la coadă.', '/cantece'),
      t('ear', 'Test de auz', 2, 'Ghicește acordurile după ureche.', '/exersare/auz'),
    ],
  },
]
