/**
 * Formatul de date pentru plăci.
 *
 * Toate cotele sunt în milimetri. Originea unui PCB este colțul din stânga-jos,
 * privit de sus: x spre dreapta, y spre „nord" (în 3D: X = x - w/2, Z = -(y - h/2)).
 * Rotațiile sunt în grade, în sens trigonometric, privite de sus.
 */

export type Vec2 = [number, number];

export type Difficulty = 'incepator' | 'mediu' | 'avansat';

/** Funcția principală a unui pin — decide culoarea în modul pinout. */
export type PinFn = 'power' | 'gnd' | 'digital' | 'pwm' | 'analog' | 'i2c' | 'spi' | 'uart' | 'other';

export interface PinSpec {
  /** Numărul fizic sau poziția, așa cum apare în tabel. */
  n: string;
  /** Numele pinului: „GPIO18", „D13", „5V". */
  label: string;
  fn: PinFn;
  /** A doua funcție importantă (apare ca punct mic în interiorul marcajului). */
  alt?: PinFn;
  /** Detalii scurte: „PWM0 · PCM_CLK". */
  note?: string;
}

export type LedColor = 'red' | 'green' | 'yellow' | 'orange' | 'blue' | 'white';

/** Modelele procedurale disponibile. Fiecare `kind` are un constructor în src/three/parts. */
export type PartModel =
  | {
      kind: 'chip';
      pkg: 'bga' | 'bga-lid' | 'qfn' | 'qfp' | 'soic' | 'sot223' | 'sot23' | 'dip';
      /** Lățimea (x) și lungimea (y) corpului, în mm. */
      w: number;
      l: number;
      h?: number;
      /** Numărul total de pini (pentru capsulele cu pini vizibili). */
      pins?: number;
      /** Rândurile gravate pe capsulă. */
      marking?: string[];
    }
  | { kind: 'shield'; w: number; l: number; h?: number; marking?: string[] }
  | { kind: 'led'; color: LedColor; size?: '0603' | '0805' }
  | { kind: 'usb-c' }
  | { kind: 'micro-hdmi' }
  | { kind: 'audio-jack' }
  | { kind: 'fpc'; pins: number }
  | { kind: 'header'; rows: number; cols: number; female?: boolean }
  | { kind: 'rj45' }
  | { kind: 'usb-a-dual'; color: 'black' | 'blue' }
  | { kind: 'usb-b' }
  | { kind: 'barrel-jack' }
  | { kind: 'crystal'; pkg: 'hc49' | 'smd'; marking?: string }
  | { kind: 'ecap'; d: number; h: number; marking?: string[] }
  | { kind: 'button' }
  | { kind: 'microsd' }
  | {
      kind: 'block';
      w: number;
      l: number;
      h: number;
      look: 'inductor' | 'diode' | 'polyfuse' | 'resonator';
      marking?: string[];
    };

export interface ComponentSpec {
  id: string;
  /** Numele complet, în engleză, ca în datasheet. */
  name: string;
  /** Etichetă scurtă pentru ecrane înguste. */
  short: string;
  /** Indicativul de pe silkscreen: „U1", „J8". */
  ref?: string;
  model: PartModel;
  at: Vec2;
  rot?: number;
  side?: 'top' | 'bottom';
  /** `false` = piesă SMD care vine gata lipită (nu apare în kitul de asamblare). */
  kit?: boolean;
  /** Piesă de decor: se vede pe placă, dar nu are etichetă și nu reacționează la atingere. */
  decor?: boolean;
  /** Ce face piesa (română). Lipsește doar la piesele de decor. */
  what?: string;
  specs?: [string, string][];
  /** La ce pini / linii se leagă (română). */
  connects?: string;
  /** Pinii unui header, în ordinea modelului (vezi parts/headers.ts). */
  pins?: PinSpec[];
}

export type PassiveKind = 'c0402' | 'r0402' | 'c0603' | 'r0603' | 'c0805';

export interface PassiveSpec {
  kind: PassiveKind;
  at: Vec2;
  rot?: number;
  side?: 'top' | 'bottom';
  /** Repetă piesa de `n` ori cu pasul `step`. */
  n?: number;
  step?: Vec2;
}

export type PcbArt =
  | {
      t: 'text';
      s: string;
      at: Vec2;
      size: number;
      rot?: number;
      align?: 'left' | 'center' | 'right';
      font?: 'sans' | 'mono' | 'serif';
      weight?: number;
      side?: 'top' | 'bottom';
    }
  | { t: 'line'; pts: Vec2[]; w?: number; side?: 'top' | 'bottom' }
  | { t: 'rect'; at: Vec2; size: Vec2; r?: number; fill?: boolean; w?: number; side?: 'top' | 'bottom' }
  | { t: 'circle'; at: Vec2; r: number; fill?: boolean; w?: number; side?: 'top' | 'bottom' }
  /** Zonă fără cupru (mai închisă), de ex. sub antenă. */
  | { t: 'bare'; pts: Vec2[]; side?: 'top' | 'bottom' }
  /** Cupru expus (aurit), de ex. antena desenată pe PCB sau pad-uri de test. */
  | { t: 'copper'; pts: Vec2[]; w?: number; side?: 'top' | 'bottom' };

/** Un mănunchi de trasee paralele care urmează un traseu frânt. Pur vizual. */
export interface TraceSpec {
  pts: Vec2[];
  n?: number;
  pitch?: number;
  w?: number;
  side?: 'top' | 'bottom';
}

export interface PcbSpec {
  w: number;
  h: number;
  /** Contur poligonal; dacă lipsește, placa e un dreptunghi cu colțuri rotunjite de raza `radius`. */
  outline?: Vec2[];
  radius?: number;
  thickness?: number;
  /** Culoarea măștii de lipire. */
  color: string;
  holes: { at: Vec2; d: number; ring?: number }[];
  art?: PcbArt[];
  traces?: TraceSpec[];
}

export interface BoardSpecs {
  mcu: string;
  clock: string;
  flash: string;
  ram: string;
  /** Tensiunea logică. */
  voltage: string;
  /** Alimentare. */
  power: string;
  digital: number;
  analog: number;
  pwm: number;
  pinNote?: string;
  wifi: string | null;
  bluetooth: string | null;
  usb: string;
  other?: string;
}

export interface BoardSpec {
  id: string;
  name: string;
  family: string;
  year: number;
  difficulty: Difficulty;
  /** O frază de descriere. */
  tagline: string;
  /** Pentru ce se potrivește. */
  bestFor: string;
  specs: BoardSpecs;
  pcb: PcbSpec;
  components: ComponentSpec[];
  passives?: PassiveSpec[];
  /** Ordinea de asamblare (id-uri), „piesele joase întâi". */
  assemblyOrder: string[];
  /** LED-ul care se aprinde la finalul asamblării. */
  powerLed?: string;
}
