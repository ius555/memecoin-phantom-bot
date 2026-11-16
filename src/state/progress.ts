import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Tot ce trebuie ținut minte între vizite. Se salvează în localStorage. */

export interface FindBest {
  score: number;
  /** secunde */
  time: number;
}

interface ProgressState {
  /** Cel mai bun rezultat la „Găsește piesa", pe placă. */
  findBest: Record<string, FindBest>;
  /** Plăcile deja deschise. */
  seenBoards: string[];
  muted: boolean;

  saveFind(boardId: string, r: FindBest): boolean;
  markSeen(boardId: string): void;
  setMuted(m: boolean): void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      findBest: {},
      seenBoards: [],
      muted: false,

      saveFind: (boardId, r) => {
        const prev = get().findBest[boardId];
        const better = !prev || r.score > prev.score || (r.score === prev.score && r.time < prev.time);
        if (better) set({ findBest: { ...get().findBest, [boardId]: r } });
        return better;
      },
      markSeen: (boardId) => {
        if (!get().seenBoards.includes(boardId)) set({ seenBoards: [...get().seenBoards, boardId] });
      },
      setMuted: (muted) => set({ muted }),
    }),
    { name: 'laborator-robotica:progres', version: 1 },
  ),
);
