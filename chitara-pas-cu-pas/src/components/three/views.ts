/**
 * Unghiurile de cameră ale simulatorului.
 *
 * În loc să mutăm camera "peste cap" (ceea ce ar încurca controlul cu degetul), camera
 * privește mereu din față, iar CHITARA se rotește în poziția potrivită. Tranziția dintre
 * unghiuri interpolează rotația modelului, poziția camerei și punctul privit.
 *
 * Fișierul nu importă Three.js, ca să rămână în pachetul mic (partea 3D se încarcă la cerere).
 */
import { SCALE, fretX } from './geometry'

export type ViewId = 'player' | 'front' | 'top'

export interface ViewDef {
  id: ViewId
  label: string
  /** rotația modelului, în grade, și ordinea rotațiilor */
  rotation: [number, number, number, 'XYZ' | 'YXZ' | 'ZXY']
  /** punctul privit, în coordonatele modelului (înainte de rotire) */
  focus: [number, number, number]
  /** câți cm din chitară trebuie să încapă pe lățimea ecranului */
  fitWidth: number
}

export const VIEWS: Record<ViewId, ViewDef> = {
  // Cum vezi grifului când cânți: privești de deasupra, dinspre coarda groasă.
  // Coarda 1 apare sus, coarda 6 jos (ca într-un tab), capul în stânga, iar grifului e înclinat spre tine.
  player: { id: 'player', label: 'Din perspectiva mea', rotation: [64, -18, 0, 'YXZ'], focus: [fretX(4) + 1, 0, 0], fitWidth: 32 },
  // Cum te vede publicul: fața chitarei spre cameră, capul în dreapta, coarda 6 sus.
  front: { id: 'front', label: 'Din față', rotation: [90, 0, 180, 'ZXY'], focus: [SCALE * 0.52, 0, 0], fitWidth: 112 },
  // Grifului văzut drept de sus, ca în diagrama orizontală / tab: coarda 1 sus, capul în stânga.
  top: { id: 'top', label: 'De sus pe grif', rotation: [90, 0, 0, 'XYZ'], focus: [fretX(4.5) - 2, 0, 0], fitWidth: 38 },
}

export const VIEW_ORDER: ViewId[] = ['player', 'front', 'top']
