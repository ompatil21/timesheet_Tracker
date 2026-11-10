import type { Metadata } from 'next';
import Link from 'next/link';
import { ScrapbookDefs, Scrap, Tape, Scribble } from '@/components/scrapbook';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="sb-page min-h-screen flex items-center justify-center px-4 py-16 font-type text-ink">
      <ScrapbookDefs />
      <div className="relative w-full max-w-md -rotate-1">
        <Tape className="-top-3 left-1/3 -rotate-2" />
        <Scrap paper="kraft" className="px-8 pt-12 pb-10 text-center">
          <p className="font-note text-lg uppercase tracking-widest text-ink-soft">Error 404</p>
          <h1 className="mt-2 font-hand font-bold text-6xl leading-none">Page not found</h1>
          <Scribble className="mx-auto mt-2 h-4 w-48 text-ink" />
          <p className="mt-6 text-[15px] leading-relaxed text-ink/80">
            We couldn&apos;t find the page you were looking for. It may have moved, or the link may be wrong.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 font-note text-lg uppercase tracking-wider">
            <Link href="/" className="group">
              <Scrap paper="ink" edge="rough" className="px-6 py-2.5 text-paper">Go home</Scrap>
            </Link>
            <Link href="/dashboard" className="sb-link py-2 hover:text-stamp hover:border-stamp transition-colors">
              Dashboard
            </Link>
          </div>
        </Scrap>
      </div>
    </main>
  );
}
