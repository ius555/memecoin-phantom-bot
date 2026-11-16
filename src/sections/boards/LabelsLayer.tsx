import { useEffect, useLayoutEffect, useRef } from 'react';
import { getBoard, labelledParts } from '../../data/boards';
import type { ComponentSpec } from '../../data/types';
import { useApp } from '../../state/app';
import { T } from '../../texte';
import { useLayout } from '../../ui/useLayout';
import { useFind } from './find';
import { overlay } from './overlay';

function Label({ part }: { part: ComponentSpec }) {
  const el = useRef<HTMLButtonElement>(null);
  const path = useRef<SVGPathElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const active = useApp((s) => s.hoverId === part.id || s.selectedId === part.id);

  useLayoutEffect(() => {
    overlay.labels.set(part.id, { el: el.current!, path: path.current!, dot: dot.current!, side: 1, y: 0, placed: false });
    return () => {
      overlay.labels.delete(part.id);
    };
  }, [part.id]);

  return (
    <>
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <path
          ref={path}
          fill="none"
          stroke={active ? '#ffffff' : '#fffaf0'}
          strokeWidth={active ? 1.8 : 1.1}
          strokeOpacity={active ? 1 : 0.85}
          style={{ opacity: 0, filter: 'drop-shadow(0 0 1px rgb(20 15 5 / 0.65))' }}
        />
        <circle ref={dot} r={active ? 3.6 : 2.6} fill="#fffaf0" stroke="#1b1915" strokeWidth={1} style={{ opacity: 0 }} />
      </svg>
      <button
        ref={el}
        type="button"
        style={{ opacity: 0, pointerEvents: 'none' }}
        onPointerEnter={(e) => e.pointerType === 'mouse' && useApp.getState().setHover(part.id)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && useApp.getState().setHover(null)}
        onClick={() => useApp.getState().select(part.id)}
        className={`absolute left-0 top-0 whitespace-nowrap rounded-md border px-1.5 py-[3px] font-mono text-[9px] font-medium uppercase leading-none tracking-[0.06em] shadow-[0_2px_6px_-2px_rgb(40_30_10/0.45)] transition-colors will-change-transform md:px-2 md:py-1 md:text-[10.5px] md:tracking-[0.08em] ${
          active ? 'border-ink bg-ink text-cream' : 'border-line bg-cream/95 text-ink'
        }`}
      >
        <span className="md:hidden short:md:inline">{part.short}</span>
        <span className="hidden md:inline short:md:hidden">{part.name}</span>
      </button>
    </>
  );
}

/** Etichetele tuturor componentelor. Pozițiile le calculează `LabelsDriver`, din scena 3D. */
export function LabelsLayer() {
  const boardId = useApp((s) => s.boardId);
  const parts = labelledParts(getBoard(boardId));
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {parts.map((p) => (
        <Label key={`${boardId}:${p.id}`} part={p} />
      ))}
    </div>
  );
}

/**
 * Tooltip-ul cu numele piesei.
 * Cu mouse-ul urmărește cursorul; pe ecran tactil stă deasupra piesei atinse și se poate apăsa.
 */
export function Tooltip() {
  const boardId = useApp((s) => s.boardId);
  const hoverId = useApp((s) => s.hoverId);
  const touchId = useApp((s) => s.touchId);
  const selectedId = useApp((s) => s.selectedId);
  const pinHover = useApp((s) => s.pinHover);
  const pinout = useApp((s) => s.pinout);
  const playing = useFind((s) => s.phase !== 'off');
  const layout = useLayout();
  const follow = useRef<HTMLDivElement>(null);
  const touchTip = useRef<HTMLButtonElement>(null);
  const board = getBoard(boardId);

  useEffect(() => {
    overlay.touchTip = touchTip.current;
    return () => {
      overlay.touchTip = null;
    };
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = follow.current;
      if (!el || e.pointerType !== 'mouse') return;
      const x = Math.min(e.clientX + 16, window.innerWidth - el.offsetWidth - 8);
      const y = Math.min(e.clientY + 18, window.innerHeight - el.offsetHeight - 8);
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const hovered = hoverId ? board.components.find((c) => c.id === hoverId) : undefined;
  const touched = touchId ? board.components.find((c) => c.id === touchId) : undefined;
  const pinPart = pinHover ? board.components.find((c) => c.id === pinHover.partId) : undefined;
  const pin = pinPart?.pins?.[pinHover!.index];
  const showPin = pinout && pin && !layout.mobile;
  const showHover = !playing && hovered && hovered.id !== selectedId && !showPin;

  return (
    <>
      <div
        ref={follow}
        className={`pointer-events-none fixed left-0 top-0 z-50 rounded-xl bg-ink px-3 py-2 text-cream shadow-pop transition-opacity duration-100 ${
          showPin || showHover ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {showPin ? (
          <>
            <p className="font-mono text-[12.5px] font-semibold leading-tight">
              {T.pinout.pin} {pin.n} · {pin.label}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-tight text-cream/70">
              {T.pinout.fn[pin.fn]}
              {pin.alt ? ` ${T.pinout.alt} ${T.pinout.fn[pin.alt]}` : ''}
              {pin.note ? ` — ${pin.note}` : ''}
            </p>
          </>
        ) : (
          hovered && (
            <>
              <p className="text-[13px] font-semibold leading-tight">{hovered.name}</p>
              <p className="kicker mt-1 !text-[9.5px] !text-cream/60">{T.tooltip.hint}</p>
            </>
          )
        )}
      </div>

      <button
        ref={touchTip}
        type="button"
        onClick={() => touched && useApp.getState().select(touched.id)}
        style={{ opacity: 0 }}
        className={`absolute left-0 top-0 z-30 rounded-xl bg-ink px-3 py-2 text-center text-cream shadow-pop transition-opacity duration-150 ${
          touched && !playing ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <span className="block text-[13px] font-semibold leading-tight">{touched?.name}</span>
        <span className="kicker mt-1 block !text-[9.5px] !text-cream/60">{T.tooltip.hintTouch}</span>
      </button>
    </>
  );
}
