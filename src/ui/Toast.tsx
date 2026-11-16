import { useApp } from '../state/app';

export function Toast() {
  const notice = useApp((s) => s.notice);
  if (!notice) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[76px] z-50 flex justify-center px-4 md:top-[84px]">
      <div role="status" className="animate-rise rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-cream shadow-pop">
        {notice}
      </div>
    </div>
  );
}
