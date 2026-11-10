import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar',
  description: "See your shifts and logged hours by day.",
  alternates: { canonical: '/calendar' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
