/** Setări de calitate alese o singură dată, după tipul dispozitivului. */
export interface Quality {
  name: 'low' | 'high';
  /** Pixeli pe milimetru pentru textura PCB-ului. */
  ppm: number;
  /** Dimensiunea maximă a unei texturi desenate. */
  maxTex: number;
  /** Hărți de rugozitate/metal pentru PCB (pad-uri aurite lucioase). */
  pbr: boolean;
  shadowMap: number;
  maxDpr: number;
}

function detect(): Quality {
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  const small = typeof screen !== 'undefined' && Math.min(screen.width, screen.height) < 820;
  const weakCpu = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 8) <= 4;
  const low = (coarse && small) || weakCpu;
  return low
    ? { name: 'low', ppm: 12, maxTex: 1536, pbr: false, shadowMap: 1024, maxDpr: 1.5 }
    : { name: 'high', ppm: 22, maxTex: 2048, pbr: true, shadowMap: 2048, maxDpr: 2 };
}

export const QUALITY: Quality = detect();
export const IS_TOUCH = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
