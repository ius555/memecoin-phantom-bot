import { useEffect, useRef, useState } from 'react';
import { BOARDS, getBoard } from '../../data/boards';
import type { Difficulty } from '../../data/types';
import { useApp } from '../../state/app';
import { T } from '../../texte';
import { IconArrow, IconChevron } from '../../ui/icons';
import { useStage } from '../../state/stage';

const DIFF_STYLE: Record<Difficulty, string> = {
  incepator: 'bg-go/12 text-go-deep',
  mediu: 'bg-solder/14 text-solder-deep',
  avansat: 'bg-[#d94a3d]/12 text-[#b3372b]',
};
const DIFF_DOT: Record<Difficulty, string> = {
  incepator: 'bg-go',
  mediu: 'bg-solder',
  avansat: 'bg-[#d94a3d]',
};

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold ${DIFF_STYLE[level]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DIFF_DOT[level]}`} />
      {T.difficulty[level]}
    </span>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Cardul din stânga sus: cine e placa, pe scurt. */
export function BoardCard() {
  const boardId = useApp((s) => s.boardId);
  const notify = useApp((s) => s.notify);
  const stepBoard = useApp((s) => s.stepBoard);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLElement>(null);
  const board = getBoard(boardId);

  // etichetele din scenă ocolesc cardul: îi anunțăm marginea de jos ori de câte ori se schimbă
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => useStage.getState().setCardBottom(el.getBoundingClientRect().bottom);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      useStage.getState().setCardBottom(0);
    };
  }, [boardId]);
  const index = BOARDS.findIndex((b) => b.id === boardId);
  const s = board.specs;
  const t = T.boards.spec;

  const rows: [string, string][] = [
    [t.mcu, s.mcu],
    [t.clock, s.clock],
    [t.flash, s.flash],
    [t.ram, s.ram],
    [t.voltage, s.voltage],
    [t.power, s.power],
    [t.pins, t.pinsValue(s.digital, s.analog, s.pwm)],
    [t.wireless, [s.wifi && `Wi-Fi ${s.wifi}`, s.bluetooth && `Bluetooth ${s.bluetooth}`].filter(Boolean).join(' · ') || t.none],
    [t.usb, s.usb],
    ...(s.other ? ([[t.other, s.other]] as [string, string][]) : []),
    [t.size, `${String(board.pcb.w).replace('.', ',')} × ${String(board.pcb.h).replace('.', ',')} mm`],
  ];

  return (
    <section
      ref={box}
      key={boardId}
      className="card animate-rise absolute left-3 right-3 top-[62px] z-20 flex max-h-[calc(100dvh-62px-176px)] flex-col p-4 md:left-6 md:right-auto md:top-[84px] md:max-h-[calc(100dvh-84px-184px)] md:w-[380px] md:p-5 short:md:top-[66px] short:md:max-h-none short:md:w-[284px] short:md:p-3.5"
    >
      <div className="kicker flex shrink-0 items-center justify-between gap-2">
        <span className="min-w-0 truncate">
          {board.family} · {board.year}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap tabular-nums">
          {/* pe ecrane scunde caruselul nu are loc: săgețile lui se mută aici */}
          <button type="button" aria-label={T.boards.prev} onClick={() => stepBoard(-1)} className="pill pill-ghost hidden h-6 w-6 border border-line short:inline-flex">
            <IconChevron className="rotate-180" width={11} height={11} />
          </button>
          {pad(index + 1)} / {pad(BOARDS.length)}
          <button type="button" aria-label={T.boards.next} onClick={() => stepBoard(1)} className="pill pill-ghost hidden h-6 w-6 border border-line short:inline-flex">
            <IconChevron width={11} height={11} />
          </button>
        </span>
      </div>
      <h1 className="mt-1.5 font-serif text-[27px] font-medium leading-[1.04] tracking-[-0.022em] md:mt-2 md:text-[40px] short:md:text-[25px]">
        {board.name}
      </h1>
      <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-ink-soft md:line-clamp-none md:text-[14.5px] short:hidden">
        {board.tagline}
      </p>

      <div className="mt-3 flex shrink-0 flex-wrap items-center gap-2 md:mt-4 short:md:mt-2.5">
        <button type="button" onClick={() => notify(T.soon.workbench)} className="pill pill-ink h-10 px-4 text-[13px] md:text-[13.5px]">
          {T.boards.openOnBench}
          <IconArrow />
        </button>
        <DifficultyBadge level={board.difficulty} />
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="kicker mt-3 flex w-full shrink-0 items-center justify-between border-t border-line pt-3 hover:text-ink short:hidden"
      >
        {open ? T.boards.hideSpecs : T.boards.specs}
        <IconChevron className={`transition-transform ${open ? '-rotate-90' : 'rotate-90'}`} width={12} height={12} />
      </button>

      {open && (
        <div className="thin-scrollbar animate-fade mt-2 min-h-0 overflow-y-auto pr-1 short:hidden">
          <dl className="text-[12.5px]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex gap-3 border-b border-dashed border-line py-1.5 last:border-0">
                <dt className="w-[104px] shrink-0 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">{k}</dt>
                <dd className="flex-1 select-text font-medium leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
          {s.pinNote && <p className="mt-2 text-[12px] leading-snug text-muted">{s.pinNote}</p>}
          <p className="kicker mt-3">{t.bestFor}</p>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{board.bestFor}</p>
        </div>
      )}
    </section>
  );
}
