import { useEffect, useRef } from 'react';
import { getBoard } from '../../data/boards';
import { useProgress } from '../../state/progress';
import { T } from '../../texte';
import { IconPlay } from '../../ui/icons';
import { useFind } from './find';

const clock = (secs: number) => `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-3">
      <span className="kicker !text-[9.5px]">{label}</span>
      <span className="font-mono text-[15px] font-semibold tabular-nums leading-tight">{children}</span>
    </div>
  );
}

/** Cronometrul scrie direct în DOM, ca să nu re-randeze panoul de zece ori pe secundă. */
function Timer({ since }: { since: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    let last = '';
    const tick = () => {
      const s = clock((performance.now() - since) / 1000);
      if (s !== last && ref.current) ref.current.textContent = last = s;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [since]);
  return <span ref={ref}>0:00</span>;
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade absolute inset-0 z-50 grid place-items-center bg-ink/25 p-5 backdrop-blur-[2px]">
      <section role="dialog" aria-modal="true" className="card animate-rise w-full max-w-[400px] !bg-cream p-6 text-center shadow-pop">
        {children}
      </section>
    </div>
  );
}

export function FindHud() {
  const s = useFind();
  const best = useProgress((p) => p.findBest[s.boardId]);

  if (s.phase === 'off') return null;
  const board = getBoard(s.boardId);

  if (s.phase === 'intro') {
    return (
      <Modal>
        <p className="kicker">{board.name}</p>
        <h2 className="mt-1.5 font-serif text-[34px] font-medium leading-none tracking-[-0.02em]">{T.find.title}</h2>
        <p className="mx-auto mt-3 max-w-[300px] text-[14.5px] leading-snug text-ink-soft">{T.find.intro}</p>
        <p className="kicker mt-4">
          {T.find.rounds(Math.min(8, board.components.filter((c) => !c.decor).length))}
          {best ? ` · ${T.find.best}: ${best.score}` : ''}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" onClick={s.stop} className="pill pill-ghost h-11 border border-line px-5 text-[14px]">
            {T.find.close}
          </button>
          <button type="button" onClick={s.start} className="pill pill-go h-11 px-6 text-[14px]">
            <IconPlay />
            {T.find.start}
          </button>
        </div>
      </Modal>
    );
  }

  if (s.phase === 'done') {
    return (
      <Modal>
        <p className="kicker">{s.newBest ? T.find.newBest : board.name}</p>
        <h2 className="mt-1.5 font-serif text-[34px] font-medium leading-none tracking-[-0.02em]">{T.find.doneTitle}</h2>
        <p className="mt-4 font-serif text-[64px] font-medium leading-none tracking-[-0.03em] tabular-nums">{s.score}</p>
        <p className="kicker mt-1">{T.find.doneScore}</p>
        <div className="mt-4 flex justify-center divide-x divide-line">
          <Stat label={T.find.doneTime}>{clock(s.total)}</Stat>
          <Stat label={T.find.doneHits}>
            {s.hits} / {s.targets.length}
          </Stat>
          {best && <Stat label={T.find.best}>{best.score}</Stat>}
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <button type="button" onClick={s.stop} className="pill pill-ghost h-11 border border-line px-5 text-[14px]">
            {T.find.close}
          </button>
          <button type="button" onClick={s.start} className="pill pill-go h-11 px-6 text-[14px]">
            {T.find.again}
          </button>
        </div>
      </Modal>
    );
  }

  // în joc: panoul de sus cu piesa căutată
  const target = board.components.find((c) => c.id === s.targets[s.index]);
  const fb = s.feedback;
  return (
    <section
      aria-live="polite"
      className="card animate-rise absolute left-3 right-3 top-[62px] z-30 p-4 text-center md:left-auto md:right-6 md:top-[84px] md:w-[368px] md:p-5 short:md:top-[66px] short:md:w-[300px] short:md:p-3.5"
    >
      <p className="kicker">
        {T.find.prompt} · {T.find.round(s.index + 1, s.targets.length)}
      </p>
      <h2 key={target?.id} className="animate-rise mt-1 font-serif text-[26px] font-medium leading-[1.08] tracking-[-0.02em] md:text-[30px]">
        {target?.name}
      </h2>
      <p
        className={`mt-1.5 min-h-[18px] text-[13px] font-semibold leading-tight ${
          fb ? (fb.kind === 'ok' ? 'text-go-deep' : 'text-[#c23b2e]') : 'font-normal text-muted'
        }`}
      >
        {fb ? fb.text : target?.side === 'bottom' ? T.find.onBottom : ' '}
      </p>
      <div className="mt-2.5 flex items-center justify-center divide-x divide-line">
        <Stat label={T.find.score}>{s.score}</Stat>
        <Stat label={T.find.time}>
          <Timer since={s.startedAt} />
        </Stat>
        <Stat label={T.find.streak}>{s.streak}</Stat>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button type="button" onClick={s.skip} className="pill pill-ghost h-9 border border-line px-4 text-[13px]">
          {T.find.skip}
        </button>
        <button type="button" onClick={s.stop} className="pill pill-ghost h-9 border border-line px-4 text-[13px]">
          {T.find.stop}
        </button>
      </div>
    </section>
  );
}
