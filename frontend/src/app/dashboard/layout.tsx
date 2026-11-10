import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: "Your hours, earnings and recent activity at a glance.",
  alternates: { canonical: '/dashboard' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
