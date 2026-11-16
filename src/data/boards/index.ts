import type { BoardSpec } from '../types';
import { arduinoUnoR3 } from './arduino-uno-r3';
import { raspberryPi4 } from './raspberry-pi-4';

/**
 * Toate plăcile, în ordinea din carusel.
 * Faza 3 adaugă restul până la 16: fiecare placă este un fișier de date în acest dosar.
 */
export const BOARDS: BoardSpec[] = [arduinoUnoR3, raspberryPi4];

export const DEFAULT_BOARD = raspberryPi4.id;

export function getBoard(id: string): BoardSpec {
  return BOARDS.find((b) => b.id === id) ?? BOARDS[0];
}

/** Piesele despre care se poate afla ceva: au etichetă și reacționează la atingere. */
export function labelledParts(board: BoardSpec) {
  return board.components.filter((c) => !c.decor);
}
