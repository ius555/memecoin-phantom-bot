/**
 * Puntea dintre scena 3D și stratul HTML de deasupra ei (etichete, tooltip).
 * Componentele React doar își înregistrează elementele aici; pozițiile le scrie,
 * la fiecare cadru, `LabelsDriver`, direct în DOM.
 */

export interface LabelEntry {
  el: HTMLElement;
  path: SVGPathElement;
  dot: SVGCircleElement;
  /** -1 = coloana din stânga, 1 = cea din dreapta. */
  side: -1 | 1;
  y: number;
  placed: boolean;
}

export const overlay = {
  labels: new Map<string, LabelEntry>(),
  /** Tooltip-ul ancorat de piesa atinsă (ecrane tactile). */
  touchTip: null as HTMLElement | null,
};
