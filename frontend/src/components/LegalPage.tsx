import Link from 'next/link';
import type { ReactNode } from 'react';
import { ScrapbookDefs, Scrap, Tape, Scribble, Rule } from '@/components/scrapbook';

type Props = { title: string; updated: string; children: ReactNode };

// Shared shell for /privacy and /terms, in the same paper style as the landing page.
export default function LegalPage({ title, updated, children }: Props) {
  return (
    <main className="sb-page min-h-screen overflow-x-hidden font-type text-ink">
      <ScrapbookDefs />
      <header className="mx-auto max-w-3xl px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between pb-4">
          <Link href="/" className="font-note text-2xl leading-[1.05] tracking-wide">
            Time<br /><span className="pl-3">Tracker</span>
          </Link>
          <Link href="/" className="sb-link py-2 font-note text-lg">Back home</Link>
        </div>
        <Rule className="h-2 w-full text-ink" />
      </header>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <div className="relative">
          <Tape className="-top-3 left-1/4 -rotate-2" />
          <Scrap paper="white" edge="rough" className="px-6 sm:px-10 pt-12 pb-10">
            <h1 className="font-hand font-bold text-5xl sm:text-6xl leading-none">{title}</h1>
            <Scribble className="mt-2 h-4 w-56 max-w-full text-ink" />
            <p className="mt-4 font-note text-lg text-ink-soft">Last updated {updated}</p>
            <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink/85 [&_h2]:font-hand [&_h2]:font-bold [&_h2]:text-3xl [&_h2]:text-ink [&_h2]:mt-10 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-stamp">
              {children}
            </div>
          </Scrap>
        </div>
      </section>

      <footer className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <Rule className="h-2 w-full text-ink" />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 font-note text-lg text-ink-soft">
          <span>© 2026 Time Tracker</span>
          <nav className="flex gap-5">
            <Link href="/privacy" className="hover:text-stamp transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-stamp transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
