import type CameraControlsImpl from 'camera-controls';
import type * as THREE from 'three';
import { create } from 'zustand';
import type { BoardModel } from '../three/buildBoard';

/**
 * Referințe directe către obiectele scenei, pentru codul care rulează la fiecare cadru
 * (etichete, tooltip, cameră). Nu trec prin React, ca să nu provoace re-randări.
 */
export const stage = {
  renderer: null as THREE.WebGLRenderer | null,
  controls: null as CameraControlsImpl | null,
  model: null as BoardModel | null,
  /** Grupul care ține placa activă (pentru transformarea în coordonate de lume). */
  boardGroup: null as THREE.Object3D | null,
  /** 0 = cu fața în sus, 1 = întoarsă. */
  flip: 0,
};

interface StageState {
  /** Gabaritul plăcii active, pentru încadrarea camerei. */
  fit: { radius: number; height: number };
  setFit(fit: { radius: number; height: number }): void;
  /** Marginea de jos a cardului plăcii (px); 0 când cardul nu e pe ecran. Camera și etichetele îl ocolesc. */
  cardBottom: number;
  setCardBottom(px: number): void;
}

export const useStage = create<StageState>((set) => ({
  fit: { radius: 55, height: 16 },
  setFit: (fit) => set({ fit }),
  cardBottom: 0,
  setCardBottom: (px) => set((s) => (Math.abs(s.cardBottom - px) < 1 ? s : { cardBottom: Math.round(px) })),
}));
