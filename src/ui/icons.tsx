import type { SVGProps } from 'react';

/** Pictograme desenate de mână, ca SVG. Fără bibliotecă de iconițe, fără logo-uri. */

type P = SVGProps<SVGSVGElement>;

const base = (p: P): P => ({
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...p,
});

export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
export const IconChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3l5 5-5 5" />
  </svg>
);
export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 5h11M2.5 8h11M2.5 11h11" />
  </svg>
);
export const IconRotate = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" />
  </svg>
);
export const IconTag = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 3.5h5l6 6-4.5 4.5-6-6v-5z" />
    <circle cx="5.3" cy="6.3" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
export const IconPins = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="5.5" width="11" height="5" rx="1" />
    <path d="M5 5.5v-3M8 5.5v-3M11 5.5v-3M5 13.5v-3M8 13.5v-3M11 13.5v-3" />
  </svg>
);
export const IconTarget = (p: P) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="5.5" />
    <circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);
export const IconIron = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 13.5l4-4M6.5 9.5l1.5 1.5 5.5-5.5-1.5-1.5-5.5 5.5z" />
    <path d="M10.5 4l1.5 1.5" />
  </svg>
);
export const IconPlay = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 3.5v9l7.5-4.5L5 3.5z" fill="currentColor" stroke="none" />
  </svg>
);
export const IconNote = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 12V4l6-1.5v8" />
    <circle cx="4.5" cy="12" r="1.6" />
    <circle cx="10.5" cy="10.5" r="1.6" />
  </svg>
);

/** Emblema site-ului: un circuit integrat stilizat. */
export const Mark = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <rect width="32" height="32" rx="9" fill="#1b1915" />
    <rect x="10" y="10" width="12" height="12" rx="2.5" fill="#f7f2e7" />
    <g stroke="#f7f2e7" strokeWidth="2" strokeLinecap="round">
      <path d="M13 6v3M19 6v3M13 23v3M19 23v3M6 13h3M6 19h3M23 13h3M23 19h3" />
    </g>
    <circle cx="16" cy="16" r="2.3" fill="#2f9d57" />
  </svg>
);
