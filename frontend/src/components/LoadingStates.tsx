'use client';

import type { CSSProperties } from 'react';
import Sidebar from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';

export function AppPageLoader({ label = 'Loading workspace' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-carbon md:pl-64 pb-20 md:pb-0 text-zinc-900 dark:text-white transition-colors">
      <Sidebar />
      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-8 py-7 shadow-lg backdrop-blur-sm text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-racing-red" />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {label}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export function InlineLoader({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </span>
  );
}

export function SkeletonBlock({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      style={style}
      className={`relative overflow-hidden rounded bg-zinc-200/80 dark:bg-zinc-800/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent dark:before:via-white/10 ${className}`}
    />
  );
}

export function SectionHeaderSkeleton() {
  return (
    <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
      <SkeletonBlock className="h-10 w-72 max-w-full" />
      <SkeletonBlock className="mt-3 h-4 w-48" />
    </div>
  );
}

export function FormPanelSkeleton() {
  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden backdrop-blur-sm">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
        <SkeletonBlock className="h-4 w-36" />
      </div>
      <div className="p-6 space-y-6">
        {[0, 1, 2].map((section) => (
          <div key={section} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 p-5">
            <div className="flex items-center gap-3 mb-5">
              <SkeletonBlock className="h-8 w-8 rounded-full" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SkeletonBlock className="h-12 w-full" />
              <SkeletonBlock className="h-12 w-full" />
            </div>
          </div>
        ))}
        <SkeletonBlock className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden backdrop-blur-sm">
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {Array.from({ length: rows }).map((_, index) => (
          <li key={index} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
              <SkeletonBlock className="h-4 w-48 max-w-full" />
              <SkeletonBlock className="h-3 w-32" />
              <SkeletonBlock className="h-3 w-64 max-w-full" />
            </div>
            <div className="flex items-center gap-4">
              <SkeletonBlock className="h-10 w-16" />
              <SkeletonBlock className="h-10 w-20" />
              <SkeletonBlock className="h-10 w-20" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white/60 dark:bg-zinc-900/40 p-8 rounded-xl shadow-2xl border border-white/20 dark:border-zinc-800/50 backdrop-blur-xl">
      <div className="flex justify-between items-start mb-6">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="h-6 w-16" />
      </div>
      <SkeletonBlock className="h-20 w-56 max-w-full mb-6" />
      <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-4">
        <SkeletonBlock className="h-3 w-32 mx-auto mb-4" />
        <div className="grid grid-cols-5 gap-3 h-40 items-end">
          {[70, 92, 55, 82, 64].map((height, index) => (
            <SkeletonBlock key={index} className="w-full rounded" style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
