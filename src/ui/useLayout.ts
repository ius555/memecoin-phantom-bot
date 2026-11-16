import { useSyncExternalStore } from 'react';

export interface Layout {
  w: number;
  h: number;
  /** Ecran îngust: panourile devin foi care urcă de jos. */
  mobile: boolean;
  /** Telefon ținut pe orizontală: foarte puțin loc pe verticală. */
  short: boolean;
}

let current: Layout = measure();

function measure(): Layout {
  const w = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const h = typeof window === 'undefined' ? 800 : window.innerHeight;
  return { w, h, mobile: w < 768, short: h < 520 };
}

const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    const next = measure();
    if (next.w === current.w && next.h === current.h) return;
    current = next;
    listeners.forEach((l) => l());
  });
}

export function useLayout(): Layout {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
}

export function getLayout() {
  return current;
}
