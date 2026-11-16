import { useEffect, useRef, type ReactNode } from 'react';
import { getBoard } from '../../data/boards';
import type { ComponentSpec, PinFn, PinSpec } from '../../data/types';
import { useApp } from '../../state/app';
import { PIN_COLORS } from '../../three/materials';
import { T } from '../../texte';
import { IconClose, IconPins } from '../../ui/icons';

/** Panou lateral pe ecrane late, foaie care urcă de jos pe telefon. */
function SidePanel({ children, label }: { children: ReactNode; label: string }) {
  return (
    <aside
      aria-label={label}
      className="card thin-scrollbar animate-sheet absolute inset-x-0 bottom-0 z-30 max-h-[46dvh] overflow-y-auto !rounded-b-none p-4 max-md:!bg-cream pb-[max(16px,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-auto md:right-6 md:top-[84px] md:max-h-[calc(100dvh-84px-190px)] md:w-[368px] md:!rounded-[22px] md:p-5 short:md:top-[66px] short:md:max-h-[calc(100dvh-74px)] short:md:w-[312px] short:md:p-4"
    >
      {children}
    </aside>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={T.detail.close}
      onClick={onClick}
      className="pill pill-ghost -mr-1.5 -mt-1.5 h-9 w-9 shrink-0 border border-line"
    >
      <IconClose />
    </button>
  );
}

function PinSwatch({ fn, alt }: { fn: PinFn; alt?: PinFn }) {
  return (
    <span className="relative inline-block h-3.5 w-3.5 shrink-0 overflow-hidden rounded-[4px]" style={{ background: PIN_COLORS[fn] }}>
      {alt && (
        <span
          className="absolute right-0 top-0 h-0 w-0 border-l-[9px] border-t-[9px] border-l-transparent"
          style={{ borderTopColor: PIN_COLORS[alt] }}
        />
      )}
    </span>
  );
}

// ───────────────────────── detaliile unei componente ─────────────────────────

