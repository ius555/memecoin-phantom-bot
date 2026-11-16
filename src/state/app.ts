import { create } from 'zustand';
import { BOARDS, DEFAULT_BOARD } from '../data/boards';

export type Section = 'placi' | 'banc' | 'lectii' | 'quiz' | 'compara';
export type ViewPreset = 'trei-sferturi' | 'sus' | 'jos' | 'fata';

export interface PinHover {
  partId: string;
  index: number;
}

interface AppState {
  ready: boolean;
  section: Section;
  boardId: string;
  /** Direcția ultimei schimbări de placă (-1 stânga, +1 dreapta), pentru animație. */
  boardDir: number;
  view: ViewPreset;
  /** Crește la fiecare apăsare pe o vedere, ca aceeași vedere să poată fi re-aplicată. */
  viewNonce: number;
  autoRotate: boolean;
  labels: boolean;
  pinout: boolean;
  hoverId: string | null;
  /** Piesa atinsă pe ecran tactil: primul tap arată numele, al doilea deschide detaliile. */
  touchId: string | null;
  selectedId: string | null;
  pinHover: PinHover | null;
  notice: string | null;

  setReady(): void;
  go(section: Section): void;
  setBoard(id: string): void;
  stepBoard(delta: number): void;
  setView(v: ViewPreset): void;
  toggle(key: 'autoRotate' | 'labels' | 'pinout'): void;
  setHover(id: string | null): void;
  setTouch(id: string | null): void;
  select(id: string | null): void;
  setPinHover(p: PinHover | null): void;
  notify(msg: string | null): void;
}

const SECTIONS: Section[] = ['placi', 'banc', 'lectii', 'quiz', 'compara'];

function readHash(): { section: Section; boardId: string } {
  const [, sec, id] = (typeof location !== 'undefined' ? location.hash : '').split('/');
  const section = SECTIONS.includes(sec as Section) ? (sec as Section) : 'placi';
  const boardId = BOARDS.some((b) => b.id === id) ? id : DEFAULT_BOARD;
  return { section, boardId };
}

function writeHash(section: Section, boardId: string) {
  const next = section === 'placi' ? `#/placi/${boardId}` : `#/${section}`;
  if (location.hash !== next) history.replaceState(null, '', next);
}

let noticeTimer: ReturnType<typeof setTimeout> | undefined;

export const useApp = create<AppState>((set, get) => ({
  ready: false,
  ...readHash(),
  boardDir: 1,
  view: 'trei-sferturi',
  viewNonce: 0,
  autoRotate: false,
  labels: false,
  pinout: false,
  hoverId: null,
  touchId: null,
  selectedId: null,
  pinHover: null,
  notice: null,

  setReady: () => set({ ready: true }),
  go: (section) => {
    set({ section, hoverId: null, touchId: null, selectedId: null, pinHover: null });
    writeHash(section, get().boardId);
  },
  setBoard: (id) => {
    const { boardId } = get();
    if (id === boardId) return;
    const from = BOARDS.findIndex((b) => b.id === boardId);
    const to = BOARDS.findIndex((b) => b.id === id);
    set({ boardId: id, boardDir: to >= from ? 1 : -1, hoverId: null, touchId: null, selectedId: null, pinHover: null });
    if (get().view === 'jos') set({ view: 'trei-sferturi', viewNonce: get().viewNonce + 1 });
    writeHash(get().section, id);
  },
  stepBoard: (delta) => {
    const i = BOARDS.findIndex((b) => b.id === get().boardId);
    const next = BOARDS[(i + delta + BOARDS.length) % BOARDS.length];
    get().setBoard(next.id);
    set({ boardDir: delta >= 0 ? 1 : -1 });
  },
  setView: (view) => set({ view, viewNonce: get().viewNonce + 1 }),
  toggle: (key) => {
    const v = !get()[key];
    set({ [key]: v } as Partial<AppState>);
    // în modul pinout, pinii se văd cel mai bine de sus
    if (key === 'pinout' && v) set({ view: 'sus', viewNonce: get().viewNonce + 1, selectedId: null });
  },
  setHover: (hoverId) => {
    if (get().hoverId !== hoverId) set({ hoverId });
  },
  setTouch: (touchId) => set({ touchId }),
  select: (selectedId) => set({ selectedId, touchId: null }),
  setPinHover: (p) => {
    const cur = get().pinHover;
    if (cur?.partId === p?.partId && cur?.index === p?.index) return;
    set({ pinHover: p });
  },
  notify: (notice) => {
    clearTimeout(noticeTimer);
    set({ notice });
    if (notice) noticeTimer = setTimeout(() => set({ notice: null }), 3200);
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    const h = readHash();
    const s = useApp.getState();
    if (h.section !== s.section) s.go(h.section);
    if (h.boardId !== s.boardId) s.setBoard(h.boardId);
  });
}
