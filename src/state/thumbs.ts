import { create } from 'zustand';
import { BOARDS } from '../data/boards';
import { disposeThumbnailRenderer, renderThumbnail } from '../three/thumbnails';

interface ThumbsState {
  urls: Record<string, string>;
  started: boolean;
  /** Randează, pe rând și în timpii morți, câte o miniatură pentru fiecare placă. */
  generate(): void;
}

const idle = () =>
  new Promise<void>((resolve) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => resolve(), { timeout: 600 });
    else setTimeout(resolve, 120);
  });

export const useThumbs = create<ThumbsState>((set, get) => ({
  urls: {},
  started: false,
  generate: () => {
    if (get().started) return;
    set({ started: true });
    void (async () => {
      try {
        for (const b of BOARDS) {
          await idle();
          const url = renderThumbnail(b);
          set({ urls: { ...get().urls, [b.id]: url } });
        }
      } catch (err) {
        // Fără miniaturi caruselul arată doar numele plăcilor; restul aplicației merge.
        console.warn('Miniaturile nu au putut fi generate.', err);
      } finally {
        disposeThumbnailRenderer();
      }
    })();
  },
}));