export function DetailPanel() {
  const boardId = useApp((s) => s.boardId);
  const selectedId = useApp((s) => s.selectedId);
  const select = useApp((s) => s.select);
  const pinout = useApp((s) => s.pinout);
  const toggle = useApp((s) => s.toggle);
  const part = selectedId ? getBoard(boardId).components.find((c) => c.id === selectedId) : undefined;

  useEffect(() => {
    if (!part) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && select(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [part, select]);

  if (!part) return null;
  const chip = 'inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-semibold';

  return (
    <SidePanel label={part.name} key={part.id}>
      <div className="flex items-start justify-between gap-3">
        <p className="kicker pt-0.5">
          {T.detail.kicker}
          {part.ref ? ` · ${part.ref}` : ''}
        </p>
        <CloseButton onClick={() => select(null)} />
      </div>
      <h2 className="mt-1 select-text font-serif text-[25px] font-medium leading-[1.08] tracking-[-0.018em] md:text-[28px]">{part.name}</h2>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {part.kit === false ? (
          <span className={`${chip} bg-ink/8 text-ink-soft`}>{T.detail.presoldered}</span>
        ) : (
          <span className={`${chip} bg-solder/14 text-solder-deep`}>{T.detail.kit}</span>
        )}
        {part.side === 'bottom' && <span className={`${chip} bg-ink/8 text-ink-soft`}>{T.detail.bottom}</span>}
      </div>

      {part.what && (
        <>
          <h3 className="kicker mt-4">{T.detail.what}</h3>
          <p className="mt-1 select-text text-[14px] leading-[1.45] text-ink-soft">{part.what}</p>
        </>
      )}

      {part.specs && part.specs.length > 0 && (
        <>
          <h3 className="kicker mt-4">{T.detail.specs}</h3>
          <dl className="mt-1 text-[13px]">
            {part.specs.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-dashed border-line py-1.5 last:border-0">
                <dt className="shrink-0 text-muted">{k}</dt>
                <dd className="select-text text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {part.connects && (
        <>
          <h3 className="kicker mt-4">{T.detail.connects}</h3>
          <p className="mt-1 select-text text-[14px] leading-[1.45] text-ink-soft">{part.connects}</p>
        </>
      )}

      {part.pins && part.pins.length > 0 && (
        <>
          <h3 className="kicker mt-4">{T.detail.pins}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {part.pins.map((p, i) => (
              <span key={i} className="inline-flex h-6 items-center gap-1.5 rounded-md bg-ink/6 pl-1.5 pr-2 font-mono text-[10.5px]">
                <PinSwatch fn={p.fn} alt={p.alt} />
                {p.label}
              </span>
            ))}
          </div>
          {!pinout && (
            <button
              type="button"
              onClick={() => {
                select(null);
                toggle('pinout');
              }}
              className="pill pill-ink mt-3 h-10 px-4 text-[13px]"
            >
              <IconPins />
              {T.detail.showPinout}
            </button>
          )}
        </>
      )}
    </SidePanel>
  );
}

// ───────────────────────── pinout ─────────────────────────

const LEGEND: PinFn[] = ['power', 'gnd', 'digital', 'pwm', 'analog', 'i2c', 'spi', 'uart', 'other'];

function PinRow({ part, pin, index, reverse }: { part: ComponentSpec; pin: PinSpec; index: number; reverse?: boolean }) {
  const active = useApp((s) => s.pinHover?.partId === part.id && s.pinHover.index === index);
  const setPinHover = useApp((s) => s.setPinHover);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [active]);

  return (
    <button
      ref={ref}
      type="button"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPinHover({ partId: part.id, index })}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPinHover(null)}
      onClick={() => setPinHover(active ? null : { partId: part.id, index })}
      title={pin.note}
      className={`flex min-h-8 w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left transition-colors ${
        reverse ? 'flex-row-reverse text-right' : ''
      } ${active ? 'bg-ink text-cream' : 'hover:bg-ink/6'}`}
    >
      <span className={`w-5 shrink-0 text-center font-mono text-[10px] tabular-nums ${active ? 'text-cream/70' : 'text-muted'}`}>{pin.n}</span>
      <PinSwatch fn={pin.fn} alt={pin.alt} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-[11.5px] font-medium leading-tight">{pin.label}</span>
        {pin.note && <span className={`block truncate text-[10.5px] leading-tight ${active ? 'text-cream/70' : 'text-muted'}`}>{pin.note}</span>}
      </span>
    </button>
  );
}

export function PinoutPanel() {
  const boardId = useApp((s) => s.boardId);
  const pinout = useApp((s) => s.pinout);
  const selectedId = useApp((s) => s.selectedId);
  const toggle = useApp((s) => s.toggle);
  if (!pinout || selectedId) return null;
  const headers = getBoard(boardId).components.filter((c) => c.pins?.length);
  const used = new Set<PinFn>(headers.flatMap((h) => h.pins!.flatMap((p) => (p.alt ? [p.fn, p.alt] : [p.fn]))));

  return (
    <SidePanel label={T.pinout.title}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker pt-0.5">{getBoard(boardId).name}</p>
          <h2 className="mt-1 font-serif text-[25px] font-medium leading-none tracking-[-0.018em] md:text-[28px]">{T.pinout.title}</h2>
        </div>
        <CloseButton onClick={() => toggle('pinout')} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {LEGEND.filter((f) => used.has(f)).map((f) => (
          <span key={f} className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft">
            <PinSwatch fn={f} />
            {T.pinout.fn[f]}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-muted">{T.pinout.hint}</p>

      {headers.map((h) => {
        const twoRows = h.model.kind === 'header' && h.model.rows === 2;
        return (
          <section key={h.id} className="mt-4">
            <h3 className="kicker border-b border-line pb-1.5">{h.name}</h3>
            {twoRows ? (
              // două coloane, ca pe placă: pinii impari în stânga, cei pari în dreapta
              <div className="mt-1 grid grid-cols-2 gap-x-1">
                {h.pins!.map((p, i) => (
                  <PinRow key={i} part={h} pin={p} index={i} reverse={i % 2 === 0} />
                ))}
              </div>
            ) : (
              <div className="mt-1 grid grid-cols-2 gap-x-1">
                {h.pins!.map((p, i) => (
                  <PinRow key={i} part={h} pin={p} index={i} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </SidePanel>
  );
}
