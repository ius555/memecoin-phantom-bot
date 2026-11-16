import { useEffect, useRef } from 'react';
import { BOARDS } from '../../data/boards';
import { useApp, type ViewPreset } from '../../state/app';
import { useThumbs } from '../../state/thumbs';
import { T } from '../../texte';
import { IconChevron, IconIron, IconPins, IconRotate, IconTag, IconTarget } from '../../ui/icons';
import { useFind } from './find';

const VIEW_ORDER: ViewPreset[] = ['trei-sferturi', 'sus', 'jos', 'fata'];

function Toggle({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`pill h-9 shrink-0 gap-1.5 px-3 text-[13px] ${on ? 'pill-ink' : 'pill-ghost'}`}
    >
      {icon}
      {label}
    </button>
  );
}

/** Bara de jos: vederi, comutatoare, joc și butonul verde de asamblare. */
function ViewBar() {
  const view = useApp((s) => s.view);
  const setView = useApp((s) => s.setView);
  const toggle = useApp((s) => s.toggle);
  const autoRotate = useApp((s) => s.autoRotate);
  const labels = useApp((s) => s.labels);
  const pinout = useApp((s) => s.pinout);
  const notify = useApp((s) => s.notify);
  const openFind = useFind((s) => s.open);
  // în timpul jocului rămân doar vederile: ai nevoie de „Jos" ca să cauți pe spatele plăcii
  const playing = useFind((s) => s.phase !== 'off');

  return (
    <div className="card no-scrollbar pointer-events-auto flex max-w-[calc(100vw-16px)] items-center gap-0.5 overflow-x-auto !rounded-full p-1">
      <div role="group" aria-label={T.views.label} className="flex shrink-0 items-center rounded-full bg-ink/6 p-0.5 max-md:-order-1">
        {VIEW_ORDER.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={`pill h-8 min-w-11 px-3 text-[13px] ${view === v ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-ink/8'}`}
          >
            {T.views[v]}
          </button>
        ))}
      </div>
      {!playing && (
        <>
      <span className="mx-1 h-5 w-px shrink-0 bg-line" />
      <Toggle on={autoRotate} onClick={() => toggle('autoRotate')} icon={<IconRotate />} label={T.views.rotate} />
      <Toggle on={labels} onClick={() => toggle('labels')} icon={<IconTag />} label={T.views.labels} />
      <Toggle on={pinout} onClick={() => toggle('pinout')} icon={<IconPins />} label={T.views.pinout} />
      <span className="mx-1 h-5 w-px shrink-0 bg-line" />
      <button type="button" onClick={openFind} className="pill pill-ghost h-9 shrink-0 gap-1.5 px-3 text-[13px]">
        <IconTarget />
        {T.views.find}
      </button>
      <button type="button" onClick={() => notify(T.soon.assemble)} className="pill pill-go h-9 shrink-0 gap-1.5 px-4 text-[13.5px] max-md:order-first max-md:ml-1">
        <IconIron />
        {T.views.assemble}
      </button>
        </>
      )}
    </div>
  );
}

/** Caruselul cu miniaturile 3D ale plăcilor. */
function Carousel() {
  const boardId = useApp((s) => s.boardId);
  const setBoard = useApp((s) => s.setBoard);
  const stepBoard = useApp((s) => s.stepBoard);
  const urls = useThumbs((s) => s.urls);
  const strip = useRef<HTMLDivElement>(null);

  // placa activă rămâne mereu în câmpul vizual al benzii
  useEffect(() => {
    strip.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [boardId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, [contenteditable]')) return;
      if (e.key === 'ArrowRight') stepBoard(1);
      if (e.key === 'ArrowLeft') stepBoard(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepBoard]);

  const arrow = 'card pointer-events-auto hidden h-9 w-9 shrink-0 place-items-center !rounded-full hover:bg-cream md:grid';
  return (
    <div className="flex max-w-full items-center gap-2 px-2 short:hidden">
      <button type="button" aria-label={T.boards.prev} onClick={() => stepBoard(-1)} className={arrow}>
        <IconChevron className="rotate-180" />
      </button>
      <div ref={strip} className="card no-scrollbar pointer-events-auto flex max-w-[min(100vw-16px,880px)] gap-1 overflow-x-auto !rounded-[20px] p-1.5">
        {BOARDS.map((b) => {
          const active = b.id === boardId;
          const url = urls[b.id];
          return (
            <button
              key={b.id}
              type="button"
              aria-current={active}
              onClick={() => setBoard(b.id)}
              title={b.name}
              className={`group relative flex w-[84px] shrink-0 flex-col items-center rounded-[14px] px-1 pb-1.5 pt-1 transition-colors md:w-[104px] ${
                active ? 'bg-paper shadow-[inset_0_0_0_1.5px_var(--color-ink)]' : 'hover:bg-ink/6'
              }`}
            >
              <span className="relative block h-[46px] w-full md:h-[58px]">
                {url ? (
                  <img
                    src={url}
                    alt=""
                    draggable={false}
                    className={`animate-fade h-full w-full object-contain drop-shadow-[0_5px_5px_rgb(60_40_10/0.28)] transition-transform duration-300 ${
                      active ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                  />
                ) : (
                  <span className="animate-shimmer absolute inset-x-3 inset-y-2 rounded-lg bg-[linear-gradient(100deg,transparent_30%,rgb(27_25_21/0.08)_50%,transparent_70%)] bg-[length:200%_100%]" />
                )}
              </span>
              <span className={`mt-0.5 w-full truncate text-center font-mono text-[9px] uppercase tracking-[0.06em] ${active ? 'text-ink' : 'text-muted'}`}>
                {b.name.replace(/^(Arduino|Raspberry Pi) /, (m) => (m.startsWith('R') ? 'Pi ' : ''))}
              </span>
            </button>
          );
        })}
      </div>
      <button type="button" aria-label={T.boards.next} onClick={() => stepBoard(1)} className={arrow}>
        <IconChevron />
      </button>
    </div>
  );
}

export function Dock() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 pb-[max(10px,env(safe-area-inset-bottom))]">
      <ViewBar />
      <Carousel />
    </div>
  );
}
