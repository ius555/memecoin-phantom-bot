/**
 * Dimensiunile chitarei 3D și transformarea "coardă/tastă → poziție în spațiu".
 * Unitatea: 1 = 1 cm (proporții de chitară acustică reală, simplificate).
 *
 * Sistemul de coordonate al MODELULUI (înainte de rotirile camerei):
 *   x = de-a lungul gâtului: prăguşul la x = 0, căluşul la x = SCALE (corpul e spre +x, capul spre −x)
 *   y = în sus, perpendicular pe fața chitarei (suprafața grifului e la y = 0)
 *   z = de-a curmezișul: coarda 6 (Mi grav) la +z, coarda 1 (Mi acut) la −z
 * Funcții pure – fără Three.js, ca să poată fi testate simplu.
 */

/** Lungimea de scală (de la prăguș la căluș) */
export const SCALE = 64
export const FRET_COUNT = 19
/** Distanța dintre corzile de margine la prăguș și la căluș */
export const SPAN_NUT = 3.6
export const SPAN_SADDLE = 5.4
/** Înălțimea corzilor deasupra grifului */
export const STRING_Y = 0.42
/** Lățimea grifului la prăguș și la ultima tastă */
export const NECK_W_NUT = 4.5
export const NECK_W_END = 5.8
/** Fața corpului (placa de rezonanță) e puțin sub grif */
export const TOP_Y = -1
export const BODY_DEPTH = 9
/** Unde se lipește gâtul de corp (tasta 14) */
export const BODY_START = fretX(14) - 1
export const SOUNDHOLE = { x: fretX(19) + 6.2, r: 4.6 }
/** Zona unde lovești corzile cu pana (deasupra gurii) */
export const STRUM_X = SOUNDHOLE.x + 1.5

/** Poziția barei tastei n (n = 0 → prăguşul), după formula reală: fiecare tastă e cu 2^(−1/12) mai scurtă. */
export function fretX(n: number): number {
  return SCALE * (1 - Math.pow(2, -n / 12))
}

/** Unde pui degetul pentru tasta n: puțin înaintea barei (cum se apasă corect). */
export function fingerX(n: number): number {
  if (n <= 0) return -1.6
  return fretX(n) - (fretX(n) - fretX(n - 1)) * 0.32
}

/** Distanța dintre corzi crește ușor spre căluș; z-ul corzii s la poziția x. */
export function stringZ(s: number, x: number): number {
  const t = Math.max(0, Math.min(1, x / SCALE))
  const span = SPAN_NUT + (SPAN_SADDLE - SPAN_NUT) * t
  // s = 0 (coarda 6) la +span/2, s = 5 (coarda 1) la −span/2
  return span / 2 - (s / 5) * span
}

/** Lățimea grifului la poziția x (se lărgește ușor spre corp). */
export function neckWidth(x: number): number {
  const t = Math.max(0, Math.min(1, x / fretX(FRET_COUNT)))
  return NECK_W_NUT + (NECK_W_END - NECK_W_NUT) * t
}

/** Grosimea vizuală a corzii (corzile groase sunt mai groase și în model). */
export function stringRadius(s: number): number {
  return 0.085 - s * 0.01
}

/**
 * Conturul corpului (vedere de sus), ca listă de puncte de control pentru curbe Bézier.
 * Coordonate (x, z) relative la BODY_START; corpul e simetric față de z = 0.
 * Forme: umărul de sus mai îngust, talia, partea de jos mai lată – proporții de chitară acustică.
 */
export const BODY_LEN = 50
export const BODY_OUTLINE = {
  upperHalf: 14, // jumătatea lățimii umărului de sus
  waistHalf: 11.5,
  lowerHalf: 19, // jumătatea lățimii părții de jos
}
