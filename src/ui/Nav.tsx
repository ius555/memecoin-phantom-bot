import { useState } from 'react';
import { useApp, type Section } from '../state/app';
import { T } from '../texte';
import { IconClose, IconMenu, IconNote, Mark } from './icons';

const ITEMS: Section[] = ['placi', 'banc', 'lectii', 'quiz', 'compara'];

export function Nav() {
  const section = useApp((s) => s.section);
  const go = useApp((s) => s.go);
  const [open, setOpen] = useState(false);

  const pick = (s: Section) => {
    go(s);
    setOpen(false);
  };

  // Muzica ambientală (Web Audio) se adaugă în faza 6; până atunci butonul e doar anunțat.
  const lofi = (
    <button
      type="button"
      disabled
      title={T.nav.lofiSoon}
      className="pill h-9 gap-1.5 border border-line px-3.5 text-[13px] text-muted opacity-70"
    >
      <IconNote />
      {T.nav.lofi}
    </button>
  );

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-3 px-3 pt-3 md:px-6 md:pt-5">
      <button
        type="button"
        onClick={() => pick('placi')}
        className="card pointer-events-auto flex h-11 items-center gap-2.5 !rounded-full pl-2 pr-4"
      >
        <Mark />
        <span className="font-serif text-[17px] font-medium tracking-[-0.01em] md:text-[19px]">{T.site.name}</span>
      </button>

      <nav className="card pointer-events-auto hidden h-11 items-center gap-0.5 !rounded-full p-1 md:flex">
        {ITEMS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => pick(s)}
            aria-current={section === s ? 'page' : undefined}
            className={`pill h-9 px-3.5 text-[13.5px] ${section === s ? 'pill-ink' : 'pill-ghost'}`}
          >
            {T.nav[s]}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-line" />
        {lofi}
      </nav>

      <button
        type="button"
        aria-label={open ? T.nav.close : T.nav.menu}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="card pointer-events-auto grid h-11 w-11 place-items-center !rounded-full md:hidden"
      >
        {open ? <IconClose width={18} height={18} /> : <IconMenu width={18} height={18} />}
      </button>

      {open && (
        <div className="card animate-rise pointer-events-auto absolute right-3 top-[62px] flex w-56 flex-col gap-1 p-2 md:hidden">
          {ITEMS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => pick(s)}
              className={`pill h-11 justify-start px-4 text-[15px] ${section === s ? 'pill-ink' : 'pill-ghost'}`}
            >
              {T.nav[s]}
            </button>
          ))}
          <div className="mt-1 border-t border-line pt-2">{lofi}</div>
        </div>
      )}
    </header>
  );
}
