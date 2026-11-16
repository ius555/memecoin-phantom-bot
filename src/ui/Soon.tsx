import { useApp, type Section } from '../state/app';
import { T } from '../texte';
import { IconArrow } from './icons';

/** Ecran provizoriu pentru secțiunile care se construiesc în fazele următoare. */
export function Soon({ section }: { section: Exclude<Section, 'placi'> }) {
  const go = useApp((s) => s.go);
  const t = T.soon[section];
  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center p-6">
      <section className="card animate-rise pointer-events-auto w-full max-w-md p-7 text-center">
        <p className="kicker">{T.soon.kicker}</p>
        <h1 className="mt-2 font-serif text-[40px] font-medium leading-none tracking-[-0.02em]">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-xs text-[15px] leading-snug text-ink-soft">{t.text}</p>
        <button type="button" onClick={() => go('placi')} className="pill pill-ink mt-6 h-11 px-5 text-[14px]">
          {T.soon.back}
          <IconArrow />
        </button>
      </section>
    </div>
  );
}
