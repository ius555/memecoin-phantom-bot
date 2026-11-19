/**
 * Unghiurile de cameră ale simulatorului.
 *
 * În loc să mutăm camera "peste cap" (ceea ce ar încurca controlul cu degetul), camera
 * privește mereu din față, iar CHITARA se rotește în poziția potrivită. Tranziția dintre
 * unghiuri interpolează rotația modelului, poziția camerei și punctul privit.
 *
 * Fișierul nu importă Three.js, ca să rămână în pachetul mic (partea 3D se încarcă la cerere).
 */
import { STRUM_X } from './geometry'

export type ViewId = 'fingers' | 'strum' | 'top'

export interface ViewDef {
  id: ViewId
  label: string
  /** rotația modelului, în grade, și ordinea rotațiilor */
  rotation: [number, number, number, 'XYZ' | 'YXZ' | 'ZXY']
  /** punctul privit, în coordonatele modelului (înainte de rotire) */
  focus: [number, number, number]
  /** câți cm din chitară trebuie să încapă pe lățimea ecranului */
  fitWidth: number
  /** true = camera se centrează pe acordul afișat (zona de grif cu degete) */
  followChord: boolean
}

export const VIEWS: Record<ViewId, ViewDef> = {
  // Aproape de mâna de pe grif, oblic, din perspectiva ta: vezi cum apasă fiecare deget coarda.
  // Coarda 1 apare sus, coarda 6 jos (ca într-un tab), capul în stânga.
  fingers: { id: 'fingers', label: 'Degete', rotation: [56, -14, 0, 'YXZ'], focus: [0, 0, 0], fitWidth: 20, followChord: true },
  // Mâna cealaltă: zona gurii chitarei, unde lovești corzile cu pana.
  strum: { id: 'strum', label: 'Mâna cu pana', rotation: [58, 14, 0, 'YXZ'], focus: [STRUM_X + 1, 0, 0], fitWidth: 30, followChord: false },
  // Grifului văzut drept de sus, ca diagrama orizontală / tab: coarda 1 sus, capul în stânga.
  top: { id: 'top', label: 'De sus', rotation: [90, 0, 0, 'XYZ'], focus: [0, 0, 0], fitWidth: 20, followChord: true },
}

export const VIEW_ORDER: ViewId[] = ['fingers', 'strum', 'top']
