import type { CSSProperties, ReactNode } from 'react';

// Shared pieces of the scrapbook theme: torn paper, tape, and pen doodles.
// Paper styles themselves live in globals.css (.sb-*).

const PAPERS = {
  kraft: '#CFA77F',
  cream: '#F1EADB',
  white: '#FAF8F2',
  ink: '#1F1B16',
  blush: '#E5A4C3',
} as const;

/** SVG filters used by .sb-scrap / .sb-rough. Render once per page. */
export function ScrapbookDefs() {
  return (
    <svg aria-hidden className="absolute h-0 w-0">
      <defs>
        <filter id="sb-torn" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sb-rough" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

type ScrapProps = {
  paper?: keyof typeof PAPERS;
  /** 'torn' for ripped paper, 'rough' for a lightly uneven cut edge */
  edge?: 'torn' | 'rough';
  className?: string;
  children: ReactNode;
};

export function Scrap({ paper = 'kraft', edge = 'torn', className = '', children }: ScrapProps) {
  return (
    <div
      className={`${edge === 'torn' ? 'sb-scrap' : 'sb-rough'} ${className}`}
      style={{ '--scrap-bg': PAPERS[paper] } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function Tape({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`sb-tape ${className}`} />;
}

type DoodleProps = { className?: string };

const pen = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function Flower({ className = '' }: DoodleProps) {
  return (
    <svg aria-hidden viewBox="0 0 90 300" className={className} {...pen} strokeWidth={1.8}>
      {/* stems */}
      <path d="M34 62 C40 130 52 200 60 292" />
      <path d="M70 108 C64 150 60 200 60 250" />
      {/* leaves */}
      <path d="M52 200 C30 190 22 168 24 150 C40 158 52 176 52 200 Z" />
      <path d="M60 232 C80 220 86 200 84 184 C70 192 60 210 60 232 Z" />
      {/* big bloom */}
      <circle cx="34" cy="36" r="7" />
      <path d="M34 29 C28 14 40 14 34 29 M41 36 C56 30 56 42 41 36 M34 43 C40 58 28 58 34 43 M27 36 C12 42 12 30 27 36" />
      <path d="M39 31 C50 20 54 30 39 31 M39 41 C50 52 40 56 39 41 M29 41 C18 52 14 42 29 41 M29 31 C18 20 28 16 29 31" />
      {/* small bloom */}
      <circle cx="70" cy="92" r="5" />
      <path d="M70 87 C66 76 74 76 70 87 M75 92 C86 88 86 96 75 92 M70 97 C74 108 66 108 70 97 M65 92 C54 96 54 88 65 92" />
    </svg>
  );
}

export function Star({ className = '' }: DoodleProps) {
  return (
    <svg aria-hidden viewBox="0 0 60 60" className={className} {...pen}>
      <path d="M30 4 L31 56 M8 22 L53 40 M10 44 L50 14" />
    </svg>
  );
}

export function Scribble({ className = '' }: DoodleProps) {
  return (
    <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none" className={className} {...pen} strokeWidth={3}>
      <path d="M4 12 C60 4 150 6 296 8 M18 16 C90 9 190 12 270 13" />
    </svg>
  );
}

export function Arrow({ className = '' }: DoodleProps) {
  return (
    <svg aria-hidden viewBox="0 0 80 90" className={className} {...pen}>
      <path d="M70 84 C66 50 44 46 34 56 C24 68 44 74 46 56 C48 38 34 22 16 12" />
      <path d="M14 30 L14 10 L34 12" />
    </svg>
  );
}

export function Splat({ className = '' }: DoodleProps) {
  return (
    <svg aria-hidden viewBox="0 0 80 80" className={className} fill="currentColor">
      <path d="M40 22 C52 20 60 30 58 42 C57 54 46 60 36 57 C26 54 20 44 24 34 C27 26 32 23 40 22 Z" />
      <circle cx="14" cy="24" r="3" />
      <circle cx="66" cy="16" r="2" />
      <circle cx="70" cy="58" r="3.5" />
      <circle cx="20" cy="66" r="2.5" />
      <circle cx="46" cy="72" r="1.8" />
      <circle cx="8" cy="46" r="1.5" />
    </svg>
  );
}

export function Heart({ className = '' }: DoodleProps) {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className={className} {...pen}>
      <path d="M20 34 C6 22 4 10 13 8 C18 7 20 12 20 15 C21 10 26 5 31 9 C37 14 30 26 20 34 Z" />
    </svg>
  );
}

/** Round paper sticker with a pen smiley */
export function Smiley({ className = '' }: DoodleProps) {
  return (
    <svg aria-hidden viewBox="0 0 80 80" className={className}>
      <circle cx="40" cy="40" r="38" fill="#E5A4C3" />
      <g {...pen} stroke="#1F1B16" strokeWidth={2.4}>
        <path d="M31 26 L31 37 M49 25 L50 36" />
        <path d="M22 46 C28 62 54 62 59 44" />
      </g>
    </svg>
  );
}

/** Hand-drawn checkbox for lists on lined paper */
export function CheckBox({ checked = false, className = '' }: DoodleProps & { checked?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 28 28" className={className} {...pen}>
      <path d="M5 7 L21 6 L22 22 L6 23 Z" />
      {checked && <path d="M8 13 L13 19 L26 2" />}
    </svg>
  );
}

/** Pen circle drawn around something, slightly overshooting where it closes */
export function Ring({ className = '' }: DoodleProps) {
  return (
    <svg aria-hidden viewBox="0 0 44 44" preserveAspectRatio="none" className={className} {...pen} strokeWidth={1.6}>
      <path d="M30 5 C16 1 4 9 4 22 C4 35 15 41 25 40 C36 39 42 30 40 19 C38 9 28 3 17 6" />
    </svg>
  );
}

/** Quick pen tick */
export function Tick({ className = '' }: DoodleProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} {...pen} strokeWidth={3}>
      <path d="M4 13 L10 19 L21 4" />
    </svg>
  );
}

/** Wobbly horizontal pen rule */
export function Rule({ className = '' }: DoodleProps) {
  return (
    <svg aria-hidden viewBox="0 0 1200 8" preserveAspectRatio="none" className={className} {...pen} strokeWidth={1.6}>
      <path d="M2 4 C200 1 420 7 640 4 C860 1 1020 6 1198 3" />
    </svg>
  );
}
