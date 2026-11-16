import { create } from 'zustand';
import { getBoard, labelledParts } from '../../data/boards';
import { useApp } from '../../state/app';
import { useProgress } from '../../state/progress';
import { T } from '../../texte';

/** Jocul „Găsește piesa": se cere o componentă, jucătorul o atinge pe placă. */

export interface Feedback {
  kind: 'ok' | 'bad';
  partId: string;
  text: string;
  at: number;
}

interface FindState {
  phase: 'off' | 'intro' | 'play' | 'done';
  boardId: string;
  targets: string[];
  index: number;
  score: number;
  streak: number;
  /** Runde nimerite din prima. */
  hits: number;
  wrongThisRound: boolean;
  startedAt: number;
  roundAt: number;
  /** Secunde, la final. */
  total: number;
  feedback: Feedback | null;
  newBest: boolean;

  open(): void;
  start(): void;
  guess(partId: string): void;
  skip(): void;
  stop(): void;
}

const ROUNDS = 8;
let advanceTimer: ReturnType<typeof setTimeout> | undefined;

function shuffle<T>(a: T[]) {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const useFind = create<FindState>((set, get) => {
  const next = () => {
    const s = get();
    if (s.phase !== 'play') return;
    if (s.index + 1 >= s.targets.length) {
      const total = (performance.now() - s.startedAt) / 1000;
      const newBest = useProgress.getState().saveFind(s.boardId, { score: s.score, time: Math.round(total) });
      set({ phase: 'done', total, feedback: null, newBest });
    } else {
      set({ index: s.index + 1, roundAt: performance.now(), wrongThisRound: false, feedback: null });
    }
  };

  return {
    phase: 'off',
    boardId: '',
    targets: [],
    index: 0,
    score: 0,
    streak: 0,
    hits: 0,
    wrongThisRound: false,
    startedAt: 0,
    roundAt: 0,
    total: 0,
    feedback: null,
    newBest: false,

    open: () => {
      const app = useApp.getState();
      app.select(null);
      if (app.pinout) app.toggle('pinout');
      if (app.labels) app.toggle('labels');
      set({ phase: 'intro', boardId: app.boardId });
    },

    start: () => {
      const boardId = useApp.getState().boardId;
      const pool = labelledParts(getBoard(boardId)).map((c) => c.id);
      const now = performance.now();
      clearTimeout(advanceTimer);
      set({
        phase: 'play',
        boardId,
        targets: shuffle(pool).slice(0, Math.min(ROUNDS, pool.length)),
        index: 0,
        score: 0,
        streak: 0,
        hits: 0,
        wrongThisRound: false,
        startedAt: now,
        roundAt: now,
        feedback: null,
        newBest: false,
      });
    },

    guess: (partId) => {
      const s = get();
      if (s.phase !== 'play' || s.feedback?.kind === 'ok') return;
      const target = s.targets[s.index];
      const now = performance.now();
      if (partId === target) {
        const secs = (now - s.roundAt) / 1000;
        const streak = s.wrongThisRound ? 0 : s.streak + 1;
        const points = (s.wrongThisRound ? 40 : 100) + Math.max(0, Math.round(50 - secs * 5)) + Math.min(50, Math.max(0, streak - 1) * 10);
        set({
          score: s.score + points,
          streak,
          hits: s.hits + (s.wrongThisRound ? 0 : 1),
          feedback: { kind: 'ok', partId, text: `${T.find.correct} +${points}`, at: now },
        });
        clearTimeout(advanceTimer);
        advanceTimer = setTimeout(next, 850);
      } else {
        const name = getBoard(s.boardId).components.find((c) => c.id === partId)?.name ?? '';
        set({
          score: Math.max(0, s.score - 20),
          streak: 0,
          wrongThisRound: true,
          feedback: { kind: 'bad', partId, text: T.find.wrong(name), at: now },
        });
      }
    },

    skip: () => {
      if (get().phase !== 'play') return;
      clearTimeout(advanceTimer);
      set({ streak: 0 });
      next();
    },

    stop: () => {
      clearTimeout(advanceTimer);
      set({ phase: 'off', feedback: null });
    },
  };
});

// Schimbarea plăcii sau a secțiunii oprește jocul.
useApp.subscribe((s, prev) => {
  if ((s.boardId !== prev.boardId || s.section !== prev.section) && useFind.getState().phase !== 'off') {
    useFind.getState().stop();
  }
});
