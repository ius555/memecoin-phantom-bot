import * as THREE from 'three';

const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);

/** Materiale comune tuturor pieselor. Sunt partajate, deci nu le modifica per instanță. */
export const MAT = {
  // plastic
  plasticBlack: std({ color: 0x19191b, roughness: 0.48 }),
  plasticMatte: std({ color: 0x202023, roughness: 0.82 }),
  plasticGray: std({ color: 0x6f7175, roughness: 0.6 }),
  plasticBlue: std({ color: 0x1a55c0, roughness: 0.42 }),
  plasticWhite: std({ color: 0xeceae4, roughness: 0.5 }),
  plasticBeige: std({ color: 0xd9cfb8, roughness: 0.6 }),
  // capsule de circuite integrate
  epoxy: std({ color: 0x141416, roughness: 0.6 }),
  substrate: std({ color: 0x23463a, roughness: 0.55 }),
  // metale
  steel: std({ color: 0xd3d6da, metalness: 1, roughness: 0.27 }),
  steelDark: std({ color: 0x8b8f95, metalness: 1, roughness: 0.42 }),
  aluminium: std({ color: 0xdcdee2, metalness: 1, roughness: 0.2 }),
  gold: std({ color: 0xe9b655, metalness: 1, roughness: 0.26 }),
  tin: std({ color: 0xd3d5d8, metalness: 1, roughness: 0.36 }),
  solder: std({ color: 0xe6e8ea, metalness: 1, roughness: 0.16 }),
  copper: std({ color: 0xc87a45, metalness: 1, roughness: 0.35 }),
  // pasive
  mlcc: std({ color: 0xa98457, roughness: 0.62 }),
  chipResistor: std({ color: 0x101011, roughness: 0.55 }),
  ferrite: std({ color: 0x3a3b3f, roughness: 0.75 }),
  polyfuse: std({ color: 0x4a6b3a, roughness: 0.55 }),
  ceramicWhite: std({ color: 0xe6e2d6, roughness: 0.55 }),
  // cavități
  dark: std({ color: 0x050506, roughness: 0.95 }),
  // PCB
  fr4Edge: std({ color: 0x9c9a5e, roughness: 0.82 }),
};

export const LED_COLORS: Record<string, { lens: number; glow: number }> = {
  red: { lens: 0xd9534a, glow: 0xff3b2f },
  green: { lens: 0x5fbf6a, glow: 0x39ff6a },
  yellow: { lens: 0xe0c65a, glow: 0xffd23a },
  orange: { lens: 0xe0a04a, glow: 0xff9a2a },
  blue: { lens: 0x5a8fe0, glow: 0x3a8cff },
  white: { lens: 0xe8e6da, glow: 0xffffff },
};

/** Lentila unui LED: material propriu pentru fiecare instanță, ca să poată fi aprins separat. */
export function ledLensMaterial(color: string) {
  const c = LED_COLORS[color] ?? LED_COLORS.red;
  return new THREE.MeshStandardMaterial({
    color: c.lens,
    roughness: 0.35,
    transparent: true,
    opacity: 0.86,
    emissive: c.glow,
    emissiveIntensity: 0,
  });
}

/** Culorile funcțiilor de pini, comune modului pinout din 3D și legendei din interfață. */
export const PIN_COLORS: Record<string, string> = {
  power: '#e5484d',
  gnd: '#2b2b2f',
  digital: '#3b82f6',
  pwm: '#f59e0b',
  analog: '#22a06b',
  i2c: '#a855f7',
  spi: '#ec4899',
  uart: '#14b8a6',
  other: '#9ca3af',
};
