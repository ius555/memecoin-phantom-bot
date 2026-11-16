import { Suspense, lazy, useEffect } from 'react';
import Stage from './scene/Stage';
import { useApp } from './state/app';
import { useThumbs } from './state/thumbs';
import { T } from './texte';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { Mark } from './ui/icons';
import { Nav } from './ui/Nav';
import { Soon } from './ui/Soon';
import { Toast } from './ui/Toast';

const BoardsUI = lazy(() => import('./sections/boards/BoardsUI'));

function Loader({ visible }: { visible: boolean }) {
  return (
    <div
      className={`absolute inset-0 z-[60] grid place-items-center bg-cream transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <div className="flex flex-col items-center gap-4">
        <Mark size={44} />
        <p className="font-serif text-[26px] font-medium tracking-[-0.01em]">{T.site.name}</p>
        <p className="kicker">{T.site.loading}</p>
      </div>
    </div>
  );
}

function WebglError() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-cream p-8 text-center">
      <p className="max-w-sm text-[15px] leading-snug text-ink-soft">{T.site.webglError}</p>
    </div>
  );
}

export default function App() {
  const section = useApp((s) => s.section);
  const ready = useApp((s) => s.ready);

  // miniaturile din carusel se randează după ce prima placă e pe ecran
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => useThumbs.getState().generate(), 500);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <ErrorBoundary fallback={<WebglError />}>
        <Stage />
      </ErrorBoundary>
      <div className="vignette" />
      <Nav />
      <Suspense fallback={null}>{section === 'placi' ? <BoardsUI /> : <Soon section={section} />}</Suspense>
      <Toast />
      <Loader visible={!ready && section === 'placi'} />
    </div>
  );
}
